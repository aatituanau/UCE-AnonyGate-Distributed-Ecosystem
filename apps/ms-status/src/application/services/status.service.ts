import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { PrismaStatusRepository } from "../../infrastructure/adapters/outbound/prisma/prisma-status.repository";
import { NotificationService } from "./notification.service";
import { CaseStatus } from "../../domain/entities/case-status.entity";
import { ComplaintStatus } from "../../domain/enums/complaint-status.enum";
import { UrgencyLevel } from "../../domain/enums/urgency-level.enum";
import {
  isValidTransition,
  getValidNextStates,
} from "../../domain/state-machine/status-transitions";
import { KAFKA_PRODUCER_PORT, type KafkaProducerPort } from "../../infrastructure/adapters/outbound/kafka/kafka-producer.adapter";

/**
 * Core business logic for managing complaint statuses.
 */
@Injectable()
export class StatusService {
  constructor(
    private readonly repository: PrismaStatusRepository,
    private readonly notificationService: NotificationService,
    @Inject(KAFKA_PRODUCER_PORT) private readonly kafkaProducer: KafkaProducerPort,
  ) {}

  /**
   * Initializes a new case status for a given complaint.
   * Called by the Kafka consumer when a 'complaint.created' event is received.
   */
  async initializeCase(complaintId: string): Promise<void> {
    const existing = await this.repository.findByComplaintId(complaintId);
    if (existing) {
      return; // Idempotency
    }

    const now = new Date();
    const caseStatus = new CaseStatus(
      uuidv4(),
      complaintId,
      ComplaintStatus.SUBMITTED,
      UrgencyLevel.LOW, // Default, will be updated by AI
      null,
      now,
      now,
    );

    await this.repository.createCaseStatus(caseStatus);

    // Create initial history record
    const history = {
      id: uuidv4(),
      caseId: caseStatus.id,
      fromStatus: "NONE",
      toStatus: ComplaintStatus.SUBMITTED,
      changedBy: "SYSTEM",
      changedAt: new Date(),
    };
    await this.repository.createHistory(history);

    this.notificationService.notifyNewComplaint(caseStatus);
  }

  /**
   * Transitions a case to a new status, enforcing state machine rules.
   */
  async transitionStatus(
    complaintId: string,
    newStatus: string,
    analystId: string,
  ): Promise<void> {
    let caseStatus = await this.repository.findByComplaintId(complaintId);

    // [SRE/Resilience] Self-healing mechanism: Lazy initialization
    // If ms-status missed the Kafka event (or complaint was created before ms-status existed),
    // we initialize it on the fly instead of throwing a 404 error.
    if (!caseStatus) {
      await this.initializeCase(complaintId);
      caseStatus = await this.repository.findByComplaintId(complaintId);
      if (!caseStatus) {
        throw new NotFoundException(
          `Failed to lazy-initialize case status for complaint ${complaintId}`,
        );
      }
    }

    const fromStatus = caseStatus.status as ComplaintStatus;
    const targetStatus = newStatus as ComplaintStatus;

    if (!isValidTransition(fromStatus, targetStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${fromStatus} to ${targetStatus}`,
      );
    }

    await this.repository.updateStatus(caseStatus.id, targetStatus, analystId);

    const history = {
      id: uuidv4(),
      caseId: caseStatus.id,
      fromStatus: fromStatus,
      toStatus: targetStatus,
      changedBy: analystId,
      changedAt: new Date(),
    };
    await this.repository.createHistory(history);

    const updatedCase = await this.repository.findByComplaintId(complaintId);
    
    // Publish domain event to Kafka for Audit Trail and others
    await this.kafkaProducer.emitStatusUpdated(complaintId, targetStatus, {
      fromStatus,
      toStatus: targetStatus,
      analystId,
      updatedAt: updatedCase!.updatedAt,
    });

    this.notificationService.notifyStatusUpdate(updatedCase!, fromStatus);
  }

  /**
   * Updates the urgency of a case.
   * Called by the RabbitMQ consumer when an 'ai.analysis.results' event is received.
   */
  async updateUrgency(complaintId: string, urgency: string): Promise<void> {
    const caseStatus = await this.repository.findByComplaintId(complaintId);
    if (!caseStatus) {
      throw new NotFoundException(
        `Case status for complaint ${complaintId} not found`,
      );
    }

    await this.repository.updateUrgency(complaintId, urgency);

    const updatedCase = await this.repository.findByComplaintId(complaintId);

    if (
      urgency === (UrgencyLevel.HIGH as string) ||
      urgency === (UrgencyLevel.CRITICAL as string)
    ) {
      void this.notificationService.notifyCriticalAlert(updatedCase!);
    }
  }

  /**
   * Gets a single case by complaint ID.
   */
  async getCaseByComplaintId(complaintId: string) {
    let caseStatus = await this.repository.findByComplaintId(complaintId);

    // [SRE/Resilience] Self-healing mechanism: Lazy initialization
    if (!caseStatus) {
      await this.initializeCase(complaintId);
      caseStatus = await this.repository.findByComplaintId(complaintId);
      if (!caseStatus) {
        throw new NotFoundException(
          `Failed to lazy-initialize case status for complaint ${complaintId}`,
        );
      }
    }

    const nextStates = getValidNextStates(caseStatus.status as ComplaintStatus);
    const history = await this.repository.findHistoryByCaseId(caseStatus.id);

    return {
      ...caseStatus,
      validNextStates: nextStates,
      history,
    };
  }

  /**
   * Gets critical cases (HIGH or CRITICAL urgency, not closed/rejected).
   */
  async getCriticalCases(): Promise<CaseStatus[]> {
    return this.repository.findCriticalCases();
  }
}

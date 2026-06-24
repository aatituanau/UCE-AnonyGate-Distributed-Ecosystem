import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CaseStatus } from '../../../../domain/entities/case-status.entity';
import { StatusHistory } from '../../../../generated/prisma';

/**
 * Repository to handle operations on CaseStatus and StatusHistory.
 * Acts as an Outbound Adapter mapping Prisma models to Domain Entities.
 */
@Injectable()
export class PrismaStatusRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initializes a new case status for a given complaint.
   */
  async createCaseStatus(caseStatus: CaseStatus): Promise<void> {
    await this.prisma.caseStatus.create({
      data: {
        id: caseStatus.id,
        complaintId: caseStatus.complaintId,
        status: caseStatus.status,
        urgency: caseStatus.urgency,
        assignedTo: caseStatus.assignedTo,
        createdAt: caseStatus.createdAt,
        updatedAt: caseStatus.updatedAt,
      },
    });
  }

  /**
   * Finds the case status by complaint ID.
   */
  async findByComplaintId(complaintId: string): Promise<CaseStatus | null> {
    const record = await this.prisma.caseStatus.findUnique({
      where: { complaintId },
    });

    if (!record) return null;

    return new CaseStatus(
      record.id,
      record.complaintId,
      record.status,
      record.urgency,
      record.assignedTo,
      record.createdAt,
      record.updatedAt,
    );
  }

  /**
   * Updates the status of a case.
   */
  async updateStatus(id: string, newStatus: string, assignedTo?: string): Promise<void> {
    await this.prisma.caseStatus.update({
      where: { id },
      data: {
        status: newStatus,
        assignedTo: assignedTo !== undefined ? assignedTo : undefined,
      },
    });
  }

  /**
   * Updates the urgency of a case.
   */
  async updateUrgency(complaintId: string, newUrgency: string): Promise<void> {
    await this.prisma.caseStatus.update({
      where: { complaintId },
      data: {
        urgency: newUrgency,
      },
    });
  }

  /**
   * Finds all cases with critical urgency levels.
   */
  async findCriticalCases(): Promise<CaseStatus[]> {
    const records = await this.prisma.caseStatus.findMany({
      where: {
        urgency: {
          in: ['HIGH', 'CRITICAL'],
        },
        status: {
          notIn: ['CLOSED', 'REJECTED'],
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return records.map(
      (r) =>
        new CaseStatus(
          r.id,
          r.complaintId,
          r.status,
          r.urgency,
          r.assignedTo,
          r.createdAt,
          r.updatedAt,
        ),
    );
  }

  /**
   * Logs a state transition history record.
   */
  async createHistory(history: StatusHistory): Promise<void> {
    await this.prisma.statusHistory.create({
      data: {
        id: history.id,
        caseId: history.caseId,
        fromStatus: history.fromStatus,
        toStatus: history.toStatus,
        changedBy: history.changedBy,
        changedAt: history.changedAt,
      },
    });
  }
}

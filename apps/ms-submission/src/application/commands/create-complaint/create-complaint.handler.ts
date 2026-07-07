import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateComplaintCommand } from './create-complaint.command';
import { Inject, BadRequestException } from '@nestjs/common';
import { COMPLAINT_REPOSITORY } from '../../../domain/ports/outbound/complaint.repository.port';
import type { ComplaintRepositoryPort } from '../../../domain/ports/outbound/complaint.repository.port';
import { ALIAS_SERVICE_PORT } from '../../../domain/ports/outbound/alias.service.port';
import type { AliasServicePort } from '../../../domain/ports/outbound/alias.service.port';
import { EVENT_BUS_PORT } from '../../../domain/ports/outbound/event-bus.port';
import type { EventBusPort } from '../../../domain/ports/outbound/event-bus.port';
import { NLP_EVENT_BUS_PORT } from '../../../domain/ports/outbound/nlp-event-bus.port';
import type { NlpEventBusPort } from '../../../domain/ports/outbound/nlp-event-bus.port';
import { Complaint } from '../../../domain/entities/complaint.entity';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(CreateComplaintCommand)
export class CreateComplaintHandler implements ICommandHandler<CreateComplaintCommand> {
  constructor(
    @Inject(COMPLAINT_REPOSITORY)
    private readonly complaintRepository: ComplaintRepositoryPort,
    @Inject(ALIAS_SERVICE_PORT)
    private readonly aliasService: AliasServicePort,
    @Inject(EVENT_BUS_PORT)
    private readonly eventBus: EventBusPort,
    @Inject(NLP_EVENT_BUS_PORT)
    private readonly nlpEventBus: NlpEventBusPort,
  ) {}

  async execute(command: CreateComplaintCommand): Promise<Complaint> {
    // 1. Validate token via gRPC
    const isValid = await this.aliasService.validateToken(command.aliasToken);
    if (!isValid) {
      throw new BadRequestException('Invalid alias token');
    }

    // 2. Create entity
    const complaint = new Complaint(
      uuidv4(),
      command.aliasToken,
      command.payload,
      'RECEIVED',
      new Date(),
    );

    // 3. Save to database
    const savedComplaint = await this.complaintRepository.save(complaint);

    // 4. Publish Event (EDA)
    await this.eventBus.publish('complaint.created', {
      complaintId: savedComplaint.id,
      aliasToken: savedComplaint.aliasToken,
      status: savedComplaint.status,
      timestamp: savedComplaint.createdAt,
    });

    // 5. Publish NLP Analysis Request to RabbitMQ
    const complaintText = JSON.stringify(command.payload);
    await this.nlpEventBus.publishNlpRequested(
      savedComplaint.id,
      savedComplaint.aliasToken,
      complaintText,
    );

    return savedComplaint;
  }
}

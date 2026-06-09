import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ComplaintController } from '../adapters/inbound/http/complaint.controller';
import { CreateComplaintHandler } from '../../application/commands/create-complaint/create-complaint.handler';
import { GetComplaintHandler } from '../../application/queries/get-complaint/get-complaint.handler';
import { COMPLAINT_REPOSITORY } from '../../domain/ports/outbound/complaint.repository.port';
import { PrismaComplaintRepository } from '../adapters/outbound/prisma/prisma-complaint.repository';
import { PrismaService } from '../adapters/outbound/prisma/prisma.service';
import { EVENT_BUS_PORT } from '../../domain/ports/outbound/event-bus.port';
import { KafkaEventBusAdapter } from '../adapters/outbound/kafka/kafka-event-bus.adapter';
import { ALIAS_SERVICE_PORT } from '../../domain/ports/outbound/alias.service.port';
import { GrpcAliasAdapter } from '../adapters/outbound/grpc/grpc-alias.adapter';

@Module({
  imports: [CqrsModule],
  controllers: [ComplaintController],
  providers: [
    CreateComplaintHandler,
    GetComplaintHandler,
    PrismaService,
    { provide: COMPLAINT_REPOSITORY, useClass: PrismaComplaintRepository },
    { provide: EVENT_BUS_PORT, useClass: KafkaEventBusAdapter },
    { provide: ALIAS_SERVICE_PORT, useClass: GrpcAliasAdapter },
  ],
})
export class SubmissionModule {}

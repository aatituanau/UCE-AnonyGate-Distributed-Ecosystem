import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditEvent, AuditEventSchema } from './schemas/audit-event.schema';
import { AuditArchive, AuditArchiveSchema } from './schemas/audit-archive.schema';
import { AuditService } from './audit.service';
import { KafkaConsumerAdapter } from '../infrastructure/adapters/inbound/kafka/kafka-consumer.adapter';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditEvent.name, schema: AuditEventSchema },
      { name: AuditArchive.name, schema: AuditArchiveSchema },
    ]),
  ],
  controllers: [],
  providers: [AuditService, KafkaConsumerAdapter],
})
export class AuditModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuditEvent, AuditEventSchema } from './schemas/audit-event.schema';
import { AuditArchive, AuditArchiveSchema } from './schemas/audit-archive.schema';
import { AuditService } from './audit.service';
import { KafkaConsumerAdapter } from '../infrastructure/adapters/inbound/kafka/kafka-consumer.adapter';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuditController } from './audit.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      { name: AuditEvent.name, schema: AuditEventSchema },
      { name: AuditArchive.name, schema: AuditArchiveSchema },
    ]),
  ],
  controllers: [AuditController],
  providers: [AuditService, KafkaConsumerAdapter, JwtStrategy],
})
export class AuditModule {}

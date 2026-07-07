import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvidenceController } from './controllers/evidence.controller';
import { EvidenceService } from './services/evidence.service';
import { S3Service } from './services/s3.service';
import { EvidenceRepository } from './repositories/evidence.repository';
import { Evidence, EvidenceSchema } from './schemas/evidence.schema';
import { KafkaProducerAdapter } from './adapters/kafka-producer.adapter';
import { JwtStrategy } from './guards/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Evidence.name, schema: EvidenceSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [EvidenceController],
  providers: [
    EvidenceService,
    S3Service,
    EvidenceRepository,
    KafkaProducerAdapter,
    JwtStrategy,
  ],
})
export class EvidenceModule {}

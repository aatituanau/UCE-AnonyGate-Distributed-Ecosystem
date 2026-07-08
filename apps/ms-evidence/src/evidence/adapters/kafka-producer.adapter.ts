import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerAdapter implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerAdapter.name);
  private readonly kafka: Kafka;
  private readonly producer: Producer;

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService.get<string>('KAFKA_BROKERS') || 'localhost:9092';
    this.kafka = new Kafka({
      clientId: 'ms-evidence',
      brokers: brokers.split(','),
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Successfully connected to Kafka as Producer');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Disconnected from Kafka');
  }

  // Publishes the complaint.evidence.uploaded event
  async publishEvidenceUploadedEvent(payload: {
    complaintId: string;
    originalName: string;
    mimeType: string;
    size: number;
    s3Key: string;
  }) {
    try {
      await this.producer.send({
        topic: 'complaint.evidence.uploaded',
        messages: [{ value: JSON.stringify(payload) }],
      });
      this.logger.log(`Event complaint.evidence.uploaded published for complaintId: ${payload.complaintId}`);
    } catch (error) {
      this.logger.error(`Failed to publish event for complaintId: ${payload.complaintId}`, error);
      throw error;
    }
  }
}

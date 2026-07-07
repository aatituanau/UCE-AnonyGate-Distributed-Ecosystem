import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { EventBusPort } from '../../../../domain/ports/outbound/event-bus.port';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KafkaEventBusAdapter
  implements EventBusPort, OnModuleInit, OnModuleDestroy
{
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private readonly logger = new Logger(KafkaEventBusAdapter.name);

  constructor(private readonly prisma: PrismaService) {
    this.kafka = new Kafka({
      clientId: 'ms-submission',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'ms-submission-mock-consumer' });
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Successfully connected Producer to Kafka');
      
      // TEMPORARY MOCK CONSUMER
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: 'complaint.status.updated', fromBeginning: false });
      
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const payload = JSON.parse(message.value?.toString() || '{}');
            if (payload.complaintId && payload.status) {
              await this.prisma.complaint.update({
                where: { id: payload.complaintId },
                data: { status: payload.status }
              });
              this.logger.log(`[CQRS SYNC] Updated complaint ${payload.complaintId} status to ${payload.status}`);
            }
          } catch (err) {
            this.logger.error('Error in mock consumer sync', err);
          }
        },
      });
      this.logger.log('Started MOCK CONSUMER for complaint.status.updated');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka on startup:', error);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async publish(topic: string, event: any): Promise<void> {
    this.logger.log(
      `[EVENT OUT] Publishing event to topic "${topic}": ${JSON.stringify(event)}`,
    );
    try {
      await this.producer.connect(); // Ensure it's connected before sending
    } catch (e) {
      this.logger.warn(
        `Producer reconnection attempt: ${(e as Error).message}`,
      );
    }
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(event) }],
    });
    this.logger.log(`[EVENT OUT] Successfully published to topic "${topic}"`);
  }
}

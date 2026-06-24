import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { EventBusPort } from '../../../../domain/ports/outbound/event-bus.port';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaEventBusAdapter
  implements EventBusPort, OnModuleInit, OnModuleDestroy
{
  private kafka: Kafka;
  private producer: Producer;
  private readonly logger = new Logger(KafkaEventBusAdapter.name);

  constructor() {
    this.kafka = new Kafka({
      clientId: 'ms-submission',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Successfully connected Producer to Kafka');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka on startup:', error);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
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

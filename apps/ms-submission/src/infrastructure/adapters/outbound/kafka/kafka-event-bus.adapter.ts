import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventBusPort } from '../../../../domain/ports/outbound/event-bus.port';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaEventBusAdapter implements EventBusPort, OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'ms-submission',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publish(topic: string, event: any): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        { value: JSON.stringify(event) }
      ],
    });
  }
}

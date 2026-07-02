import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { AuditService } from '../../../../audit/audit.service';

@Injectable()
export class KafkaConsumerAdapter implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer;

  constructor(private readonly auditService: AuditService) {
    const kafka = new Kafka({
      clientId: 'ms-audit-client',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });

    this.consumer = kafka.consumer({ groupId: 'audit-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    
    // Subscribe to all required topics
    const topics = [
      'complaint.created',
      'ai.analysis.completed',
      'sanitization.completed',
      'complaint.status.updated',
    ];

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: true });
    }

    console.log('[ms-audit] Subscribed to topics:', topics);

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;

        try {
          const payload = JSON.parse(message.value.toString());
          await this.auditService.processEvent(topic, payload);
          console.log(`[ms-audit] Event processed from topic: ${topic}`);
        } catch (error) {
          console.error(`[ms-audit] Error processing event from topic ${topic}:`, error);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}

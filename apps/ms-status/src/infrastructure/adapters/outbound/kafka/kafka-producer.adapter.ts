import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Producer, Partitioners } from "kafkajs";

/**
 * Port interface for the Kafka Producer.
 */
export interface KafkaProducerPort {
  emitStatusUpdated(complaintId: string, status: string, payload: Record<string, unknown>): Promise<void>;
}

export const KAFKA_PRODUCER_PORT = Symbol("KAFKA_PRODUCER_PORT");

/**
 * Adapter to publish events to Kafka.
 */
@Injectable()
export class KafkaProducerAdapter implements OnModuleInit, OnModuleDestroy, KafkaProducerPort {
  private readonly logger = new Logger(KafkaProducerAdapter.name);
  private readonly kafka: Kafka;
  private readonly producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: "ms-status-producer",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });
    // Create producer with legacy partitioner to avoid kafkajs warning
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner
    });
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log("Successfully connected Producer to Kafka broker");
    } catch (error) {
      this.logger.error(`Failed to connect Producer to Kafka: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      this.logger.log("Disconnected Producer from Kafka broker");
    } catch (error) {
      this.logger.error(`Error disconnecting Producer from Kafka: ${(error as Error).message}`);
    }
  }

  async emitStatusUpdated(complaintId: string, status: string, payload: Record<string, unknown>): Promise<void> {
    try {
      const message = {
        complaintId,
        status,
        payload,
        timestamp: new Date().toISOString(),
      };

      await this.producer.send({
        topic: "complaint.status.updated",
        messages: [{ value: JSON.stringify(message) }],
      });

      this.logger.log(`Published 'complaint.status.updated' event for complaint ${complaintId} (new status: ${status})`);
    } catch (error) {
      this.logger.error(`Failed to publish 'complaint.status.updated' event: ${(error as Error).message}`);
      // Consider re-throwing or handling via a resilient outbox pattern in a production setting
    }
  }
}

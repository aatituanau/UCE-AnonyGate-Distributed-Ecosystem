import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { Kafka, Consumer } from "kafkajs";
import { StatusService } from "../../../../application/services/status.service";

/**
 * Kafka Consumer for the 'complaint.created' topic.
 * When ms-submission publishes a new complaint, this consumer initializes its status.
 */
@Injectable()
export class ComplaintCreatedConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ComplaintCreatedConsumer.name);
  private consumer: Consumer;
  private readonly kafka: Kafka;

  constructor(private readonly statusService: StatusService) {
    this.kafka = new Kafka({
      clientId: "ms-status-client",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });

    // Unique consumer group for the status service
    this.consumer = this.kafka.consumer({ groupId: "ms-status-group" });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      this.logger.log("Successfully connected to Kafka broker");

      await this.consumer.subscribe({
        topic: "complaint.created",
        fromBeginning: true, // Process missed messages on startup
      });

      await this.consumer.run({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        eachMessage: async ({ topic, partition: _partition, message }) => {
          if (!message.value) return;

          try {
            const payload = JSON.parse(message.value.toString());
            this.logger.log(
              `Received message on ${topic}: complaintId=${payload.complaintId}`,
            );

            // Initialize the case in the status database
            await this.statusService.initializeCase(payload.complaintId);
          } catch (error) {
            this.logger.error(
              `Error processing Kafka message: ${(error as Error).message}`,
            );
            // In a production system, we would publish to a Dead Letter Queue (DLQ) here
          }
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to connect to Kafka broker: ${(error as Error).message}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    this.logger.log("Disconnected from Kafka broker");
  }
}

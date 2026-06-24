import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import * as amqp from "amqplib";
import { StatusService } from "../../../../application/services/status.service";

/**
 * RabbitMQ Consumer for the 'ai.analysis.results' queue.
 * Listens for urgency classification from MS-07 (AI Insight Service).
 */
@Injectable()
export class AiAnalysisConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiAnalysisConsumer.name);
  private connection: any = null;
  private channel: any = null;
  private readonly queueName = "ai.analysis.results";

  constructor(private readonly statusService: StatusService) {}

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(retries = 5, delayMs = 5000) {
    const rabbitUrl =
      process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

    for (let i = 0; i < retries; i++) {
      try {
        this.connection = await amqp.connect(rabbitUrl);
        this.channel = await this.connection.createChannel();

        await this.channel.assertQueue(this.queueName, { durable: true });
        this.logger.log(
          `Conexión exitosa con RabbitMQ y cola activada.: ${this.queueName}`,
        );

        await this.channel.consume(this.queueName, async (msg) => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              this.logger.log(
                `Análisis de IA recibido para queja: ${content.complaintId}, Urgency: ${content.urgency}`,
              );

              await this.statusService.updateUrgency(
                content.complaintId,
                content.urgency,
              );

              this.channel?.ack(msg);
            } catch (err) {
              this.logger.error(
                `Error al procesar el mensaje de RabbitMQ: ${(err as Error).message}`,
              );
              // Nack the message if it's a transient error, otherwise we might want to dead-letter it
              this.channel?.nack(msg, false, false);
            }
          }
        });

        return; // Success, exit retry loop
      } catch (error) {
        this.logger.warn(
          `No se pudo conectar con RabbitMQ. (attempt ${i + 1}/${retries}): ${(error as Error).message}`,
        );
        if (i < retries - 1) {
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }
    }

    this.logger.error(
      "No se pudo conectar a RabbitMQ tras varios intentos. El servicio continuará sin el consumidor de RabbitMQ.",
    );
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log("Desconectado de RabbitMQ");
    } catch (error) {
      this.logger.error(
        `Error al desconectarse de RabbitMQ: ${(error as Error).message}`,
      );
    }
  }
}

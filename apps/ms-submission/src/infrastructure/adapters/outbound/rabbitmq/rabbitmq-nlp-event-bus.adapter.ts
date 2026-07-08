import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { NlpEventBusPort } from '../../../../domain/ports/outbound/nlp-event-bus.port';

@Injectable()
export class RabbitMqNlpEventBusAdapter
  implements NlpEventBusPort, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMqNlpEventBusAdapter.name);
  private connection: any = null;
  private channel: any = null;
  private readonly queueName = 'complaint.nlp.requested';

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(retries = 5, delayMs = 5000) {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

    for (let i = 0; i < retries; i++) {
      try {
        this.connection = await amqp.connect(rabbitUrl);
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(this.queueName, { durable: true });
        this.logger.log(`Conexión exitosa con RabbitMQ (Producer). Cola: ${this.queueName}`);
        return;
      } catch (error) {
        this.logger.warn(`Error al conectar con RabbitMQ (Intento ${i + 1}/${retries}): ${(error as Error).message}`);
        if (i < retries - 1) {
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }
    }
    this.logger.error('No se pudo conectar a RabbitMQ tras varios intentos.');
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('Desconectado de RabbitMQ');
    } catch (error) {
      this.logger.error(`Error al desconectarse de RabbitMQ: ${(error as Error).message}`);
    }
  }

  async publishNlpRequested(
    complaintId: string,
    aliasToken: string,
    text: string,
  ): Promise<void> {
    if (!this.channel) {
      this.logger.error('No channel available to publish NLP event');
      return;
    }

    const payload = {
      complaintId,
      aliasToken,
      text,
      timestamp: new Date().toISOString(),
    };

    try {
      this.channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );
      this.logger.log(`Evento complaint.nlp.requested publicado para el caso ${complaintId}`);
    } catch (error) {
      this.logger.error(`Error publicando evento NLP: ${(error as Error).message}`);
    }
  }
}

import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import * as mqtt from "mqtt";

/**
 * Service to publish critical alerts to the MQTT broker.
 * Used for real-time mobile push notifications for analysts.
 */
@Injectable()
export class MqttAlertService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttAlertService.name);
  private client: mqtt.MqttClient | null = null;
  private readonly topic = "alerts/analyst/critical";

  async onModuleInit() {
    const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";

    this.client = mqtt.connect(brokerUrl, {
      reconnectPeriod: 5000, // Retry every 5 seconds if disconnected
    });

    this.client.on("connect", () => {
      this.logger.log(`Connected to MQTT broker at ${brokerUrl}`);
    });

    this.client.on("error", (err) => {
      this.logger.error(`MQTT connection error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      this.client.end();
      this.logger.log("Disconnected from MQTT broker");
    }
  }

  /**
   * Publishes a critical alert to the MQTT topic.
   */
  publishAlert(payload: Record<string, any>) {
    if (this.client && this.client.connected) {
      this.client.publish(
        this.topic,
        JSON.stringify(payload),
        { qos: 1 },
        (err) => {
          if (err) {
            this.logger.error(`Failed to publish MQTT alert: ${err.message}`);
          } else {
            this.logger.log(`Published critical alert to topic: ${this.topic}`);
          }
        },
      );
    } else {
      this.logger.warn("Cannot publish MQTT alert: Client is not connected");
    }
  }
}

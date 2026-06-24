import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

// Application
import { StatusService } from "../../application/services/status.service";
import { NotificationService } from "../../application/services/notification.service";

// Infrastructure (Inbound)
import { StatusController } from "../adapters/inbound/http/status.controller";
import { ComplaintCreatedConsumer } from "../adapters/inbound/kafka/complaint-created.consumer";
import { AiAnalysisConsumer } from "../adapters/inbound/rabbitmq/ai-analysis.consumer";
import { StatusGateway } from "../adapters/inbound/websocket/status.gateway";

// Infrastructure (Outbound)
import { PrismaService } from "../adapters/outbound/prisma/prisma.service";
import { PrismaStatusRepository } from "../adapters/outbound/prisma/prisma-status.repository";
import { RedisSessionService } from "../adapters/outbound/redis/redis-session.service";
import { MqttAlertService } from "../adapters/outbound/mqtt/mqtt-alert.service";

// Common
import { JwtStrategy } from "../../common/strategies/jwt.strategy";
import { AliasTokenGuard } from "../../common/guards/alias-token.guard";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

/**
 * Main module for the Status microservice.
 * Wires together all EDA, Layered, and State Machine components.
 */
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [StatusController],
  providers: [
    // Application Services
    StatusService,
    NotificationService,

    // Inbound Adapters (Consumers/Gateways)
    ComplaintCreatedConsumer,
    AiAnalysisConsumer,
    StatusGateway,

    // Outbound Adapters (Repositories/External Services)
    PrismaService,
    PrismaStatusRepository,
    RedisSessionService,
    MqttAlertService,

    // Common (Guards/Strategies)
    JwtStrategy,
    AliasTokenGuard,
    JwtAuthGuard,
  ],
  exports: [],
})
export class StatusModule {}

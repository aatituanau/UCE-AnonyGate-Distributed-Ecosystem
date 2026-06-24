import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { RedisSessionService } from "../../outbound/redis/redis-session.service";
import { JwtService } from "@nestjs/jwt";

/**
 * WebSocket Gateway for emitting real-time updates to Analysts.
 */
@WebSocketGateway({
  cors: {
    origin: "*", // In production, restrict this to the frontend domains
  },
  path: "/ws/status",
})
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(StatusGateway.name);

  constructor(
    private readonly redisSession: RedisSessionService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract JWT from query param or auth header
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token || typeof token !== "string") {
        throw new Error("Authentication token missing");
      }

      // Verify token
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const userId = payload.sub;
      if (!userId) {
        throw new Error("Invalid token payload");
      }

      // Attach userId to the socket object for future reference
      client.data.userId = userId;

      // Register session in Redis
      await this.redisSession.registerSession(userId, client.id);

      // Join a room specific to this user to allow targeted messages if needed
      void client.join(`user:${userId}`);
      // Join the general analyst room to receive broadcasts
      void client.join("analysts");

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.warn(`Connection rejected: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      await this.redisSession.removeSession(userId, client.id);
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    }
  }

  /**
   * Emits a new complaint event to all connected analysts.
   */
  emitNewComplaint(payload: Record<string, any>) {
    this.server.to("analysts").emit("new_complaint", payload);
  }

  /**
   * Emits a status update event to all connected analysts.
   */
  emitStatusUpdate(payload: Record<string, any>) {
    this.server.to("analysts").emit("status_updated", payload);
  }

  /**
   * Emits a critical alert to all connected analysts.
   */
  emitCriticalAlert(payload: Record<string, any>) {
    this.server.to("analysts").emit("critical_alert", payload);
  }
}

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Service to manage WebSocket sessions using Redis.
 * This allows horizontal scaling of the status service.
 */
@Injectable()
export class RedisSessionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisSessionService.name);
  private redisClient: Redis;

  async onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD || 'anonygate_pass';

    this.redisClient = new Redis({
      host,
      port,
      password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redisClient.on('connect', () => {
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    });

    this.redisClient.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
      this.logger.log('Disconnected from Redis');
    }
  }

  /**
   * Registers a user's WebSocket connection.
   */
  async registerSession(userId: string, socketId: string): Promise<void> {
    await this.redisClient.sadd(`ws:user:${userId}`, socketId);
    // Expire the key after 24 hours to prevent stale data
    await this.redisClient.expire(`ws:user:${userId}`, 86400); 
  }

  /**
   * Removes a user's WebSocket connection.
   */
  async removeSession(userId: string, socketId: string): Promise<void> {
    await this.redisClient.srem(`ws:user:${userId}`, socketId);
  }

  /**
   * Checks if a user has any active WebSocket connections.
   */
  async isUserOnline(userId: string): Promise<boolean> {
    const count = await this.redisClient.scard(`ws:user:${userId}`);
    return count > 0;
  }
}

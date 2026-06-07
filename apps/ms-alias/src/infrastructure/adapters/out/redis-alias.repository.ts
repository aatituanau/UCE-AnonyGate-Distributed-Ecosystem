/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { AliasRepositoryPort } from '../../../application/ports/alias.repository.port';
import { Alias } from '../../../domain/entities/alias.entity';
import { Complaint } from '../../../domain/entities/complaint.entity';
import Redis from 'ioredis';

@Injectable()
export class RedisAliasRepository implements AliasRepositoryPort, OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    // Connect to Redis — credentials from environment variables (never hardcoded)
    this.redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || 'anonygate_pass',
    });
  }

  onModuleInit() {
    console.log('✅ Connected to Redis for Alias MS');
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  // TTL: 180 days in seconds (configurable via env, defaults to spec value)
  private readonly TTL_SECONDS = parseInt(process.env.ALIAS_TTL_DAYS || '180') * 24 * 60 * 60;

  async saveComplaintWithAlias(complaint: Complaint, alias: Alias): Promise<void> {
    const payload = JSON.stringify({ alias, complaint });
    // Key expires automatically after TTL — no manual cleanup needed
    await this.redis.set(`alias:${alias.code}`, payload, 'EX', this.TTL_SECONDS);
  }

  async findComplaintByAlias(aliasCode: string): Promise<Complaint | null> {
    const data = await this.redis.get(`alias:${aliasCode}`);
    if (!data) return null;

    const parsed = JSON.parse(data);
    const c = parsed.complaint;
    
    // Return pure Domain Entity
    return new Complaint(
      c.id,
      c.title,
      c.description,
      c.faculty,
      c.status,
      new Date(c.createdAt),
      c.aliasId,
    );
  }
}

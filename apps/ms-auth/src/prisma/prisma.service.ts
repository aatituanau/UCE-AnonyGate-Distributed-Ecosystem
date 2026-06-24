import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 1. Get the connection string from environment
    const connectionString = process.env.DATABASE_URL;

    // 2. Create a connection pool using the official 'pg' driver
    const pool = new Pool({ connectionString });

    // 3. Create the Prisma adapter wrapping the pool
    const adapter = new PrismaPg(pool);

    // 4. Pass the adapter to the Prisma Client
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

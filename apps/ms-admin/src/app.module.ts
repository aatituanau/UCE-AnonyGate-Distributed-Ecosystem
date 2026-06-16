import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AdminController } from './infrastructure/controllers/admin.controller';
import { LegacyIntegrationController } from './infrastructure/soap/legacy-integration.controller';
import { GetComplaintsHandler } from './domain/queries/get-complaints.handler';
import { CreateAnalystHandler } from './domain/commands/create-analyst.handler';

const CommandHandlers = [CreateAnalystHandler];
const QueryHandlers = [GetComplaintsHandler];

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CqrsModule, PrismaModule],
  controllers: [AdminController, LegacyIntegrationController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { SubmissionModule } from './infrastructure/module/submission.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    SubmissionModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 30,
    }]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

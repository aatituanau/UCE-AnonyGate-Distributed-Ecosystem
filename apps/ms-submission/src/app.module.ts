import { Module } from '@nestjs/common';
import { SubmissionModule } from './infrastructure/module/submission.module';

@Module({
  imports: [SubmissionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

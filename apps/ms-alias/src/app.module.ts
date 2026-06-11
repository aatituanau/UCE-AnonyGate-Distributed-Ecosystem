import { Module } from '@nestjs/common';
import { AliasModule } from './alias.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    AliasModule,
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
export class AppModule { }

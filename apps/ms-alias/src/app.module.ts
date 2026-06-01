import { Module } from '@nestjs/common';
import { AliasModule } from './alias.module';

@Module({
  imports: [AliasModule],
  controllers: [],
  providers: [],
})
export class AppModule { }

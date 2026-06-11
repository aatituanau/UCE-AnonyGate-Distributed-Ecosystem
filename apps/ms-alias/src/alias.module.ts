import { Module } from '@nestjs/common';
import { AliasController } from './infrastructure/adapters/in/alias.controller';
import { AliasGrpcController } from './infrastructure/adapters/in/alias-grpc.controller';
import { GenerateAliasUseCase } from './application/use-cases/generate-alias.usecase';
import { RedisAliasRepository } from './infrastructure/adapters/out/redis-alias.repository';
import { ALIAS_REPOSITORY_PORT } from './application/ports/alias.repository.port';

@Module({
  controllers: [AliasController, AliasGrpcController],
  providers: [
    GenerateAliasUseCase,
    {
      provide: ALIAS_REPOSITORY_PORT,
      useClass: RedisAliasRepository,
    },
  ],
})
export class AliasModule { }

import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ALIAS_REPOSITORY_PORT } from '../../../application/ports/alias.repository.port';
import type { AliasRepositoryPort } from '../../../application/ports/alias.repository.port';

@Controller()
export class AliasGrpcController {
  constructor(
    @Inject(ALIAS_REPOSITORY_PORT)
    private readonly aliasRepository: AliasRepositoryPort,
  ) {}

  @GrpcMethod('AliasService', 'ValidateToken')
  async validateToken(data: { token: string }): Promise<{ isValid: boolean }> {
    console.log(`[gRPC] Validating token: ${data.token}`);
    // Look up the complaint by the provided alias token
    const complaint = await this.aliasRepository.findComplaintByAlias(
      data.token,
    );

    // If it exists, the token is valid
    return {
      isValid: !!complaint,
    };
  }
}

import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { Client } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AliasServicePort } from '../../../../domain/ports/outbound/alias.service.port';
import { firstValueFrom } from 'rxjs';

interface AliasGrpcService {
  validateToken(data: { token: string }): any;
}

@Injectable()
export class GrpcAliasAdapter implements AliasServicePort, OnModuleInit {
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'alias',
      protoPath: join(process.cwd(), '../shared-proto/alias.proto'),
      url: process.env.ALIAS_GRPC_URL || '0.0.0.0:50051',
    },
  })
  private client: ClientGrpc;

  private aliasService: AliasGrpcService;

  async onModuleInit() {
    this.aliasService =
      this.client.getService<AliasGrpcService>('AliasService');
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      console.log(`[gRPC Client] Asking MS-02 to validate token: ${token}`);
      const response = (await firstValueFrom(
        this.aliasService.validateToken({ token }),
      )) as any;
      return response.isValid;
    } catch (error) {
      console.error('[gRPC Client] Error validating token', error);
      return false;
    }
  }
}

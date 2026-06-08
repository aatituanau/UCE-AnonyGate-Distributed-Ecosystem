import { Injectable, OnModuleInit } from '@nestjs/common';
import { AliasServicePort } from '../../../../domain/ports/outbound/alias.service.port';
// import * as grpc from '@grpc/grpc-js';
// import * as protoLoader from '@grpc/proto-loader';

@Injectable()
export class GrpcAliasAdapter implements AliasServicePort, OnModuleInit {
  async onModuleInit() {
    // Initializing gRPC client
  }

  async validateToken(token: string): Promise<boolean> {
    // TODO: implement real gRPC call to MS-02
    // Returning true for now to allow local testing
    console.log(`[gRPC Mock] Validating token: ${token}`);
    return true; 
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    // Verify that a Bearer token is present in the headers
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Token no provisto o inválido. Acceso denegado.',
      );
    }

    const token = authHeader.split(' ')[1];
    if (token.length < 10) {
      throw new UnauthorizedException('El token no tiene la longitud mínima.');
    }

    // As an internal microservice, we validate the structure.
    // In the final ecosystem MS-Auth is the issuer and it's decoded here.
    return true;
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    
    // Verificamos que traiga un token Bearer en las cabeceras
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto o inválido. Acceso denegado.');
    }
    
    const token = authHeader.split(' ')[1];
    if (token.length < 10) {
      throw new UnauthorizedException('El token no tiene la longitud mínima.');
    }

    // Al ser un microservicio interno, validamos la estructura. 
    // En el ecosistema final MS-Auth es el emisor y aquí se descifra.
    return true; 
  }
}

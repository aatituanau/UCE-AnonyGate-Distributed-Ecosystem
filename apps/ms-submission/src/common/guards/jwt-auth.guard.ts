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

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token. Access denied.');
    }

    const token = authHeader.split(' ')[1];
    
    // Quick JWT decode for the prototype
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadStr = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const payload = JSON.parse(payloadStr);
      
      // Attach the payload to the request for the RolesGuard
      (request as any).user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid JWT token structure.');
    }
  }
}

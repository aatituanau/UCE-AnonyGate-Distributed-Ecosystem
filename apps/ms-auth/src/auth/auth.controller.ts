import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/login — Analyst and Admin (email + password → JWT + refresh token)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  // POST /auth/refresh — Exchange a valid refresh token for a new token pair
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() body: { email: string; refresh_token: string }) {
    return this.authService.refresh(body.email, body.refresh_token);
  }

  // POST /auth/logout — Revoke all active refresh tokens for the authenticated user
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Request() req: { user: { sub: string } }) {
    return this.authService.logout(req.user.sub);
  }
}

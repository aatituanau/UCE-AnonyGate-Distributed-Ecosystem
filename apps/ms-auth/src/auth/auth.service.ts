import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) { }

    async login(email: string, pass: string) {
        // 1. Find the user in the database
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2. Validate password
        const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 3. Generate JWT Token
        const payload = { sub: user.id, email: user.email };
        const accessToken = await this.jwtService.signAsync(payload);

        return {
            access_token: accessToken,
        };
    }
}

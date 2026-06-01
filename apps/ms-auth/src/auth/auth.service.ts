import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

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



        // GENERATE REFRESH TOKEN
        // Create a text random token
        const plainRefreshToken = crypto.randomBytes(40).toString('hex');
        // We encrypt it before saving it to the database (just like the password)
        const tokenHash = await bcrypt.hash(plainRefreshToken, 10);

        // Calculate the expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Save the refresh_token in the database
        await this.prisma.refreshToken.create({
            data: {
                userId: user!.id,
                tokenHash: tokenHash,
                expiresAt: expiresAt
            },
        });


        // Return the JWT Token (and the refresh token for future use)
        return {
            access_token: accessToken,
            refresh_token: plainRefreshToken // We return the plain text for the frontend to store
        };
    }
}

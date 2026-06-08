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
        // 1. Find user with roles included
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { userRoles: { include: { role: true } } },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2. Validate password
        const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 3. Build JWT payload — role is required for RBAC guards in other microservices
        const role = user.userRoles[0]?.role.name ?? 'analyst';
        const payload = { sub: user.id, email: user.email, role };
        const accessToken = await this.jwtService.signAsync(payload);

        // 4. Generate refresh token (random bytes, stored hashed — never plain)
        const plainRefreshToken = crypto.randomBytes(40).toString('hex');
        const tokenHash = await bcrypt.hash(plainRefreshToken, 10);

        // Expires in 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.prisma.refreshToken.create({
            data: { userId: user.id, tokenHash, expiresAt },
        });

        return {
            access_token: accessToken,
            refresh_token: plainRefreshToken,
        };
    }

    async refresh(email: string, plainRefreshToken: string) {
        // 1. Find user with roles for the new JWT payload
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { userRoles: { include: { role: true } } },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // 2. Find all active (non-revoked, non-expired) refresh tokens for this user
        const activeTokens = await this.prisma.refreshToken.findMany({
            where: {
                userId: user.id,
                revoked: false,
                expiresAt: { gt: new Date() },
            },
        });

        // 3. Compare the plain token against each hashed token stored in DB
        let isValid = false;
        let usedTokenId: string | undefined;

        for (const token of activeTokens) {
            const match = await bcrypt.compare(plainRefreshToken, token.tokenHash);
            if (match) {
                isValid = true;
                usedTokenId = token.id;
                break;
            }
        }

        if (!isValid) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // 4. Token rotation: revoke the used token so it cannot be reused
        await this.prisma.refreshToken.update({
            where: { id: usedTokenId },
            data: { revoked: true },
        });

        // 5. Issue a new token pair — role included in payload
        const role = user.userRoles[0]?.role.name ?? 'analyst';
        const payload = { sub: user.id, email: user.email, role };
        const newAccessToken = await this.jwtService.signAsync(payload);

        const newPlainRefreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: await bcrypt.hash(newPlainRefreshToken, 10),
                expiresAt,
            },
        });

        return {
            access_token: newAccessToken,
            refresh_token: newPlainRefreshToken,
        };
    }

    async logout(userId: string) {
        // Revoke all active refresh tokens for this user
        await this.prisma.refreshToken.updateMany({
            where: { userId, revoked: false },
            data: { revoked: true },
        });
        return { message: 'Logged out successfully' };
    }
}

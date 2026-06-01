import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('auth')
export class AuthController {
    // We inject both PrismaService (for the test) and AuthService (for login)
    constructor(
        private readonly prisma: PrismaService,
        private readonly authService: AuthService
    ) { }

    // LOGIN ENDPOINT
    @HttpCode(HttpStatus.OK) // Returns 200 OK instead of 201 Created
    @Post('login')
    login(@Body() loginDto: Record<string, any>) {
        // We delegate the logic to the AuthService
        return this.authService.login(loginDto.email, loginDto.password);
    }

    //TEST ENDPOINT USERS   
    @UseGuards(AuthGuard('jwt')) // Protege el endpoint
    @Get('users')
    async getAllUsers() {
        // get data with Prisma!
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                createdAt: true
            }
        });
        return {
            message: "¡Conexión exitosa desde Postman!",
            total: users.length,
            data: users
        };
    }
}

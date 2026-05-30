import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
    // Here we inject Prisma to be able to use it
    constructor(private readonly prisma: PrismaService) { }

    @Get('users')
    async getAllUsers() {
        // get data with Prisma!
        const users = await this.prisma.user.findMany();
        return {
            message: "¡Conexión exitosa desde Postman!",
            total: users.length,
            data: users
        };
    }
}

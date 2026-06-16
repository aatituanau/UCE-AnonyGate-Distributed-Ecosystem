import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAnalystCommand } from './create-analyst.command';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@CommandHandler(CreateAnalystCommand)
export class CreateAnalystHandler implements ICommandHandler<CreateAnalystCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateAnalystCommand) {
    // CQRS WRITE: Access the 'public' schema for roles and users

    // 1. Ensure the 'analyst' role exists
    let analystRole = await this.prisma.role.findUnique({
      where: { name: 'analyst' },
    });

    if (!analystRole) {
      analystRole = await this.prisma.role.create({
        data: { name: 'analyst' },
      });
    }

    // Hash the password securely before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(command.password, saltRounds);

    // 2. Insert the new user with the corresponding role
    const user = await this.prisma.user.create({
      data: {
        email: command.email,
        passwordHash: hashedPassword,
        userRoles: {
          create: {
            roleId: analystRole.id,
          },
        },
      },
    });

    return {
      message: 'Analista creado exitosamente',
      userId: user.id,
    };
  }
}

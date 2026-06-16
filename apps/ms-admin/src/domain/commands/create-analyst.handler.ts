import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAnalystCommand } from './create-analyst.command';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@CommandHandler(CreateAnalystCommand)
export class CreateAnalystHandler implements ICommandHandler<CreateAnalystCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateAnalystCommand) {
    // CQRS ESCRITURA: Accedemos al esquema 'public' para roles y usuarios
    
    // 1. Asegurarnos que el rol 'analyst' exista
    let analystRole = await this.prisma.role.findUnique({
      where: { name: 'analyst' },
    });

    if (!analystRole) {
      analystRole = await this.prisma.role.create({
        data: { name: 'analyst' },
      });
    }

    // 2. Insertar al nuevo usuario con el rol correspondiente
    const user = await this.prisma.user.create({
      data: {
        email: command.email,
        passwordHash: command.passwordHash,
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

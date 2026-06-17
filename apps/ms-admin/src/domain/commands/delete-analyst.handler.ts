import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteAnalystCommand } from './delete-analyst.command';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteAnalystCommand)
export class DeleteAnalystHandler implements ICommandHandler<DeleteAnalystCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteAnalystCommand) {
    const { id } = command;

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Analista no encontrado');
    }

    // Using database cascade to automatically delete relations (userRoles, refreshTokens)
    await this.prisma.user.delete({ where: { id } });

    return { success: true, message: 'Analista eliminado correctamente' };
  }
}

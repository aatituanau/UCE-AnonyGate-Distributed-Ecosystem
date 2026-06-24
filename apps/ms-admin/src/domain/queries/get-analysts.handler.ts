import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAnalystsQuery } from './get-analysts.query';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@QueryHandler(GetAnalystsQuery)
export class GetAnalystsHandler implements IQueryHandler<GetAnalystsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    // CQRS READ: Read analysts from public.users table joined with roles
    const analysts = await this.prisma.$queryRaw`
      SELECT u.id, u.email, r.name as role, u.created_at 
      FROM public.users u
      JOIN public.user_roles ur ON u.id = ur.user_id
      JOIN public.roles r ON ur.role_id = r.id
      WHERE r.name IN ('analyst', 'admin') 
      ORDER BY u.created_at DESC;
    `;

    return analysts;
  }
}

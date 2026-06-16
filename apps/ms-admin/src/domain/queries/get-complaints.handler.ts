import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetComplaintsQuery } from './get-complaints.query';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@QueryHandler(GetComplaintsQuery)
export class GetComplaintsHandler implements IQueryHandler<GetComplaintsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetComplaintsQuery) {
    const skip = (query.page - 1) * query.limit;
    
    // CQRS LECTURA: Leemos de la tabla Complaint en el esquema 'complaints'
    const [data, total] = await Promise.all([
      this.prisma.complaint.findMany({
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.complaint.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page: query.page,
        lastPage: Math.ceil(total / query.limit),
      },
    };
  }
}

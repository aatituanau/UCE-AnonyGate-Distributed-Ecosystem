import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetComplaintsQuery } from './get-complaints.query';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@QueryHandler(GetComplaintsQuery)
export class GetComplaintsHandler implements IQueryHandler<GetComplaintsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetComplaintsQuery) {
    const skip = (query.page - 1) * query.limit;

    // CQRS READ: Read from the Complaint table in the 'complaints' schema
    const [complaints, total] = await Promise.all([
      this.prisma.complaint.findMany({
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.complaint.count(),
    ]);

    // Fetch the real statuses from ms-status 'status' schema
    const complaintIds = complaints.map((c) => c.id);
    const statuses = await this.prisma.caseStatus.findMany({
      where: { complaintId: { in: complaintIds } },
    });

    const statusMap = new Map(statuses.map((s) => [s.complaintId, s.status]));

    const data = complaints.map((c) => ({
      ...c,
      status: statusMap.get(c.id) || c.status,
    }));

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

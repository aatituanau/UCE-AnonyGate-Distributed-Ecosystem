import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDashboardStatsQuery } from './get-dashboard-stats.query';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@QueryHandler(GetDashboardStatsQuery)
export class GetDashboardStatsHandler implements IQueryHandler<GetDashboardStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    // 1. Get complaints counts using Prisma directly to avoid schema naming issues
    const activeComplaints = await this.prisma.complaint.count({
      where: { status: 'RECEIVED' }
    });

    const reviewComplaints = await this.prisma.complaint.count({
      where: { status: 'IN_REVIEW' }
    });

    // 2. Get analysts count using Prisma
    const activeAnalysts = await this.prisma.user.count({
      where: {
        userRoles: {
          some: {
            role: {
              name: { in: ['analyst', 'admin'] }
            }
          }
        }
      }
    });

    return {
      activeComplaints,
      reviewComplaints,
      activeAnalysts
    };
  }
}

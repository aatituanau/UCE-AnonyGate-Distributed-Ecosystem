import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDashboardStatsQuery } from './get-dashboard-stats.query';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@QueryHandler(GetDashboardStatsQuery)
export class GetDashboardStatsHandler implements IQueryHandler<GetDashboardStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    // 1. Get complaints counts using Prisma directly to avoid schema naming issues
    // Using CaseStatus (ms-status schema) to get the true dynamic state
    const activeComplaints = await this.prisma.caseStatus.count({
      where: { status: { in: ['SUBMITTED', 'RECEIVED'] } }
    });

    const reviewComplaints = await this.prisma.caseStatus.count({
      where: { status: 'IN_REVIEW' }
    });

    const awaitingInfoComplaints = await this.prisma.caseStatus.count({
      where: { status: 'AWAITING_INFO' }
    });

    const closedComplaints = await this.prisma.caseStatus.count({
      where: { status: 'CLOSED' }
    });

    const rejectedComplaints = await this.prisma.caseStatus.count({
      where: { status: 'REJECTED' }
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
      awaitingInfoComplaints,
      closedComplaints,
      rejectedComplaints,
      activeAnalysts
    };
  }
}

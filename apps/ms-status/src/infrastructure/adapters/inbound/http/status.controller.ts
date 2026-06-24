import { Body, Controller, Get, Param, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatusService } from '../../../../application/services/status.service';
import { AliasTokenGuard } from '../../../../common/guards/alias-token.guard';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@ApiTags('Case Status')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get('cases/critical')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all critical cases (Analyst/Admin only)' })
  async getCriticalCases() {
    return this.statusService.getCriticalCases();
  }

  @Get(':complaintId')
  @UseGuards(AliasTokenGuard)
  @ApiHeader({ name: 'x-alias-token', description: 'Alias token from ms-alias', required: true })
  @ApiOperation({ summary: 'Get status of a specific complaint (Complainant)' })
  async getStatus(@Param('complaintId') complaintId: string) {
    return this.statusService.getCaseByComplaintId(complaintId);
  }

  @Put(':complaintId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update status of a complaint (Analyst/Admin only)' })
  async updateStatus(
    @Param('complaintId') complaintId: string,
    @Body('status') newStatus: string,
    @Request() req: any,
  ) {
    const analystId = req.user.userId;
    await this.statusService.transitionStatus(complaintId, newStatus, analystId);
    return { message: 'Status updated successfully' };
  }
}

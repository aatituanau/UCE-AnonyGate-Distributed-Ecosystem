import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAnalystCommand } from '../../domain/commands/create-analyst.command';
import { DeleteAnalystCommand } from '../../domain/commands/delete-analyst.command';
import { GetComplaintsQuery } from '../../domain/queries/get-complaints.query';
import { GetAnalystsQuery } from '../../domain/queries/get-analysts.query';
import { GetDashboardStatsQuery } from '../../domain/queries/get-dashboard-stats.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('analysts')
  async getAnalysts() {
    return this.queryBus.execute(new GetAnalystsQuery());
  }

  @Post('analysts')
  async createAnalyst(@Body() body: { email: string; password: string }) {
    // Delegate writing to the corresponding Command Handler
    return this.commandBus.execute(
      new CreateAnalystCommand(body.email, body.password),
    );
  }

  @Delete('analysts/:id')
  async deleteAnalyst(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteAnalystCommand(id));
  }

  @Get('complaints')
  async getComplaints(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    // Delegate reading to the corresponding Query Handler
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.queryBus.execute(new GetComplaintsQuery(pageNum, limitNum));
  }

  @Get('dashboard-stats')
  async getDashboardStats() {
    return this.queryBus.execute(new GetDashboardStatsQuery());
  }
}

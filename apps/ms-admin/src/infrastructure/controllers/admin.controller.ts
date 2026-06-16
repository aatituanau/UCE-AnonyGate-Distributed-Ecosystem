import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAnalystCommand } from '../../domain/commands/create-analyst.command';
import { GetComplaintsQuery } from '../../domain/queries/get-complaints.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('analysts')
  async createAnalyst(@Body() body: { email: string; passwordHash: string }) {
    // Delegate writing to the corresponding Command Handler
    return this.commandBus.execute(
      new CreateAnalystCommand(body.email, body.passwordHash),
    );
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
}

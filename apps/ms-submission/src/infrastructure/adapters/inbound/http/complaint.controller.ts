import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateComplaintCommand } from '../../../../application/commands/create-complaint/create-complaint.command';
import { GetComplaintQuery } from '../../../../application/queries/get-complaint/get-complaint.query';
import { GetComplaintByIdQuery } from '../../../../application/queries/get-complaint-by-id/get-complaint-by-id.query';
import { GetAllComplaintsQuery } from '../../../../application/queries/get-all-complaints/get-all-complaints.query';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@Controller('api/v1/complaints')
export class ComplaintController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createComplaint(@Body() body: { aliasToken: string; payload: any }) {
    const command = new CreateComplaintCommand(body.aliasToken, body.payload);
    return await this.commandBus.execute(command);
  }

  // --- ANALYST & ADMIN ENDPOINTS ---

  @Get('analyst')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('analyst', 'admin')
  async getAllComplaints() {
    const query = new GetAllComplaintsQuery();
    return await this.queryBus.execute(query);
  }

  @Get('analyst/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('analyst', 'admin')
  async getComplaintById(@Param('id') id: string) {
    const query = new GetComplaintByIdQuery(id);
    return await this.queryBus.execute(query);
  }

  // --- PUBLIC ENDPOINTS (Denunciante) ---

  @Get(':token')
  async getComplaint(@Param('token') token: string) {
    const query = new GetComplaintQuery(token);
    return await this.queryBus.execute(query);
  }
}

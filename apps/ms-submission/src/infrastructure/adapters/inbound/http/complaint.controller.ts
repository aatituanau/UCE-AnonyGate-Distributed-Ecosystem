import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateComplaintCommand } from '../../../../application/commands/create-complaint/create-complaint.command';
import { GetComplaintQuery } from '../../../../application/queries/get-complaint/get-complaint.query';

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

  @Get(':token')
  async getComplaint(@Param('token') token: string) {
    const query = new GetComplaintQuery(token);
    return await this.queryBus.execute(query);
  }
}

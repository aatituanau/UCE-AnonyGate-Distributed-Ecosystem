import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAdminGuard } from '../auth/jwt-admin.guard';

@Controller()
@UseGuards(JwtAdminGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  async getLogs() {
    return this.auditService.getLogs();
  }

  @Get('archives')
  async getArchives() {
    return this.auditService.getArchives();
  }
}

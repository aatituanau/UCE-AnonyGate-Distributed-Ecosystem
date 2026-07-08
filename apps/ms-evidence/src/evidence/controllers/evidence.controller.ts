/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Get, Body, Param, UseInterceptors, UploadedFile, UseGuards, Req, Headers, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EvidenceService } from '../services/evidence.service';
import { UploadEvidenceDto } from '../dto/upload-evidence.dto';
import { WebhookPayloadDto } from '../dto/webhook-payload.dto';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Controller('evidence')
export class EvidenceController {
  constructor(
    private readonly evidenceService: EvidenceService,
    private readonly configService: ConfigService,
  ) {}

  // 1. Upload evidence (Complainant)
  // Alias token required in headers
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Headers('x-alias-token') aliasToken: string,
    @Body() dto: UploadEvidenceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!aliasToken) {
      throw new UnauthorizedException('Alias token is required');
    }
    // Note: Here we'd ideally validate the aliasToken by calling ms-alias (gRPC), 
    // but the rule specified to just validate the header exists and accept it for this iteration.
    
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const evidence = await this.evidenceService.handleFileUpload(dto.complaintId, file);
    return {
      message: 'Evidence uploaded successfully',
      evidenceId: evidence._id,
      status: evidence.status,
    };
  }

  // 2. Webhook for MS-06 (Sanitization Worker)
  // X-Webhook-Secret required in headers
  @Post('webhook')
  async handleWebhook(
    @Headers('x-webhook-secret') secret: string,
    @Body() dto: WebhookPayloadDto,
  ) {
    const expectedSecret = this.configService.get<string>('WEBHOOK_SECRET') || 'default_secret';
    if (secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    await this.evidenceService.processWebhook(dto.evidenceId, dto.status);
    return { success: true };
  }

  // 3. Analyst views evidence
  // Requires JwtAuthGuard and checks for Analyst/Admin roles
  @Get(':complaintId')
  @UseGuards(AuthGuard('jwt'))
  async getEvidences(
    @Req() req: any,
    @Param('complaintId') complaintId: string,
  ) {
    const userRole = req.user?.role;
    if (userRole !== 'analyst' && userRole !== 'admin') {
      throw new UnauthorizedException('Insufficient permissions');
    }

    const evidences = await this.evidenceService.getEvidencesForComplaint(complaintId);
    return evidences;
  }
}

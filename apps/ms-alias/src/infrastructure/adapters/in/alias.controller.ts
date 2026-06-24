import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { GenerateAliasUseCase } from '../../../application/use-cases/generate-alias.usecase';
import { ALIAS_REPOSITORY_PORT } from '../../../application/ports/alias.repository.port';
import type { AliasRepositoryPort } from '../../../application/ports/alias.repository.port';

@Controller('aliases')
export class AliasController {
  constructor(
    private readonly generateAliasUseCase: GenerateAliasUseCase,
    @Inject(ALIAS_REPOSITORY_PORT)
    private readonly aliasRepository: AliasRepositoryPort,
  ) {}

  @Post('generate')
  async generateAlias(
    @Body() body: { title: string; description: string; faculty: string },
  ) {
    const secretAlias = await this.generateAliasUseCase.execute(body);
    return {
      message: 'Complaint successfully saved. Please save your secret alias.',
      alias: secretAlias,
    };
  }

  @Get(':alias/status')
  async checkStatus(@Param('alias') aliasCode: string) {
    const complaint =
      await this.aliasRepository.findComplaintByAlias(aliasCode);

    if (!complaint) {
      throw new NotFoundException('Alias not found or invalid');
    }

    return {
      alias: aliasCode,
      status: complaint.status,
      faculty: complaint.faculty,
      submittedAt: complaint.createdAt,
    };
  }
}

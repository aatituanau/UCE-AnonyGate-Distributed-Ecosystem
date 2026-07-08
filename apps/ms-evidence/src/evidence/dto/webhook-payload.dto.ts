import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EvidenceStatus } from '../schemas/evidence.schema';

export class WebhookPayloadDto {
  @ApiProperty({ description: 'The internal Evidence ID (from DB)' })
  @IsString()
  @IsNotEmpty()
  evidenceId: string;

  @ApiProperty({ enum: EvidenceStatus, description: 'The analysis result from sanitization worker' })
  @IsEnum(EvidenceStatus)
  @IsNotEmpty()
  status: EvidenceStatus;
}

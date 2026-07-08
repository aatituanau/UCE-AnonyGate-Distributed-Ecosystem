import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadEvidenceDto {
  @ApiProperty({ description: 'The UUID of the complaint' })
  @IsString()
  @IsNotEmpty()
  complaintId: string;
}

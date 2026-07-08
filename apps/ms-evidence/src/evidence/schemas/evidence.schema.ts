import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EvidenceDocument = Evidence & Document;

export enum EvidenceStatus {
  PENDING_SANITIZATION = 'PENDING_SANITIZATION',
  SAFE = 'SAFE',
  INFECTED = 'INFECTED',
}

@Schema({ timestamps: true })
export class Evidence {
  @Prop({ required: true, index: true })
  complaintId: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  s3Key: string;

  @Prop({
    required: true,
    enum: EvidenceStatus,
    default: EvidenceStatus.PENDING_SANITIZATION,
  })
  status: string;
}

export const EvidenceSchema = SchemaFactory.createForClass(Evidence);

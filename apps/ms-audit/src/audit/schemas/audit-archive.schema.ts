import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ForbiddenException } from '@nestjs/common';

@Schema({ collection: 'audit_archives', timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class AuditArchive extends Document {
  @Prop({ required: true })
  eventId: string;

  @Prop({ required: true })
  eventType: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  payload: Record<string, any>;

  @Prop()
  timestamp: Date;

  @Prop({ required: true })
  previousHash: string;

  @Prop({ required: true })
  hash: string;
}

export const AuditArchiveSchema = SchemaFactory.createForClass(AuditArchive);

// Append-Only constraints (No UPDATE, No DELETE)
AuditArchiveSchema.pre('updateOne', function (next) {
  next(new ForbiddenException('Updates are not allowed in AuditArchive. Append-Only strict mode.'));
});
AuditArchiveSchema.pre('updateMany', function (next) {
  next(new ForbiddenException('Updates are not allowed in AuditArchive. Append-Only strict mode.'));
});
AuditArchiveSchema.pre('deleteOne', function (next) {
  next(new ForbiddenException('Deletes are not allowed in AuditArchive. Append-Only strict mode.'));
});
AuditArchiveSchema.pre('deleteMany', function (next) {
  next(new ForbiddenException('Deletes are not allowed in AuditArchive. Append-Only strict mode.'));
});
AuditArchiveSchema.pre('findOneAndUpdate', function (next) {
  next(new ForbiddenException('Updates are not allowed in AuditArchive. Append-Only strict mode.'));
});
AuditArchiveSchema.pre('findOneAndDelete', function (next) {
  next(new ForbiddenException('Deletes are not allowed in AuditArchive. Append-Only strict mode.'));
});

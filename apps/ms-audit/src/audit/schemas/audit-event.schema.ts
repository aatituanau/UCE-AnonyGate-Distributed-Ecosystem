import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ForbiddenException } from '@nestjs/common';

@Schema({ collection: 'audit_logs', timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class AuditEvent extends Document {
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

export const AuditEventSchema = SchemaFactory.createForClass(AuditEvent);

// Append-Only constraints (No UPDATE, No DELETE)
AuditEventSchema.pre('updateOne', function (next) {
  next(new ForbiddenException('Updates are not allowed in AuditLog. Append-Only strict mode.'));
});
AuditEventSchema.pre('updateMany', function (next) {
  next(new ForbiddenException('Updates are not allowed in AuditLog. Append-Only strict mode.'));
});
AuditEventSchema.pre('deleteOne', function (next) {
  next(new ForbiddenException('Deletes are not allowed in AuditLog. Append-Only strict mode.'));
});
AuditEventSchema.pre('deleteMany', function (next) {
  next(new ForbiddenException('Deletes are not allowed in AuditLog. Append-Only strict mode.'));
});
AuditEventSchema.pre('findOneAndUpdate', function (next) {
  next(new ForbiddenException('Updates are not allowed in AuditLog. Append-Only strict mode.'));
});
AuditEventSchema.pre('findOneAndDelete', function (next) {
  next(new ForbiddenException('Deletes are not allowed in AuditLog. Append-Only strict mode.'));
});

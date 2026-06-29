import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { AuditEvent } from './schemas/audit-event.schema';
import { AuditArchive } from './schemas/audit-archive.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditEvent.name) private readonly auditLogModel: Model<AuditEvent>,
    @InjectModel(AuditArchive.name) private readonly auditArchiveModel: Model<AuditArchive>,
  ) {}

  public generateHash(previousHash: string, eventType: string, payload: any, timestamp: Date): string {
    const dataString = `${previousHash}${eventType}${JSON.stringify(payload)}${timestamp.toISOString()}`;
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  async processEvent(eventType: string, payload: any): Promise<void> {
    const timestamp = new Date();
    
    // Logic to determine if it goes to archive (closed cases)
    // Using payload.status to check if the complaint is closed or rejected.
    // If it's a 'complaint.status.updated' event to CLOSED/REJECTED.
    const isClosedEvent = eventType === 'complaint.status.updated' && 
                          (payload?.status === 'CLOSED' || payload?.status === 'REJECTED');

    const targetModel = isClosedEvent ? this.auditArchiveModel : this.auditLogModel;

    // Get the previous hash from the same collection to maintain the chain
    // NOTE: In a real distributed blockchain, the chain might be global. 
    // Here we maintain it per collection or globally based on requirements. 
    // We will find the latest event across both or just the target model. 
    // Since it's Event Sourcing for the system, let's just get the absolute latest from the target model.
    const lastEvent = await targetModel.findOne().sort({ timestamp: -1 }).exec();
    
    const previousHash = lastEvent ? lastEvent.hash : '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis hash
    
    // The eventId should be generated or extracted from payload if available.
    // We'll use a random UUID if not provided by the payload.
    const eventId = payload?.eventId || crypto.randomUUID();

    const hash = this.generateHash(previousHash, eventType, payload, timestamp);

    const newEvent = new targetModel({
      eventId,
      eventType,
      payload,
      timestamp,
      previousHash,
      hash,
    });

    await newEvent.save();
  }
}

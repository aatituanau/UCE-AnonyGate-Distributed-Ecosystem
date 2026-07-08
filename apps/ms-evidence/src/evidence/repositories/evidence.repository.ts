import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evidence, EvidenceDocument, EvidenceStatus } from '../schemas/evidence.schema';

@Injectable()
export class EvidenceRepository {
  constructor(
    @InjectModel(Evidence.name) private readonly model: Model<EvidenceDocument>,
  ) {}

  // Create a new evidence record
  async create(evidenceData: Partial<Evidence>): Promise<EvidenceDocument> {
    const createdEvidence = new this.model(evidenceData);
    return createdEvidence.save();
  }

  // Update status based on sanitization result
  async updateStatus(id: string, status: EvidenceStatus): Promise<EvidenceDocument | null> {
    return this.model.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    ).exec();
  }

  // Find all evidences related to a specific complaint ID
  async findByComplaintId(complaintId: string): Promise<EvidenceDocument[]> {
    return this.model.find({ complaintId }).exec();
  }

  // Find a specific evidence by its internal ID
  async findById(id: string): Promise<EvidenceDocument | null> {
    return this.model.findById(id).exec();
  }
}

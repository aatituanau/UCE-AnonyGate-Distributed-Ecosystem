import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EvidenceRepository } from '../repositories/evidence.repository';
import { S3Service } from './s3.service';
import { KafkaProducerAdapter } from '../adapters/kafka-producer.adapter';
import { EvidenceStatus } from '../schemas/evidence.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);

  constructor(
    private readonly evidenceRepository: EvidenceRepository,
    private readonly s3Service: S3Service,
    private readonly kafkaProducer: KafkaProducerAdapter,
  ) {}

  // Handles the upload of a new evidence file
  async handleFileUpload(complaintId: string, file: Express.Multer.File) {
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const s3Key = `original/${complaintId}/${uniqueFileName}`;

    this.logger.log(`Uploading file ${file.originalname} for complaint ${complaintId}`);

    // 1. Upload to S3 (original/ folder)
    await this.s3Service.uploadFile(s3Key, file.buffer, file.mimetype);

    // 2. Save metadata to DB_Evidence
    const evidence = await this.evidenceRepository.create({
      complaintId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      s3Key,
      status: EvidenceStatus.PENDING_SANITIZATION,
    });

    // 3. Publish Event to Kafka
    await this.kafkaProducer.publishEvidenceUploadedEvent({
      complaintId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      s3Key,
    });

    return evidence;
  }

  // Updates the evidence status when the MS-06 webhook is called
  async processWebhook(evidenceId: string, status: EvidenceStatus) {
    const updated = await this.evidenceRepository.updateStatus(evidenceId, status);
    if (!updated) {
      throw new NotFoundException(`Evidence with ID ${evidenceId} not found`);
    }
    this.logger.log(`Evidence ${evidenceId} status updated to ${status}`);
    return updated;
  }

  // Retrieves evidences for a specific complaint, including pre-signed URLs
  async getEvidencesForComplaint(complaintId: string) {
    const evidences = await this.evidenceRepository.findByComplaintId(complaintId);
    
    // Generate pre-signed URL for each evidence
    const result = await Promise.all(evidences.map(async (ev) => {
      let downloadUrl = null;
      
      // We assume MS-06 might move it to 'sanitized/' or it stays in 'original/'
      // We will generate the URL for the stored s3Key.
      // Analysts can only download if it's SAFE
      if (ev.status === EvidenceStatus.SAFE) {
        downloadUrl = await this.s3Service.getPresignedUrl(ev.s3Key);
      }
      
      return {
        id: ev._id,
        complaintId: ev.complaintId,
        originalName: ev.originalName,
        mimeType: ev.mimeType,
        size: ev.size,
        status: ev.status,
        downloadUrl, // only available if SAFE
        createdAt: (ev as any).createdAt,
      };
    }));

    return result;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    // Initialize S3 Client using environment variables implicitly via AWS SDK
    // or explicitly if provided in config
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
    });
    
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME') || 'anonygate-evidence-dev';
  }

  // Uploads a buffer to S3 under the given key
  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully to S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${key}`, error);
      throw error;
    }
  }

  // Generates a pre-signed URL for downloading an object (Valid for 15 minutes)
  async getPresignedUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      // 15 minutes = 900 seconds
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate pre-signed URL for key: ${key}`, error);
      throw error;
    }
  }
}

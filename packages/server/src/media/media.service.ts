import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  S3Client, 
  PutObjectCommand, 
  CreateMultipartUploadCommand 
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly maxFileSizeMB: number;
  
  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_KEY');
    const bucket = this.configService.get<string>('R2_BUCKET');
    
    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      this.logger.warn('Missing R2 configuration. Media uploads will not work properly.');
    }
    
    // Initialize S3 client with R2 configuration
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint || '',
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
    
    this.bucket = bucket || '';
    this.maxFileSizeMB = this.configService.get<number>('MAX_FILE_MB', 5);
    
    this.logger.log(`Media service initialized with bucket: ${this.bucket}`);
    this.logger.log(`Max file size: ${this.maxFileSizeMB} MB`);
  }
  
  /**
   * Generate a presigned URL for direct browser uploads to R2/S3
   */
  async generatePresignedUrl(mimeType: string): Promise<{ url: string; fields: Record<string, string> }> {
    if (!this.bucket) {
      throw new BadRequestException('Storage bucket not configured');
    }
    
    if (!this.isValidMimeType(mimeType)) {
      throw new BadRequestException('Invalid or unsupported file type');
    }
    
    const fileExtension = this.getFileExtension(mimeType);
    if (!fileExtension) {
      throw new BadRequestException('Could not determine file extension from mime type');
    }
    
    // Create unique filename with UUID
    const filename = `${uuidv4()}${fileExtension}`;
    const key = `uploads/${filename}`;
    
    try {
      // Create presigned POST URL
      const { url, fields } = await createPresignedPost(this.s3Client, {
        Bucket: this.bucket,
        Key: key,
        Conditions: [
          ['content-length-range', 0, this.maxFileSizeMB * 1024 * 1024], // Max file size in bytes
          ['eq', '$Content-Type', mimeType],
        ],
        Fields: {
          'Content-Type': mimeType,
        },
        Expires: 300, // URL expires in 5 minutes
      });
      
      this.logger.debug(`Created presigned URL for ${key}`);
      return { url, fields };
    } catch (error) {
      this.logger.error(`Error creating presigned URL: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to generate upload URL');
    }
  }
  
  /**
   * Check if the mime type is valid and supported
   */
  private isValidMimeType(mimeType: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    
    return supportedTypes.includes(mimeType);
  }
  
  /**
   * Get file extension from mime type
   */
  private getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
    };
    
    return mimeToExt[mimeType] || '';
  }
  
  /**
   * Get the full URL for a stored media file
   */
  getMediaUrl(filename: string): string {
    const bucketUrl = this.configService.get<string>('R2_PUBLIC_URL') || 
                     `${this.configService.get<string>('R2_ENDPOINT') || ''}/${this.bucket}`;
    
    return `${bucketUrl}/uploads/${filename}`;
  }
} 
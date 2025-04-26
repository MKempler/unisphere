import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MediaService } from './media.service';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { BadRequestException } from '@nestjs/common';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-presigned-post');

describe('MediaService', () => {
  let service: MediaService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    // Mock config service
    mockConfigService = {
      get: jest.fn((key) => {
        const config = {
          R2_ENDPOINT: 'https://bucket.r2.cloudflarestorage.com',
          R2_BUCKET: 'test-bucket',
          R2_ACCESS_KEY: 'test-access-key',
          R2_SECRET_KEY: 'test-secret-key',
          MAX_FILE_MB: 5,
        };
        return config[key] || undefined;
      }),
    };

    // Mock S3 presigned URL
    (createPresignedPost as jest.Mock).mockResolvedValue({
      url: 'https://bucket.r2.cloudflarestorage.com',
      fields: {
        key: 'uploads/test-file.jpg',
        'Content-Type': 'image/jpeg',
        // Add other expected fields
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePresignedUrl', () => {
    it('should return a presigned URL with fields for valid mime type', async () => {
      const result = await service.generatePresignedUrl('image/jpeg');
      
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('fields');
      expect(result.url).toBe('https://bucket.r2.cloudflarestorage.com');
      expect(result.fields).toHaveProperty('Content-Type', 'image/jpeg');
    });

    it('should throw an error for invalid mime type', async () => {
      await expect(service.generatePresignedUrl('application/pdf')).rejects.toThrow('Invalid or unsupported file type');
    });
  });

  describe('getMediaUrl', () => {
    it('should return the correct URL for a given filename', () => {
      const url = service.getMediaUrl('test-image.jpg');
      expect(url).toBe('https://bucket.r2.cloudflarestorage.com/uploads/test-image.jpg');
    });
  });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MediaModule } from '../src/media/media.module';
import { MediaService } from '../src/media/media.service';
import { JwtModule } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaModule } from '../src/prisma/prisma.module';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-presigned-post');

// Mock JWT validation
jest.mock('../src/auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

describe('MediaController (e2e)', () => {
  let app: INestApplication;
  let service: MediaService;
  
  beforeAll(async () => {
    // Mock S3 presigned URL
    (createPresignedPost as jest.Mock).mockResolvedValue({
      url: 'https://test-bucket.r2.cloudflarestorage.com',
      fields: {
        key: 'uploads/test-file.jpg',
        'Content-Type': 'image/jpeg',
        'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
        Policy: 'mock-policy',
        'X-Amz-Signature': 'mock-signature',
      },
    });
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        MediaModule,
        AuthModule,
        PrismaModule,
      ],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, any> = {
                R2_ENDPOINT: 'https://test-bucket.r2.cloudflarestorage.com',
                R2_BUCKET: 'test-bucket',
                R2_ACCESS_KEY: 'test-access-key',
                R2_SECRET_KEY: 'test-secret-key',
                MAX_FILE_MB: 5,
              };
              return config[key] || undefined;
            }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    service = moduleFixture.get<MediaService>(MediaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /media/presign', () => {
    it('should return a presigned URL for a valid MIME type', () => {
      return request(app.getHttpServer())
        .post('/media/presign')
        .set('Authorization', 'Bearer test-token')
        .send({ mimeType: 'image/jpeg' })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('url');
          expect(response.body).toHaveProperty('fields');
          expect(response.body.url).toEqual('https://test-bucket.r2.cloudflarestorage.com');
          expect(response.body.fields).toHaveProperty('Content-Type', 'image/jpeg');
          expect(response.body.fields).toHaveProperty('Policy');
          expect(response.body.fields).toHaveProperty('X-Amz-Signature');
        });
    });

    it('should return 400 for an invalid MIME type', () => {
      return request(app.getHttpServer())
        .post('/media/presign')
        .set('Authorization', 'Bearer test-token')
        .send({ mimeType: 'application/pdf' })
        .expect(400);
    });

    it('should return 400 if mimeType is missing', () => {
      return request(app.getHttpServer())
        .post('/media/presign')
        .set('Authorization', 'Bearer test-token')
        .send({})
        .expect(400);
    });
  });
}); 
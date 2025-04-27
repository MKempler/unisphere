"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const media_service_1 = require("./media.service");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-presigned-post');
describe('MediaService', () => {
    let service;
    let mockConfigService;
    beforeEach(async () => {
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
        s3_presigned_post_1.createPresignedPost.mockResolvedValue({
            url: 'https://bucket.r2.cloudflarestorage.com',
            fields: {
                key: 'uploads/test-file.jpg',
                'Content-Type': 'image/jpeg',
            },
        });
        const module = await testing_1.Test.createTestingModule({
            providers: [
                media_service_1.MediaService,
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();
        service = module.get(media_service_1.MediaService);
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
//# sourceMappingURL=media.service.spec.js.map
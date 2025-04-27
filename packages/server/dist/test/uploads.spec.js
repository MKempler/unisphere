"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const media_module_1 = require("../src/media/media.module");
const media_service_1 = require("../src/media/media.service");
const jwt_1 = require("@nestjs/jwt");
const supertest_1 = __importDefault(require("supertest"));
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const auth_module_1 = require("../src/auth/auth.module");
const prisma_module_1 = require("../src/prisma/prisma.module");
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-presigned-post');
jest.mock('../src/auth/guards/jwt-auth.guard', () => ({
    JwtAuthGuard: jest.fn().mockImplementation(() => ({
        canActivate: () => true,
    })),
}));
describe('MediaController (e2e)', () => {
    let app;
    let service;
    beforeAll(async () => {
        s3_presigned_post_1.createPresignedPost.mockResolvedValue({
            url: 'https://test-bucket.r2.cloudflarestorage.com',
            fields: {
                key: 'uploads/test-file.jpg',
                'Content-Type': 'image/jpeg',
                'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
                Policy: 'mock-policy',
                'X-Amz-Signature': 'mock-signature',
            },
        });
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env.test',
                }),
                jwt_1.JwtModule.register({
                    secret: 'test-secret',
                    signOptions: { expiresIn: '1h' },
                }),
                media_module_1.MediaModule,
                auth_module_1.AuthModule,
                prisma_module_1.PrismaModule,
            ],
            providers: [
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn((key) => {
                            const config = {
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
        service = moduleFixture.get(media_service_1.MediaService);
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    describe('POST /media/presign', () => {
        it('should return a presigned URL for a valid MIME type', () => {
            return (0, supertest_1.default)(app.getHttpServer())
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
            return (0, supertest_1.default)(app.getHttpServer())
                .post('/media/presign')
                .set('Authorization', 'Bearer test-token')
                .send({ mimeType: 'application/pdf' })
                .expect(400);
        });
        it('should return 400 if mimeType is missing', () => {
            return (0, supertest_1.default)(app.getHttpServer())
                .post('/media/presign')
                .set('Authorization', 'Bearer test-token')
                .send({})
                .expect(400);
        });
    });
});
//# sourceMappingURL=uploads.spec.js.map
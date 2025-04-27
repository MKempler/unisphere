"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../src/app.module");
const supertest_1 = __importDefault(require("supertest"));
const prisma_service_1 = require("../src/prisma/prisma.service");
const uuid_1 = require("uuid");
const isCI = process.env.CI === 'true';
(isCI ? describe.skip : describe)('Federation (Integration)', () => {
    let firstApp;
    let secondApp;
    let firstAppPrisma;
    let secondAppPrisma;
    let userId;
    let jwtToken;
    let postText;
    beforeAll(async () => {
        if (isCI)
            return;
        process.env.PORT = '4000';
        process.env.PEERS = 'http://localhost:4100';
        process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/unisphere_test_1?schema=public';
        const firstModuleRef = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        firstApp = firstModuleRef.createNestApplication();
        await firstApp.init();
        firstAppPrisma = firstModuleRef.get(prisma_service_1.PrismaService);
        process.env.PORT = '4100';
        process.env.PEERS = 'http://localhost:4000';
        process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/unisphere_test_2?schema=public';
        const secondModuleRef = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        secondApp = secondModuleRef.createNestApplication();
        await secondApp.init();
        secondAppPrisma = secondModuleRef.get(prisma_service_1.PrismaService);
        await firstAppPrisma.post.deleteMany();
        await firstAppPrisma.user.deleteMany();
        await secondAppPrisma.post.deleteMany();
        await secondAppPrisma.remoteUser.deleteMany();
        const testUser = await firstAppPrisma.user.create({
            data: {
                email: 'test@example.com',
                handle: 'testuser',
                didPublicKey: `did:key:${(0, uuid_1.v4)()}`,
                didPrivateKeyEnc: 'mock-encrypted-private-key',
            },
        });
        userId = testUser.id;
        postText = `Test federation post ${Date.now()}`;
        jwtToken = 'Bearer mockJwtToken';
    }, 30000);
    afterAll(async () => {
        if (isCI)
            return;
        await firstApp?.close();
        await secondApp?.close();
    });
    it('should propagate a post from app1 to app2', async () => {
        if (isCI)
            return;
        const createPostResponse = await (0, supertest_1.default)(firstApp.getHttpServer())
            .post('/post')
            .set('Authorization', jwtToken)
            .send({ text: postText })
            .expect(201);
        const post = createPostResponse.body.data;
        expect(post).toBeDefined();
        expect(post.text).toBe(postText);
        const maxAttempts = 10;
        const delay = 500;
        let federatedPost = null;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, delay));
            const remoteUsers = await secondAppPrisma.remoteUser.findMany();
            if (remoteUsers.length > 0) {
                const remotePosts = await secondAppPrisma.post.findMany({
                    where: {
                        remoteAuthorId: remoteUsers[0].id,
                        text: postText,
                    },
                });
                if (remotePosts.length > 0) {
                    federatedPost = remotePosts[0];
                    break;
                }
            }
        }
        expect(federatedPost).toBeDefined();
        expect(federatedPost.text).toBe(postText);
        const healthResponse = await (0, supertest_1.default)(secondApp.getHttpServer())
            .get('/federation/health')
            .expect(200);
        expect(healthResponse.body.ok).toBe(true);
    }, 10000);
});
//# sourceMappingURL=federation.spec.js.map
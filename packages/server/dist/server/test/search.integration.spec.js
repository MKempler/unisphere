"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("../src/app.module");
const prisma_service_1 = require("../src/prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const uuid_1 = require("uuid");
describe('Search Integration Tests', () => {
    let app;
    let prismaService;
    let jwtService;
    let authToken;
    let testUsers = {
        alice: null,
        bob: null
    };
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        prismaService = moduleFixture.get(prisma_service_1.PrismaService);
        jwtService = moduleFixture.get(jwt_1.JwtService);
        await app.init();
        await cleanDatabase();
        await setupTestData();
        authToken = createAuthToken(testUsers.alice.id);
    });
    afterAll(async () => {
        await cleanDatabase();
        await app.close();
    });
    describe('Search API', () => {
        it('GET /search should return posts matching hashtag', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/search?q=%23unisphere')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body.posts).toBeDefined();
            expect(response.body.posts.length).toBe(2);
            expect(response.body.posts.some(post => post.text.includes('#unisphere'))).toBe(true);
        });
        it('GET /search should return posts matching text', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/search?q=hello')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body.posts).toBeDefined();
            expect(response.body.posts.length).toBe(1);
            expect(response.body.posts[0].text.includes('Hello')).toBe(true);
        });
        it('GET /search with pagination should work correctly', async () => {
            const firstResponse = await (0, supertest_1.default)(app.getHttpServer())
                .get('/search?q=%23unisphere&limit=1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(firstResponse.body.posts).toBeDefined();
            expect(firstResponse.body.posts.length).toBe(1);
            expect(firstResponse.body.nextCursor).toBeDefined();
            const cursor = firstResponse.body.nextCursor;
            const secondResponse = await (0, supertest_1.default)(app.getHttpServer())
                .get(`/search?q=%23unisphere&cursor=${cursor}&limit=1`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(secondResponse.body.posts).toBeDefined();
            expect(secondResponse.body.posts.length).toBe(1);
            expect(secondResponse.body.posts[0].id).not.toBe(firstResponse.body.posts[0].id);
        });
    });
    describe('Trending Hashtags API', () => {
        it('GET /search/trending should return trending hashtags', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/search/trending')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toBeDefined();
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).toHaveProperty('count');
            expect(response.body.some(tag => tag.name === 'unisphere')).toBe(true);
        });
        it('GET /search/trending should respect limit parameter', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/search/trending?limit=1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toBeDefined();
            expect(response.body.length).toBe(1);
        });
    });
    async function cleanDatabase() {
        await prismaService.hashtagsOnPosts.deleteMany({});
        await prismaService.hashtag.deleteMany({});
        await prismaService.post.deleteMany({});
        await prismaService.follow.deleteMany({});
        await prismaService.user.deleteMany({});
    }
    async function setupTestData() {
        testUsers.alice = await prismaService.user.create({
            data: {
                id: (0, uuid_1.v4)(),
                email: 'alice-test@example.com',
                handle: 'alice-test',
                didPublicKey: 'test-public-key-alice',
                didPrivateKeyEnc: 'test-private-key-alice',
            },
        });
        testUsers.bob = await prismaService.user.create({
            data: {
                id: (0, uuid_1.v4)(),
                email: 'bob-test@example.com',
                handle: 'bob-test',
                didPublicKey: 'test-public-key-bob',
                didPrivateKeyEnc: 'test-private-key-bob',
            },
        });
        const unisphereTag = await prismaService.hashtag.create({
            data: { name: 'unisphere' },
        });
        const testingTag = await prismaService.hashtag.create({
            data: { name: 'testing' },
        });
        const federationTag = await prismaService.hashtag.create({
            data: { name: 'federation' },
        });
        const post1 = await prismaService.post.create({
            data: {
                text: 'Hello world! #unisphere #testing',
                authorId: testUsers.alice.id,
                indexed: true,
            },
        });
        await prismaService.hashtagsOnPosts.create({
            data: {
                postId: post1.id,
                hashtagId: unisphereTag.id,
            },
        });
        await prismaService.hashtagsOnPosts.create({
            data: {
                postId: post1.id,
                hashtagId: testingTag.id,
            },
        });
        const post2 = await prismaService.post.create({
            data: {
                text: 'Excited about the #unisphere #federation',
                authorId: testUsers.bob.id,
                indexed: true,
            },
        });
        await prismaService.hashtagsOnPosts.create({
            data: {
                postId: post2.id,
                hashtagId: unisphereTag.id,
            },
        });
        await prismaService.hashtagsOnPosts.create({
            data: {
                postId: post2.id,
                hashtagId: federationTag.id,
            },
        });
        await updateSearchVectors([post1.id, post2.id]);
    }
    async function updateSearchVectors(postIds) {
        for (const postId of postIds) {
            await prismaService.$executeRaw `
        UPDATE "Post"
        SET "searchVector" = to_tsvector('english', "text")
        WHERE id = ${postId}
      `;
        }
    }
    function createAuthToken(userId) {
        return jwtService.sign({
            sub: userId,
            email: 'test@example.com',
            handle: 'test-user',
        });
    }
});
//# sourceMappingURL=search.integration.spec.js.map
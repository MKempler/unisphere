import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

describe('Search Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let testUsers = {
    alice: null,
    bob: null
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    
    await app.init();

    // Clean the test database
    await cleanDatabase();
    
    // Create test users and posts
    await setupTestData();
    
    // Create JWT token for testing authenticated endpoints
    authToken = createAuthToken(testUsers.alice.id);
  });

  afterAll(async () => {
    await cleanDatabase();
    await app.close();
  });

  describe('Search API', () => {
    it('GET /search should return posts matching hashtag', async () => {
      const response = await request(app.getHttpServer())
        .get('/search?q=%23unisphere')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.posts).toBeDefined();
      expect(response.body.posts.length).toBe(2);
      expect(response.body.posts.some(post => post.text.includes('#unisphere'))).toBe(true);
    });

    it('GET /search should return posts matching text', async () => {
      const response = await request(app.getHttpServer())
        .get('/search?q=hello')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.posts).toBeDefined();
      expect(response.body.posts.length).toBe(1);
      expect(response.body.posts[0].text.includes('Hello')).toBe(true);
    });

    it('GET /search with pagination should work correctly', async () => {
      // First request without cursor
      const firstResponse = await request(app.getHttpServer())
        .get('/search?q=%23unisphere&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(firstResponse.body.posts).toBeDefined();
      expect(firstResponse.body.posts.length).toBe(1);
      expect(firstResponse.body.nextCursor).toBeDefined();

      // Second request with cursor
      const cursor = firstResponse.body.nextCursor;
      const secondResponse = await request(app.getHttpServer())
        .get(`/search?q=%23unisphere&cursor=${cursor}&limit=1`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(secondResponse.body.posts).toBeDefined();
      expect(secondResponse.body.posts.length).toBe(1);
      // Posts should be different
      expect(secondResponse.body.posts[0].id).not.toBe(firstResponse.body.posts[0].id);
    });
  });

  describe('Trending Hashtags API', () => {
    it('GET /search/trending should return trending hashtags', async () => {
      const response = await request(app.getHttpServer())
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
      const response = await request(app.getHttpServer())
        .get('/search/trending?limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(1);
    });
  });

  // Helper functions
  async function cleanDatabase() {
    // Clean up test data in reverse order of dependencies
    await prismaService.hashtagsOnPosts.deleteMany({});
    await prismaService.hashtag.deleteMany({});
    await prismaService.post.deleteMany({});
    await prismaService.follow.deleteMany({});
    await prismaService.user.deleteMany({});
  }

  async function setupTestData() {
    // Create test users
    testUsers.alice = await prismaService.user.create({
      data: {
        id: uuidv4(),
        email: 'alice-test@example.com',
        handle: 'alice-test',
        didPublicKey: 'test-public-key-alice',
        didPrivateKeyEnc: 'test-private-key-alice',
      },
    });

    testUsers.bob = await prismaService.user.create({
      data: {
        id: uuidv4(),
        email: 'bob-test@example.com',
        handle: 'bob-test',
        didPublicKey: 'test-public-key-bob',
        didPrivateKeyEnc: 'test-private-key-bob',
      },
    });

    // Create hashtags
    const unisphereTag = await prismaService.hashtag.create({
      data: { name: 'unisphere' },
    });

    const testingTag = await prismaService.hashtag.create({
      data: { name: 'testing' },
    });

    const federationTag = await prismaService.hashtag.create({
      data: { name: 'federation' },
    });

    // Create posts with hashtags
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

    // Run the search indexer
    await updateSearchVectors([post1.id, post2.id]);
  }

  async function updateSearchVectors(postIds: string[]) {
    // This simulates what the SearchIndexer would do
    for (const postId of postIds) {
      await prismaService.$executeRaw`
        UPDATE "Post"
        SET "searchVector" = to_tsvector('english', "text")
        WHERE id = ${postId}
      `;
    }
  }

  function createAuthToken(userId: string): string {
    return jwtService.sign({
      sub: userId,
      email: 'test@example.com',
      handle: 'test-user',
    });
  }
}); 
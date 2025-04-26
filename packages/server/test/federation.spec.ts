import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { PostDTO } from '@unisphere/shared';
import { v4 as uuidv4 } from 'uuid';

describe('Federation (Integration)', () => {
  let firstApp: INestApplication;
  let secondApp: INestApplication;
  let firstAppPrisma: PrismaService;
  let secondAppPrisma: PrismaService;
  let userId: string;
  let jwtToken: string;
  let postText: string;

  beforeAll(async () => {
    // Set up environment for first app (port 4000)
    process.env.PORT = '4000';
    process.env.PEERS = 'http://localhost:4100';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/unisphere_test_1?schema=public';
    
    // Create first app
    const firstModuleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    firstApp = firstModuleRef.createNestApplication();
    await firstApp.init();
    firstAppPrisma = firstModuleRef.get<PrismaService>(PrismaService);

    // Set up environment for second app (port 4100)
    process.env.PORT = '4100';
    process.env.PEERS = 'http://localhost:4000';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/unisphere_test_2?schema=public';

    // Create second app
    const secondModuleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    secondApp = secondModuleRef.createNestApplication();
    await secondApp.init();
    secondAppPrisma = secondModuleRef.get<PrismaService>(PrismaService);

    // Clean up existing data
    await firstAppPrisma.post.deleteMany();
    await firstAppPrisma.user.deleteMany();
    await secondAppPrisma.post.deleteMany();
    await secondAppPrisma.remoteUser.deleteMany();

    // Create test user in first app
    const testUser = await firstAppPrisma.user.create({
      data: {
        email: 'test@example.com',
        handle: 'testuser',
        didPublicKey: `did:key:${uuidv4()}`,
        didPrivateKeyEnc: 'mock-encrypted-private-key',
      },
    });

    userId = testUser.id;
    postText = `Test federation post ${Date.now()}`;

    // Generate JWT token
    // This is a mock token for testing
    jwtToken = 'Bearer mockJwtToken';
  }, 30000);

  afterAll(async () => {
    await firstApp.close();
    await secondApp.close();
  });

  it('should propagate a post from app1 to app2', async () => {
    // Create a post on the first app
    const createPostResponse = await request(firstApp.getHttpServer())
      .post('/post')
      .set('Authorization', jwtToken)
      .send({ text: postText })
      .expect(201);

    const post = createPostResponse.body.data as PostDTO;
    
    // Verify the post was created on first app
    expect(post).toBeDefined();
    expect(post.text).toBe(postText);
    
    // Poll second app for up to 5 seconds to check if post was federated
    const maxAttempts = 10;
    const delay = 500; // 500ms between attempts
    
    let federatedPost = null;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Wait for a bit
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Check in the second app's database directly
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
    
    // Verify the post was federated to the second app
    expect(federatedPost).toBeDefined();
    expect(federatedPost.text).toBe(postText);
    
    // Health check
    const healthResponse = await request(secondApp.getHttpServer())
      .get('/federation/health')
      .expect(200);
    
    expect(healthResponse.body.ok).toBe(true);
  }, 10000);
}); 
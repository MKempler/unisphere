import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
}));

jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn((question, callback) => callback('')),
    close: jest.fn(),
  })),
}));

// Import the module under test
import { exportAccount } from './account-export';

describe('account-export', () => {
  let prisma;
  
  beforeEach(() => {
    prisma = new PrismaClient();
    
    // Setup mock user data
    const mockUser = {
      id: 'user-id-1',
      handle: 'testuser',
      email: 'test@example.com',
      didPublicKey: 'did:key:test-public-key',
      didPrivateKeyEnc: 'encrypted-private-key',
      createdAt: new Date(),
      followers: [
        {
          follower: {
            id: 'follower-id-1',
            handle: 'follower1',
          },
          createdAt: new Date(),
        }
      ]
    };
    
    // Configure mocks
    prisma.user.findUnique.mockResolvedValue(mockUser);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('should export account data with all required fields', async () => {
    await exportAccount('test@example.com');
    
    // Verify the user was queried
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      include: {
        followers: {
          include: {
            follower: true
          }
        }
      }
    });
    
    // Verify the file was written with the correct data
    expect(fs.writeFileSync).toHaveBeenCalled();
    
    // Get the data that was written to the file
    const writeCall = fs.writeFileSync.mock.calls[0];
    const filename = writeCall[0];
    const jsonData = JSON.parse(writeCall[1]);
    
    // Verify filename
    expect(filename).toBe('testuser.json');
    
    // Verify export data structure
    expect(jsonData).toHaveProperty('id');
    expect(jsonData).toHaveProperty('handle');
    expect(jsonData).toHaveProperty('didPublicKey');
    expect(jsonData).toHaveProperty('didPrivateKeyEnc');
    expect(jsonData).toHaveProperty('followers');
    expect(Array.isArray(jsonData.followers)).toBe(true);
    
    // Verify follower data structure
    if (jsonData.followers.length > 0) {
      const follower = jsonData.followers[0];
      expect(follower).toHaveProperty('followerHandle');
      expect(follower).toHaveProperty('followerId');
      expect(follower).toHaveProperty('createdAt');
    }
  });
}); 
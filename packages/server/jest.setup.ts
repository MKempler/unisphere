/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { jest } from '@jest/globals';

// Set environment variables for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
process.env.FEDERATION_TIMEOUT_MS = process.env.FEDERATION_TIMEOUT_MS || '1000';
process.env.PEERS = process.env.PEERS || 'http://localhost:4100';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/unisphere_test';
process.env.DATABASE_URL_NODE_B = process.env.DATABASE_URL_NODE_B || 'postgres://postgres:postgres@localhost:5442/unisphere_b';
process.env.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'dummytoken';
process.env.CLIENT_BASE_URL = process.env.CLIENT_BASE_URL || 'http://localhost:3000';

// Mock modules that might cause issues in test environment
jest.mock('@unisphere/shared', () => {
  // Simple implementations
  return {
    signEvent: jest.fn((event: any) => ({ ...event, sig: 'mock-signature-for-testing' })),
    verifyEvent: jest.fn(() => true),
    UniEvent: Object,
    PostDTO: Object,
    ApiResponse: {
      success: jest.fn((data: any) => ({ ok: true, data })),
      error: jest.fn((error: any) => ({ ok: false, error })),
    }
  };
}); 
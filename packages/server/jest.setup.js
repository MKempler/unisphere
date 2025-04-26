// Set environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.FEDERATION_TIMEOUT_MS = '1000';
process.env.PEERS = 'http://localhost:4100';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/unisphere_test?schema=public';

// Mock modules that might cause issues in test environment
jest.mock('@unisphere/shared', () => {
  // Simple implementations
  return {
    signEvent: jest.fn((event) => ({ ...event, sig: 'mock-signature-for-testing' })),
    verifyEvent: jest.fn(() => true),
    UniEvent: Object,
    PostDTO: Object,
    ApiResponse: {
      success: jest.fn((data) => ({ ok: true, data })),
      error: jest.fn((error) => ({ ok: false, error })),
    }
  };
}); 
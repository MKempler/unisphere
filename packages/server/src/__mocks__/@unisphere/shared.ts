/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock interfaces
export interface UniEvent {
  id?: string;
  type: string;
  data: any;
  sig?: string;
  publicKey?: string;
}

export interface PostDTO {
  id?: string;
  title: string;
  content: string;
  authorId: string;
}

// Mock ApiResponse utility
export const ApiResponse = {
  success: (data: any) => ({ ok: true, data }),
  error: (error: any) => ({ ok: false, error }),
};

// Mock cryptographic functions
export const signEvent = jest.fn((event: any) => ({ 
  ...event, 
  sig: 'mock-signature-for-testing',
  publicKey: 'mock-public-key'
}));

export const verifyEvent = jest.fn(() => true); 
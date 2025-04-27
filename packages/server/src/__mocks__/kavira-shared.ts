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

export interface ProfileDTO {
  id: string;
  handle: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

export interface AuthResponseDTO {
  token: string;
  user: ProfileDTO;
}

export interface JWTPayload {
  sub: string;
  handle: string;
}

export interface CreatePostDTO {
  title: string;
  content: string;
}

export interface SignupRequestDTO {
  handle: string;
  displayName: string;
}

export interface SignupCallbackDTO {
  handle: string;
  code: string;
}

export interface AlgorithmicCircuitQuery {
  algorithm: string;
  params: Record<string, any>;
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
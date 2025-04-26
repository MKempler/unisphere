// Mock shared types for testing

export interface UniEvent<T = unknown> {
  id: string;
  type: "POST_CREATED";
  authorDid: string;
  createdAt: string;
  body: T;
  sig: string;
}

export interface PostDTO {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    handle: string;
  };
}

// Mock implementations
export const signEvent = jest.fn((event, privateKey) => {
  return { ...event, sig: 'mock-signature-for-testing' };
});

export const verifyEvent = jest.fn((event, publicKey) => {
  return event.sig === 'mock-signature-for-testing' && 
    !event.body.message || event.body.message !== 'Tampered message';
});

// Other required shared exports
export class ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;

  private constructor(ok: boolean, data?: T, error?: string) {
    this.ok = ok;
    this.data = data;
    this.error = error;
  }

  static success<T>(data: T): ApiResponse<T> {
    return new ApiResponse<T>(true, data);
  }

  static error<T>(error: string): ApiResponse<T> {
    return new ApiResponse<T>(false, undefined, error);
  }
} 
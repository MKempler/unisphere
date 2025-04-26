// Mock for kavira-shared module
export const UniEvent = {
  POST_CREATED: 'POST_CREATED',
  USER_FOLLOWED: 'USER_FOLLOWED',
  POST_LIKED: 'POST_LIKED',
};

export interface PostDTO {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    handle: string;
  };
  hashtags?: string[];
  federationId?: string;
  mediaUrl?: string;
}

export interface ProfileDTO {
  id: string;
  handle: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface AuthResponseDTO {
  token: string;
  user: {
    id: string;
    handle: string;
    email: string;
  };
}

export interface JWTPayload {
  sub: string;
  email: string;
  handle: string;
  iat?: number;
  exp?: number;
}

export function signEvent(): string {
  return 'mock-signature';
}

export function verifyEvent(): boolean {
  return true;
}

export type AlgorithmicCircuitQuery = {
  hashtags?: string[];
  keywords?: string[];
  minLikes?: number;
  excludeReplies?: boolean;
}; 
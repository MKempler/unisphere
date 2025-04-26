export interface UserDTO {
  id: string;
  email: string;
  handle: string;
  createdAt: string;
  // We don't expose the DID private key
}

export interface ProfileDTO {
  id: string;
  handle: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
} 
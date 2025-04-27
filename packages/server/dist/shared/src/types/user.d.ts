export interface UserDTO {
    id: string;
    email: string;
    handle: string;
    createdAt: string;
}
export interface ProfileDTO {
    id: string;
    handle: string;
    createdAt: string;
    followersCount: number;
    followingCount: number;
    isFollowing?: boolean;
}

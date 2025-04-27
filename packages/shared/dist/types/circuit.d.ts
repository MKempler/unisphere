import { PostDTO } from './post';
export interface CircuitDTO {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    ownerHandle?: string;
    isAlgo: boolean;
    query?: string;
    createdAt: string;
    followersCount: number;
    postsCount: number;
    isFollowing?: boolean;
}
export interface CircuitPostDTO {
    circuitId: string;
    post: PostDTO;
    addedAt: string;
}
export interface CircuitFeedDTO {
    circuit: CircuitDTO;
    posts: CircuitPostDTO[];
    nextCursor?: string;
}
export interface CreateCircuitDTO {
    name: string;
    description?: string;
    isAlgo?: boolean;
    query?: string;
}
export interface AlgorithmicCircuitQuery {
    hashtags?: string[];
    minLikes?: number;
}

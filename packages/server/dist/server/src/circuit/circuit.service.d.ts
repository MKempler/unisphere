import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../common/api-response';
export declare class CircuitService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createManual(name: string, description: string | undefined, ownerId: string): Promise<ApiResponse<any>>;
    createAlgorithmic(name: string, description: string | undefined, ownerId: string, query: any): Promise<ApiResponse<any>>;
    addPost(circuitId: string, postId: string, curatorId: string): Promise<ApiResponse<boolean>>;
    follow(circuitId: string, userId: string): Promise<ApiResponse<boolean>>;
    unfollow(circuitId: string, userId: string): Promise<ApiResponse<boolean>>;
    getById(circuitId: string, currentUserId?: string): Promise<ApiResponse<any>>;
    listDirectory(cursor?: string, limit?: number, currentUserId?: string): Promise<ApiResponse<{
        circuits: any[];
        nextCursor?: string;
    }>>;
    listFeed(circuitId: string, cursor?: string, limit?: number, currentUserId?: string): Promise<ApiResponse<any>>;
    mapCircuitToDTO(circuit: any): {
        id: any;
        name: any;
        description: any;
        query: any;
        isAlgo: any;
        createdAt: any;
        ownerHandle: any;
        ownerId: any;
        followersCount: number;
        postsCount: number;
    };
}

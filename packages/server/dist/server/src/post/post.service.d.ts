import { PrismaService } from '../prisma/prisma.service';
import { PostDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';
import { EventService } from '../federation/event.service';
export declare class PostService {
    private readonly prisma;
    private readonly eventService;
    constructor(prisma: PrismaService, eventService: EventService);
    createPost(userId: string, text: string, mediaUrl?: string): Promise<ApiResponse<PostDTO>>;
    private extractHashtags;
    getTimeline(userId: string, cursor?: string, limit?: number): Promise<ApiResponse<PostDTO[]>>;
    getUserPosts(handle: string): Promise<ApiResponse<PostDTO[]>>;
}

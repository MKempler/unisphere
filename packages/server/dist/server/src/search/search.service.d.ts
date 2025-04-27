import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PostDTO } from '@unisphere/shared';
interface SearchResult {
    posts: PostDTO[];
    nextCursor: string | null;
}
interface TrendingTag {
    name: string;
    count: number;
}
export declare class SearchService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    search(query: string, cursor?: string, limit?: number): Promise<SearchResult>;
    getTrendingTags(limit?: number): Promise<TrendingTag[]>;
    extractHashtags(text: string): string[];
    private mapPostsToDTO;
}
export {};

import { PrismaService } from '../prisma/prisma.service';
import { ProfileDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(handle: string, currentUserId?: string): Promise<ApiResponse<ProfileDTO>>;
    followUser(followerId: string, followeeHandle: string): Promise<ApiResponse<boolean>>;
}

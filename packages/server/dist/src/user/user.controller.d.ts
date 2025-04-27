import { UserService } from './user.service';
import { ProfileDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(handle: string, req: any): Promise<ApiResponse<ProfileDTO>>;
    followUser(handle: string, req: any): Promise<ApiResponse<{
        success: boolean;
    }>>;
}

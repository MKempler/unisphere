import { PostService } from './post.service';
import { CreatePostDto } from './dto/post.dto';
import { PostDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    createPost(createPostDto: CreatePostDto, req: any): Promise<ApiResponse<PostDTO>>;
    getTimeline(req: any, cursor?: string, limit?: number): Promise<ApiResponse<PostDTO[]>>;
}

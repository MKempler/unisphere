import { Controller, Get, Post, Body, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/post.dto';
import { PostDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';

@ApiTags('posts')
@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('post')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @SwaggerResponse({ status: 201, description: 'Post created successfully' })
  @SwaggerResponse({ status: 400, description: 'Bad request' })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req: any,
  ): Promise<ApiResponse<PostDTO>> {
    const result = await this.postService.createPost(req.user.id, createPostDto.text, createPostDto.mediaUrl);
    
    if (!result.ok) {
      throw new BadRequestException(result.error);
    }
    
    return result;
  }

  @Get('timeline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get timeline posts (self + following)' })
  @SwaggerResponse({ status: 200, description: 'Timeline retrieved successfully' })
  async getTimeline(
    @Request() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<ApiResponse<PostDTO[]>> {
    const result = await this.postService.getTimeline(
      req.user.id,
      cursor,
      limit ? parseInt(limit as any, 10) : undefined,
    );
    
    if (!result.ok) {
      throw new BadRequestException(result.error);
    }
    
    return result;
  }
} 
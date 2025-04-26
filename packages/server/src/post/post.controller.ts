import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/post.dto';
import { PostDTO } from '@unisphere/shared';

@ApiTags('posts')
@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('post')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully', type: PostDTO })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req: any,
  ): Promise<PostDTO> {
    return this.postService.createPost(req.user.id, createPostDto.text);
  }

  @Get('timeline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get timeline posts (self + following)' })
  @ApiResponse({ status: 200, description: 'Timeline retrieved successfully', type: [PostDTO] })
  async getTimeline(@Request() req: any): Promise<PostDTO[]> {
    return this.postService.getTimeline(req.user.id);
  }
} 
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(authorId: string, text: string): Promise<ApiResponse<PostDTO>> {
    // Validate text length (max 500 characters)
    if (!text || text.length > 500) {
      return ApiResponse.error('Post text must be between 1 and 500 characters');
    }

    try {
      const post = await this.prisma.post.create({
        data: {
          text,
          authorId,
        },
        include: {
          author: true,
        },
      });

      return ApiResponse.success({
        id: post.id,
        text: post.text,
        createdAt: post.createdAt.toISOString(),
        author: {
          id: post.author.id,
          handle: post.author.handle,
        },
      });
    } catch (error) {
      return ApiResponse.error('Failed to create post');
    }
  }

  async getTimeline(userId: string, cursor?: string, limit: number = 20): Promise<ApiResponse<PostDTO[]>> {
    try {
      // Get posts from the user and users they follow
      const following = await this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followeeId: true },
      });

      const followingIds = following.map(follow => follow.followeeId);
      const authorIds = [userId, ...followingIds];

      // Cursor-based pagination
      const cursorCondition = cursor
        ? {
            cursor: { id: cursor },
            skip: 1, // Skip the cursor
          }
        : {};

      const posts = await this.prisma.post.findMany({
        where: {
          authorId: { in: authorIds },
        },
        include: {
          author: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        ...cursorCondition,
      });

      return ApiResponse.success(posts.map(post => ({
        id: post.id,
        text: post.text,
        createdAt: post.createdAt.toISOString(),
        author: {
          id: post.author.id,
          handle: post.author.handle,
        },
      })));
    } catch (error) {
      return ApiResponse.error('Failed to fetch timeline');
    }
  }

  async getUserPosts(handle: string): Promise<ApiResponse<PostDTO[]>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { handle },
      });

      if (!user) {
        return ApiResponse.error(`User with handle @${handle} not found`);
      }

      const posts = await this.prisma.post.findMany({
        where: {
          authorId: user.id,
        },
        include: {
          author: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return ApiResponse.success(posts.map(post => ({
        id: post.id,
        text: post.text,
        createdAt: post.createdAt.toISOString(),
        author: {
          id: post.author.id,
          handle: post.author.handle,
        },
      })));
    } catch (error) {
      return ApiResponse.error('Failed to fetch user posts');
    }
  }
} 
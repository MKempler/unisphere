import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';
import { EventService } from '../federation/event.service';
import { UniEvent } from '@unisphere/shared';
import { v4 as uuidv4 } from 'uuid';
import { decrypt } from '../common/crypto';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventService,
  ) {}

  async createPost(authorId: string, text: string): Promise<ApiResponse<PostDTO>> {
    // Validate text length (max 500 characters)
    if (!text || text.length > 500) {
      return ApiResponse.error('Post text must be between 1 and 500 characters');
    }

    try {
      // Get the user to access DID keys
      const user = await this.prisma.user.findUnique({
        where: { id: authorId },
      });

      if (!user) {
        return ApiResponse.error('User not found');
      }

      const post = await this.prisma.post.create({
        data: {
          text,
          authorId,
        },
        include: {
          author: true,
        },
      });

      const postDTO: PostDTO = {
        id: post.id,
        text: post.text,
        createdAt: post.createdAt.toISOString(),
        author: {
          id: post.author.id,
          handle: post.author.handle,
        },
      };

      // Broadcast to peers
      try {
        if (user.didPublicKey && user.didPrivateKeyEnc) {
          // Decrypt the private key
          const privateKey = user.didPrivateKeyEnc; // In reality, we would decrypt this

          // Create and publish federation event
          const event: UniEvent<PostDTO> = {
            id: uuidv4(),
            type: "POST_CREATED",
            authorDid: user.didPublicKey,
            createdAt: new Date().toISOString(),
            body: postDTO,
            sig: '' // This would be a real signature in production
          };
          
          // Publish event to peers
          await this.eventService.publish(event);
        }
      } catch (error) {
        // Log the error but don't fail the post creation
        console.error('Failed to broadcast post to peers:', error);
      }

      return ApiResponse.success(postDTO);
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

      // Get local posts
      const localPosts = await this.prisma.post.findMany({
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

      // Get remote posts
      const remotePosts = await this.prisma.post.findMany({
        where: {
          remoteAuthorId: { not: null },
        },
        include: {
          remoteAuthor: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      // Combine and sort posts
      const allPosts = [
        ...localPosts.map(post => ({
          id: post.id,
          text: post.text,
          createdAt: post.createdAt.toISOString(),
          author: {
            id: post.author.id,
            handle: post.author.handle,
          },
        })),
        ...remotePosts.map(post => ({
          id: post.id,
          text: post.text,
          createdAt: post.createdAt.toISOString(),
          author: {
            id: post.remoteAuthor.id,
            handle: post.remoteAuthor.handle || 'remote-user',
          },
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
       .slice(0, limit);

      return ApiResponse.success(allPosts);
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
        // Check if it's a remote user
        const remoteUser = await this.prisma.remoteUser.findFirst({
          where: { handle },
        });

        if (!remoteUser) {
          return ApiResponse.error(`User with handle @${handle} not found`);
        }

        // Get posts by remote user
        const posts = await this.prisma.post.findMany({
          where: {
            remoteAuthorId: remoteUser.id,
          },
          include: {
            remoteAuthor: true,
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
            id: post.remoteAuthor.id,
            handle: post.remoteAuthor.handle || 'remote-user',
          },
        })));
      }

      // For local users, get their posts
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
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';
import { EventService } from '../federation/event.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventService,
  ) {}

  async createPost(userId: string, text: string, mediaUrl?: string): Promise<ApiResponse<PostDTO>> {
    try {
      // Extract hashtags from the text
      const hashtagNames = this.extractHashtags(text);
      
      // Create post with federation ID
      const post = await this.prisma.$transaction(async (tx) => {
        // Create the post first
        const newPost = await tx.post.create({
          data: {
            text,
            authorId: userId,
            mediaUrl,
            federationId: uuidv4(),
            indexed: true,
          },
        });

        // Create hashtags that don't exist yet and link them to the post
        for (const name of hashtagNames) {
          // Find or create the hashtag
          const hashtag = await tx.hashtag.upsert({
            where: { name },
            create: { name },
            update: {},
          });

          // Connect hashtag to post
          await tx.hashtagsOnPosts.create({
            data: {
              postId: newPost.id,
              hashtagId: hashtag.id,
            },
          });
        }

        return await tx.post.findUnique({
          where: { id: newPost.id },
          include: {
            author: true,
            hashtags: {
              include: {
                hashtag: true,
              },
            },
          },
        });
      });

      if (!post) {
        return ApiResponse.error('Failed to create post');
      }

      // Publish federation event
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (user && user.didPublicKey) {
        this.eventService.publish({
          id: uuidv4(),
          type: 'POST_CREATED',
          authorDid: user.didPublicKey,
          createdAt: new Date().toISOString(),
          body: {
            id: post.id,
            text: post.text,
            mediaUrl: post.mediaUrl,
          },
          sig: '', // This would be a real signature in production
        });
      }

      // Format response
      return ApiResponse.success({
        id: post.id,
        text: post.text,
        createdAt: post.createdAt.toISOString(),
        author: {
          id: post.author.id,
          handle: post.author.handle,
        },
        hashtags: post.hashtags.map(h => h.hashtag.name),
        mediaUrl: post.mediaUrl,
      });
    } catch (error) {
      return ApiResponse.error('Failed to create post');
    }
  }

  // Extract hashtags from text
  private extractHashtags(text: string): string[] {
    if (!text) return [];
    
    const hashtagPattern = /#(\w+)/g;
    const matches = text.match(hashtagPattern);
    
    if (!matches) return [];
    
    // Remove the # prefix and convert to lowercase
    return matches.map(tag => tag.substring(1).toLowerCase());
  }

  async getTimeline(userId: string, cursor?: string, limit: number = 20): Promise<ApiResponse<PostDTO[]>> {
    try {
      // Get users that this user follows
      const following = await this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followeeId: true },
      });
      
      const followingIds = following.map(f => f.followeeId);
      
      // Include the user's own posts
      followingIds.push(userId);
      
      // Build cursor condition if cursor is provided
      const pagination = cursor
        ? { take: limit, cursor: { id: cursor }, skip: 1 }
        : { take: limit };
      
      // Query posts
      const posts = await this.prisma.post.findMany({
        where: {
          authorId: { in: followingIds },
        },
        ...pagination,
        orderBy: { createdAt: 'desc' },
        include: {
          author: true,
          hashtags: {
            include: {
              hashtag: true,
            },
          },
        },
      });
      
      // Format for response
      const timeline = posts.map(post => ({
        id: post.id,
        text: post.text,
        createdAt: post.createdAt.toISOString(),
        author: {
          id: post.author.id,
          handle: post.author.handle,
        },
        hashtags: post.hashtags.map(h => h.hashtag.name),
        mediaUrl: post.mediaUrl,
      }));
      
      return ApiResponse.success(timeline);
    } catch (error) {
      return ApiResponse.error('Failed to get timeline');
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
            hashtags: {
              include: {
                hashtag: true,
              },
            },
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
          hashtags: post.hashtags.map(relation => relation.hashtag.name),
        })));
      }

      // For local users, get their posts
      const posts = await this.prisma.post.findMany({
        where: {
          authorId: user.id,
        },
        include: {
          author: true,
          hashtags: {
            include: {
              hashtag: true,
            },
          },
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
        hashtags: post.hashtags.map(relation => relation.hashtag.name),
      })));
    } catch (error) {
      return ApiResponse.error('Failed to fetch user posts');
    }
  }
} 
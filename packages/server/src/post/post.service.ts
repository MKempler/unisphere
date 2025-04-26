import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostDTO } from '@unisphere/shared';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(authorId: string, text: string): Promise<PostDTO> {
    const post = await this.prisma.post.create({
      data: {
        text,
        authorId,
      },
      include: {
        author: true,
      },
    });

    return {
      id: post.id,
      text: post.text,
      createdAt: post.createdAt.toISOString(),
      author: {
        id: post.author.id,
        handle: post.author.handle,
      },
    };
  }

  async getTimeline(userId: string): Promise<PostDTO[]> {
    // Get posts from the user and users they follow
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followeeId: true },
    });

    const followingIds = following.map(follow => follow.followeeId);
    const authorIds = [userId, ...followingIds];

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
      take: 50, // Limit to 50 posts
    });

    return posts.map(post => ({
      id: post.id,
      text: post.text,
      createdAt: post.createdAt.toISOString(),
      author: {
        id: post.author.id,
        handle: post.author.handle,
      },
    }));
  }

  async getUserPosts(handle: string): Promise<PostDTO[]> {
    const user = await this.prisma.user.findUnique({
      where: { handle },
    });

    if (!user) {
      return [];
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

    return posts.map(post => ({
      id: post.id,
      text: post.text,
      createdAt: post.createdAt.toISOString(),
      author: {
        id: post.author.id,
        handle: post.author.handle,
      },
    }));
  }
} 
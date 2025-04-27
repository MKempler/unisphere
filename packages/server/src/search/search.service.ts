import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PostDTO } from '@unisphere/shared';
import { Prisma } from '@prisma/client';

interface SearchResult {
  posts: PostDTO[];
  nextCursor: string | null;
}

interface TrendingTag {
  name: string;
  count: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Perform full-text search on posts
   * @param query Search query
   * @param cursor Pagination cursor (post ID)
   * @param limit Number of results to return
   */
  async search(query: string, cursor?: string, limit: number = 20): Promise<SearchResult> {
    try {
      // Clean and prepare the search query
      const searchTerms = query
        .toLowerCase()
        .replace(/[^\w\s#]/g, '')
        .split(/\s+/)
        .filter(term => term.length > 0);

      if (searchTerms.length === 0) {
        return { posts: [], nextCursor: null };
      }

      // Extract hashtags from search query
      const hashtags = searchTerms
        .filter(term => term.startsWith('#'))
        .map(tag => tag.slice(1));
      
      // Regular search terms (non-hashtags)
      const regularTerms = searchTerms.filter(term => !term.startsWith('#'));

      // Build the where clause
      const where: any = {
        indexed: true,
        OR: []
      };

      // Add hashtag conditions
      if (hashtags.length > 0) {
        where.OR.push({
          hashtags: {
            some: {
              hashtag: {
                name: { in: hashtags }
              }
            }
          }
        });
      }

      // Add content search conditions using text field
      if (regularTerms.length > 0) {
        regularTerms.forEach(term => {
          where.OR.push({ text: { contains: term, mode: 'insensitive' } });
        });
      }

      // Build pagination params as a properly typed object
      const paginationParams: Prisma.PostFindManyArgs = cursor
        ? { take: limit + 1, cursor: { id: cursor }, skip: 1 }
        : { take: limit + 1 };

      // Use the spread with properly typed params
      const posts = await this.prisma.post.findMany({
        ...paginationParams,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              handle: true,
            },
          },
          remoteAuthor: {
            select: {
              id: true,
              handle: true,
            }
          },
          hashtags: {
            include: {
              hashtag: {
                select: {
                  name: true,
                }
              }
            }
          }
        },
        where,
      });

      // Get the next cursor
      const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;

      // Map posts to DTOs
      const mappedPosts = await this.mapPostsToDTO(posts);

      return {
        posts: mappedPosts,
        nextCursor,
      };
    } catch (error) {
      this.logger.error(`Error searching posts: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get trending hashtags from the last hour
   * @param limit Number of trending tags to return
   */
  async getTrendingTags(limit: number = 10): Promise<TrendingTag[]> {
    try {
      // Calculate trending period (last 1 hour)
      const trendingPeriod = new Date();
      trendingPeriod.setHours(trendingPeriod.getHours() - 1);

      // Find trending hashtags
      const trendingTags = await this.prisma.hashtag.findMany({
        where: {
          posts: {
            some: {
              createdAt: { gte: trendingPeriod },
            },
          },
        },
        orderBy: {
          posts: {
            _count: 'desc',
          },
        },
        take: limit,
        select: {
          name: true,
          _count: {
            select: {
              posts: {
                where: {
                  createdAt: { gte: trendingPeriod },
                },
              },
            },
          },
        },
      });

      return trendingTags.map((tag: { name: string; _count: { posts: number } }) => ({
        name: tag.name,
        count: tag._count.posts,
      }));
    } catch (error) {
      this.logger.error(`Error fetching trending tags: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Extract hashtags from post text
   * @param text Post text content
   * @returns Array of hashtags without the # symbol
   */
  extractHashtags(text: string): string[] {
    if (!text) return [];
    
    // Match hashtags (words starting with # followed by word characters)
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    
    if (!matches) return [];
    
    // Remove the # prefix and convert to lowercase
    return matches.map(tag => tag.substring(1).toLowerCase());
  }

  /**
   * Map raw post query results to DTOs
   */
  private async mapPostsToDTO(posts: any[]): Promise<PostDTO[]> {
    if (posts.length === 0) return [];

    return posts.map(post => {
      // Get author info (either local or remote)
      const authorInfo = post.author || post.remoteAuthor;
      
      // Extract hashtags
      const hashtags = post.hashtags?.map(relation => relation.hashtag.name) || [];
      
      return {
        id: post.id,
        text: post.text,
        createdAt: post.createdAt.toISOString(),
        author: {
          id: authorInfo?.id || 'unknown',
          handle: authorInfo?.handle || 'unknown',
        },
        hashtags: hashtags
      };
    });
  }
} 
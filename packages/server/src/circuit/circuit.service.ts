import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../common/api-response';

@Injectable()
export class CircuitService {
  private readonly logger = new Logger(CircuitService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a new manual circuit
   */
  async createManual(
    name: string, 
    description: string | undefined, 
    ownerId: string
  ): Promise<ApiResponse<any>> {
    try {
      // Validate name
      if (!name.trim()) {
        return ApiResponse.error('Circuit name is required');
      }

      // Create the circuit
      const circuit = await this.prisma.circuit.create({
        data: {
          name,
          description,
          ownerId,
          isAlgo: false,
        },
      });

      return ApiResponse.success({
        id: circuit.id,
        name: circuit.name,
        description: circuit.description,
        ownerId: circuit.ownerId,
        isAlgo: circuit.isAlgo,
        query: circuit.query,
        createdAt: circuit.createdAt.toISOString(),
        followersCount: 0,
        postsCount: 0,
      });
    } catch (error) {
      this.logger.error(`Error creating circuit: ${error.message}`, error.stack);
      return ApiResponse.error('Failed to create circuit');
    }
  }

  /**
   * Create a new algorithmic circuit
   */
  async createAlgorithmic(
    name: string, 
    description: string | undefined, 
    ownerId: string,
    query: any
  ): Promise<ApiResponse<any>> {
    try {
      // Validate name
      if (!name.trim()) {
        return ApiResponse.error('Circuit name is required');
      }

      // Validate query
      if (!query || (!query.hashtags?.length && !query.minLikes)) {
        return ApiResponse.error('Algorithmic circuit requires at least one filter criterion');
      }

      // Create the circuit
      const circuit = await this.prisma.circuit.create({
        data: {
          name,
          description,
          ownerId,
          isAlgo: true,
          query: JSON.stringify(query),
        },
      });

      return ApiResponse.success({
        id: circuit.id,
        name: circuit.name,
        description: circuit.description,
        ownerId: circuit.ownerId,
        isAlgo: circuit.isAlgo,
        query: circuit.query,
        createdAt: circuit.createdAt.toISOString(),
        followersCount: 0,
        postsCount: 0,
      });
    } catch (error) {
      this.logger.error(`Error creating algorithmic circuit: ${error.message}`, error.stack);
      return ApiResponse.error('Failed to create algorithmic circuit');
    }
  }

  /**
   * Add a post to a circuit
   */
  async addPost(
    circuitId: string, 
    postId: string, 
    curatorId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      // Verify circuit exists and curator is the owner
      const circuit = await this.prisma.circuit.findUnique({
        where: { id: circuitId },
      });

      if (!circuit) {
        return ApiResponse.error('Circuit not found');
      }

      if (circuit.ownerId !== curatorId) {
        return ApiResponse.error('Only the circuit owner can add posts');
      }

      // Verify post exists
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return ApiResponse.error('Post not found');
      }

      // Add post to circuit (if not already added)
      await this.prisma.circuitPost.upsert({
        where: {
          circuitId_postId: {
            circuitId,
            postId,
          },
        },
        update: {}, // No need to update anything if it exists
        create: {
          circuitId,
          postId,
        },
      });

      return ApiResponse.success(true);
    } catch (error) {
      this.logger.error(`Error adding post to circuit: ${error.message}`, error.stack);
      return ApiResponse.error('Failed to add post to circuit');
    }
  }

  /**
   * Follow a circuit
   */
  async follow(
    circuitId: string, 
    userId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      // Verify circuit exists
      const circuit = await this.prisma.circuit.findUnique({
        where: { id: circuitId },
      });

      if (!circuit) {
        return ApiResponse.error('Circuit not found');
      }

      // Add follow relationship (if not already following)
      await this.prisma.circuitFollow.upsert({
        where: {
          circuitId_userId: {
            circuitId,
            userId,
          },
        },
        update: {}, // No need to update anything if it exists
        create: {
          circuitId,
          userId,
        },
      });

      return ApiResponse.success(true);
    } catch (error) {
      this.logger.error(`Error following circuit: ${error.message}`, error.stack);
      return ApiResponse.error('Failed to follow circuit');
    }
  }

  /**
   * Unfollow a circuit
   */
  async unfollow(
    circuitId: string, 
    userId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      // Delete the follow relationship if it exists
      await this.prisma.circuitFollow.deleteMany({
        where: {
          circuitId,
          userId,
        },
      });

      return ApiResponse.success(true);
    } catch (error) {
      this.logger.error(`Error unfollowing circuit: ${error.message}`, error.stack);
      return ApiResponse.error('Failed to unfollow circuit');
    }
  }

  /**
   * Get circuit by ID
   */
  async getById(
    circuitId: string,
    currentUserId?: string
  ): Promise<ApiResponse<any>> {
    try {
      // Get the circuit with follower and post counts
      const circuit = await this.prisma.circuit.findUnique({
        where: { id: circuitId },
        include: {
          owner: true,
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
        },
      });

      if (!circuit) {
        return ApiResponse.error('Circuit not found');
      }

      // Check if the current user is following this circuit
      let isFollowing = false;
      if (currentUserId) {
        const follow = await this.prisma.circuitFollow.findUnique({
          where: {
            circuitId_userId: {
              circuitId,
              userId: currentUserId,
            },
          },
        });
        isFollowing = !!follow;
      }

      return ApiResponse.success({
        id: circuit.id,
        name: circuit.name,
        description: circuit.description,
        ownerId: circuit.ownerId,
        ownerHandle: circuit.owner?.handle,
        isAlgo: circuit.isAlgo,
        query: circuit.query,
        createdAt: circuit.createdAt.toISOString(),
        followersCount: circuit._count.followers,
        postsCount: circuit._count.posts,
        isFollowing,
      });
    } catch (error) {
      this.logger.error(`Error getting circuit: ${error.message}`, error.stack);
      return ApiResponse.error('Failed to get circuit details');
    }
  }

  /**
   * List circuits directory
   */
  async listDirectory(
    cursor?: string,
    limit: number = 20,
    currentUserId?: string
  ): Promise<ApiResponse<{ circuits: any[], nextCursor?: string }>> {
    try {
      // Prepare the query
      const take = limit + 1; // Take one more for cursor calculation

      // Build the query with cursor-based pagination
      const query: any = {
        take,
        orderBy: [
          { followers: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
        include: {
          owner: true,
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
        },
      };

      // Add cursor if provided
      if (cursor) {
        const [id, createdAt] = cursor.split('_');
        query.cursor = {
          id,
        };
        query.skip = 1; // Skip the cursor
      }

      // Execute the query
      const circuits = await this.prisma.circuit.findMany(query);

      // Determine the next cursor
      let nextCursor: string | undefined = undefined;
      if (circuits.length > limit) {
        const lastCircuit = circuits[limit - 1];
        nextCursor = `${lastCircuit.id}_${lastCircuit.createdAt.toISOString()}`;
        circuits.pop(); // Remove the extra item
      }

      // Check which circuits the current user is following
      const followedCircuitIds = new Set<string>();
      if (currentUserId) {
        const follows = await this.prisma.circuitFollow.findMany({
          where: {
            userId: currentUserId,
          },
          select: {
            circuitId: true,
          },
        });
        follows.forEach(follow => followedCircuitIds.add(follow.circuitId));
      }

      // Format the results
      const formattedCircuits = circuits.map(circuit => ({
        id: circuit.id,
        name: circuit.name,
        description: circuit.description,
        ownerId: circuit.ownerId,
        ownerHandle: circuit.owner?.handle,
        isAlgo: circuit.isAlgo,
        query: circuit.query,
        createdAt: circuit.createdAt.toISOString(),
        followersCount: circuit._count.followers,
        postsCount: circuit._count.posts,
        isFollowing: followedCircuitIds.has(circuit.id),
      }));

      return ApiResponse.success({
        circuits: formattedCircuits,
        nextCursor,
      });
    } catch (error) {
      this.logger.error(`Error listing circuits: ${error.message}`, error.stack);
      return ApiResponse.error('Failed to list circuits');
    }
  }

  /**
   * Get circuit feed (posts in the circuit)
   */
  async listFeed(
    circuitId: string, 
    cursor?: string,
    limit: number = 20,
    currentUserId?: string
  ): Promise<ApiResponse<any>> {
    try {
      // Get the circuit with follower count
      const circuit = await this.prisma.circuit.findUnique({
        where: { id: circuitId },
        include: {
          owner: true,
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
        },
      });

      if (!circuit) {
        return ApiResponse.error('Circuit not found');
      }

      // Check if the current user is following this circuit
      let isFollowing = false;
      if (currentUserId) {
        const follow = await this.prisma.circuitFollow.findUnique({
          where: {
            circuitId_userId: {
              circuitId,
              userId: currentUserId,
            },
          },
        });
        isFollowing = !!follow;
      }

      // Format the circuit data
      const circuitData = {
        id: circuit.id,
        name: circuit.name,
        description: circuit.description,
        ownerId: circuit.ownerId,
        ownerHandle: circuit.owner?.handle,
        isAlgo: circuit.isAlgo,
        query: circuit.query,
        createdAt: circuit.createdAt.toISOString(),
        followersCount: circuit._count.followers,
        postsCount: circuit._count.posts,
        isFollowing,
      };

      // Prepare the query for circuit posts
      const take = limit + 1; // Take one more for cursor calculation

      // Build the query with cursor-based pagination
      const query: any = {
        take,
        where: {
          circuitId,
        },
        orderBy: {
          addedAt: 'desc',
        },
        include: {
          post: {
            include: {
              author: true,
              remoteAuthor: true,
            },
          },
        },
      };

      // Add cursor if provided
      if (cursor) {
        const [postId, addedAt] = cursor.split('_');
        query.cursor = {
          circuitId_postId: {
            circuitId,
            postId,
          },
        };
        query.skip = 1; // Skip the cursor
      }

      // Execute the query
      const circuitPosts = await this.prisma.circuitPost.findMany(query);

      // Determine the next cursor
      let nextCursor: string | undefined = undefined;
      if (circuitPosts.length > limit) {
        const lastPost = circuitPosts[limit - 1];
        nextCursor = `${lastPost.postId}_${lastPost.addedAt.toISOString()}`;
        circuitPosts.pop(); // Remove the extra item
      }

      // Format the posts
      const posts = circuitPosts.map(cp => {
        const { post } = cp;
        
        // Determine if it's a local or remote post
        const isLocal = !!post.authorId;
        const author = isLocal ? post.author : post.remoteAuthor;
        
        return {
          circuitId: cp.circuitId,
          post: {
            id: post.id,
            text: post.text,
            authorId: post.authorId || post.remoteAuthorId,
            authorHandle: author?.handle,
            createdAt: post.createdAt.toISOString(),
            isRemote: !isLocal,
            federationId: post.federationId,
          },
          addedAt: cp.addedAt.toISOString(),
        };
      });

      return ApiResponse.success({
        circuit: circuitData,
        posts,
        nextCursor,
      });
    } catch (error) {
      this.logger.error(`Error getting circuit feed: ${error.message}`, error.stack);
      return ApiResponse.error('Failed to get circuit feed');
    }
  }
} 
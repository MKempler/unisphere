import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class SearchIndexer implements OnModuleInit {
  private readonly logger = new Logger(SearchIndexer.name);
  private readonly indexingInterval: number;
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    // Get indexing interval from env or use default (30 seconds)
    this.indexingInterval = this.configService.get<number>('SEARCH_CRON_MS', 30000);
  }

  onModuleInit() {
    this.logger.log(`Search indexer initialized with interval: ${this.indexingInterval}ms`);
    
    // Set up the cron job dynamically based on config
    if (this.indexingInterval > 0) {
      const interval = setInterval(() => this.indexUnindexedPosts(), this.indexingInterval);
      this.schedulerRegistry.addInterval('search-indexer', interval);
    }
  }

  /**
   * Scheduled task to index all unindexed posts
   * Runs every 30 seconds by default, configurable via SEARCH_CRON_MS env var
   */
  @Cron('*/30 * * * * *') // Fallback to 30 seconds if interval setup fails
  async indexUnindexedPosts() {
    // Prevent overlapping runs
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    try {
      // Find all unindexed posts
      const unindexedPosts = await this.prisma.post.findMany({
        where: {
          indexed: false,
        },
        take: 100, // Process in batches
      });

      if (unindexedPosts.length === 0) {
        return;
      }

      this.logger.debug(`Indexing ${unindexedPosts.length} posts`);

      // Update each post to mark it as indexed, which will trigger the DB function
      const updatePromises = unindexedPosts.map(post =>
        this.prisma.post.update({
          where: { id: post.id },
          data: { indexed: true },
        })
      );

      await Promise.all(updatePromises);
      this.logger.debug(`Indexed ${unindexedPosts.length} posts successfully`);
    } catch (error) {
      this.logger.error('Error indexing posts:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manually index a specific post
   * @param postId ID of the post to index
   */
  async indexPost(postId: string): Promise<void> {
    try {
      await this.prisma.post.update({
        where: { id: postId },
        data: { indexed: true },
      });
    } catch (error) {
      this.logger.error(`Error indexing post ${postId}:`, error);
    }
  }
} 
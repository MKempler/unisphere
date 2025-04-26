import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AlgorithmicCircuitQuery } from '@unisphere/shared';

@Injectable()
export class CircuitAlgoRunnerService {
  private readonly logger = new Logger(CircuitAlgoRunnerService.name);
  private readonly cronInterval: number;
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    // Get interval from env or use default (5 minutes)
    this.cronInterval = this.configService.get<number>('CIRCUIT_ALGO_CRON_MS', 300000);
  }

  onModuleInit() {
    this.logger.log(`Circuit algorithm runner initialized with interval: ${this.cronInterval}ms`);
    
    // Set up the cron job dynamically based on config
    if (this.cronInterval > 0) {
      const interval = setInterval(() => this.processAlgorithmicCircuits(), this.cronInterval);
      this.schedulerRegistry.addInterval('circuit-algo-runner', interval);
    }
  }

  /**
   * Process all algorithmic circuits
   * Scheduled to run every 5 minutes by default, configurable via CIRCUIT_ALGO_CRON_MS env var
   */
  @Cron('*/5 * * * *') // Fallback to every 5 minutes if interval setup fails
  async processAlgorithmicCircuits() {
    // Prevent overlapping runs
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    try {
      // Find all algorithmic circuits
      const algoCircuits = await this.prisma.circuit.findMany({
        where: {
          isAlgo: true,
        },
      });

      if (algoCircuits.length === 0) {
        return;
      }

      this.logger.debug(`Processing ${algoCircuits.length} algorithmic circuits`);

      // Process each circuit
      for (const circuit of algoCircuits) {
        await this.processCircuit(circuit.id, circuit.query);
      }

      this.logger.debug(`Completed algorithmic circuit processing`);
    } catch (error) {
      this.logger.error('Error processing algorithmic circuits:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process a single algorithmic circuit
   */
  private async processCircuit(circuitId: string, queryStr?: string) {
    if (!queryStr) {
      this.logger.warn(`Circuit ${circuitId} has no query, skipping`);
      return;
    }

    try {
      // Parse the query
      const query: AlgorithmicCircuitQuery = JSON.parse(queryStr);
      
      // Basic validation
      if (!query.hashtags?.length && !query.minLikes) {
        this.logger.warn(`Circuit ${circuitId} has invalid query: ${queryStr}`);
        return;
      }

      // Build the query conditions
      const where: any = {
        createdAt: {
          // Look for posts in the last 24 hours
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      };

      // Add hashtag conditions if specified
      if (query.hashtags && query.hashtags.length > 0) {
        where.hashtags = {
          some: {
            hashtag: {
              name: { in: query.hashtags },
            },
          },
        };
      }

      // Get matching posts
      const posts = await this.prisma.post.findMany({
        where,
        take: 100, // Limit to 100 posts per run
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (posts.length === 0) {
        this.logger.debug(`No new posts match circuit ${circuitId} criteria`);
        return;
      }

      this.logger.debug(`Found ${posts.length} posts matching circuit ${circuitId} criteria`);

      // Add posts to circuit if not already present
      const operations = posts.map(post => 
        this.prisma.circuitPost.upsert({
          where: {
            circuitId_postId: {
              circuitId,
              postId: post.id,
            },
          },
          update: {}, // No update needed if already exists
          create: {
            circuitId,
            postId: post.id,
          },
        })
      );

      await this.prisma.$transaction(operations);
      this.logger.debug(`Added matching posts to circuit ${circuitId}`);
    } catch (error) {
      this.logger.error(`Error processing circuit ${circuitId}:`, error);
    }
  }
} 
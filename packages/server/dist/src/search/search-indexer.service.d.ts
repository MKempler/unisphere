import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
export declare class SearchIndexer implements OnModuleInit {
    private readonly prisma;
    private readonly configService;
    private readonly schedulerRegistry;
    private readonly logger;
    private readonly indexingInterval;
    private isRunning;
    constructor(prisma: PrismaService, configService: ConfigService, schedulerRegistry: SchedulerRegistry);
    onModuleInit(): void;
    indexUnindexedPosts(): Promise<void>;
    indexPost(postId: string): Promise<void>;
}

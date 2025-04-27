"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SearchIndexer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchIndexer = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
let SearchIndexer = SearchIndexer_1 = class SearchIndexer {
    constructor(prisma, configService, schedulerRegistry) {
        this.prisma = prisma;
        this.configService = configService;
        this.schedulerRegistry = schedulerRegistry;
        this.logger = new common_1.Logger(SearchIndexer_1.name);
        this.isRunning = false;
        this.indexingInterval = this.configService.get('SEARCH_CRON_MS', 30000);
    }
    onModuleInit() {
        this.logger.log(`Search indexer initialized with interval: ${this.indexingInterval}ms`);
        if (this.indexingInterval > 0) {
            const interval = setInterval(() => this.indexUnindexedPosts(), this.indexingInterval);
            this.schedulerRegistry.addInterval('search-indexer', interval);
        }
    }
    async indexUnindexedPosts() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        try {
            const unindexedPosts = await this.prisma.post.findMany({
                where: {
                    indexed: false,
                },
                take: 100,
            });
            if (unindexedPosts.length === 0) {
                return;
            }
            this.logger.debug(`Indexing ${unindexedPosts.length} posts`);
            const updatePromises = unindexedPosts.map(post => this.prisma.post.update({
                where: { id: post.id },
                data: { indexed: true },
            }));
            await Promise.all(updatePromises);
            this.logger.debug(`Indexed ${unindexedPosts.length} posts successfully`);
        }
        catch (error) {
            this.logger.error('Error indexing posts:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    async indexPost(postId) {
        try {
            await this.prisma.post.update({
                where: { id: postId },
                data: { indexed: true },
            });
        }
        catch (error) {
            this.logger.error(`Error indexing post ${postId}:`, error);
        }
    }
};
exports.SearchIndexer = SearchIndexer;
__decorate([
    (0, schedule_1.Cron)('*/30 * * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SearchIndexer.prototype, "indexUnindexedPosts", null);
exports.SearchIndexer = SearchIndexer = SearchIndexer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        schedule_1.SchedulerRegistry])
], SearchIndexer);
//# sourceMappingURL=search-indexer.service.js.map
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
var CircuitAlgoRunnerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitAlgoRunnerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
let CircuitAlgoRunnerService = CircuitAlgoRunnerService_1 = class CircuitAlgoRunnerService {
    constructor(prisma, configService, schedulerRegistry) {
        this.prisma = prisma;
        this.configService = configService;
        this.schedulerRegistry = schedulerRegistry;
        this.logger = new common_1.Logger(CircuitAlgoRunnerService_1.name);
        this.isRunning = false;
        this.cronInterval = this.configService.get('CIRCUIT_ALGO_CRON_MS', 300000);
    }
    onModuleInit() {
        this.logger.log(`Circuit algorithm runner initialized with interval: ${this.cronInterval}ms`);
        if (this.cronInterval > 0) {
            const interval = setInterval(() => this.processAlgorithmicCircuits(), this.cronInterval);
            this.schedulerRegistry.addInterval('circuit-algo-runner', interval);
        }
    }
    async processAlgorithmicCircuits() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        try {
            const algoCircuits = await this.prisma.circuit.findMany({
                where: {
                    isAlgo: true,
                },
            });
            if (algoCircuits.length === 0) {
                return;
            }
            this.logger.debug(`Processing ${algoCircuits.length} algorithmic circuits`);
            for (const circuit of algoCircuits) {
                await this.processCircuit(circuit.id, circuit.query);
            }
            this.logger.debug(`Completed algorithmic circuit processing`);
        }
        catch (error) {
            this.logger.error('Error processing algorithmic circuits:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    async processCircuit(circuitId, queryStr) {
        if (!queryStr) {
            this.logger.warn(`Circuit ${circuitId} has no query, skipping`);
            return;
        }
        try {
            const query = JSON.parse(queryStr);
            if (!query.hashtags?.length && !query.minLikes) {
                this.logger.warn(`Circuit ${circuitId} has invalid query: ${queryStr}`);
                return;
            }
            const where = {
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            };
            if (query.hashtags && query.hashtags.length > 0) {
                where.hashtags = {
                    some: {
                        hashtag: {
                            name: { in: query.hashtags },
                        },
                    },
                };
            }
            const posts = await this.prisma.post.findMany({
                where,
                take: 100,
                orderBy: {
                    createdAt: 'desc',
                },
            });
            if (posts.length === 0) {
                this.logger.debug(`No new posts match circuit ${circuitId} criteria`);
                return;
            }
            this.logger.debug(`Found ${posts.length} posts matching circuit ${circuitId} criteria`);
            const operations = posts.map(post => this.prisma.circuitPost.upsert({
                where: {
                    circuitId_postId: {
                        circuitId,
                        postId: post.id,
                    },
                },
                update: {},
                create: {
                    circuitId,
                    postId: post.id,
                },
            }));
            await this.prisma.$transaction(operations);
            this.logger.debug(`Added matching posts to circuit ${circuitId}`);
        }
        catch (error) {
            this.logger.error(`Error processing circuit ${circuitId}:`, error);
        }
    }
};
exports.CircuitAlgoRunnerService = CircuitAlgoRunnerService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CircuitAlgoRunnerService.prototype, "processAlgorithmicCircuits", null);
exports.CircuitAlgoRunnerService = CircuitAlgoRunnerService = CircuitAlgoRunnerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        schedule_1.SchedulerRegistry])
], CircuitAlgoRunnerService);
//# sourceMappingURL=circuit-algo-runner.service.js.map
import { SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class CircuitAlgoRunnerService {
    private readonly prisma;
    private readonly configService;
    private readonly schedulerRegistry;
    private readonly logger;
    private readonly cronInterval;
    private isRunning;
    constructor(prisma: PrismaService, configService: ConfigService, schedulerRegistry: SchedulerRegistry);
    onModuleInit(): void;
    processAlgorithmicCircuits(): Promise<void>;
    private processCircuit;
}

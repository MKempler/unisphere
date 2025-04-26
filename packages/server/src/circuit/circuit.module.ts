import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CircuitService } from './circuit.service';
import { CircuitController } from './circuit.controller';
import { CircuitAlgoRunnerService } from './circuit-algo-runner.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    PostModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [CircuitController],
  providers: [CircuitService, CircuitAlgoRunnerService],
  exports: [CircuitService],
})
export class CircuitModule {} 
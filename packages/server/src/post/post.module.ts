import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FederationModule } from '../federation/federation.module';

@Module({
  imports: [PrismaModule, FederationModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {} 
import { Module } from '@nestjs/common';
import { PeerService } from './peer.service';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [EventController],
  providers: [PeerService, EventService],
  exports: [EventService, PeerService],
})
export class FederationModule {} 
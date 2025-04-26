import { Body, Controller, Get, Post } from '@nestjs/common';
import { EventService } from './event.service';
import { UniEvent } from '@unisphere/shared';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('federation')
@Controller('federation')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('event')
  async receiveEvent(@Body() event: UniEvent): Promise<{ ok: boolean }> {
    await this.eventService.receive(event);
    return { ok: true };
  }

  @Get('health')
  getHealth(): { ok: boolean } {
    return { ok: true };
  }
} 
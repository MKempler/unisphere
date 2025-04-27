import { EventService } from './event.service';
import { UniEvent } from '@unisphere/shared';
export declare class EventController {
    private readonly eventService;
    constructor(eventService: EventService);
    receiveEvent(event: UniEvent): Promise<{
        ok: boolean;
    }>;
    getHealth(): {
        ok: boolean;
    };
}

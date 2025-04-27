import { PrismaService } from '../prisma/prisma.service';
import { PeerService } from './peer.service';
import { UniEvent } from '@unisphere/shared';
export declare class EventService {
    private readonly prisma;
    private readonly peerService;
    private readonly logger;
    private readonly federationTimeoutMs;
    constructor(prisma: PrismaService, peerService: PeerService);
    publish<T>(event: UniEvent<T>): Promise<void>;
    publishProfileMoved(userDid: string, newHome: string, privateKeyEnc: string): Promise<void>;
    receive<T>(event: UniEvent<T>): Promise<void>;
    private handlePostCreatedEvent;
    private handleProfileMovedEvent;
}

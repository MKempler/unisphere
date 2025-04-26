import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PeerService {
  private readonly logger = new Logger(PeerService.name);
  private readonly peers: string[] = [];

  constructor() {
    this.initPeers();
  }

  /**
   * Initialize peers from environment variable
   */
  private initPeers(): void {
    const peersEnv = process.env.PEERS;
    if (!peersEnv) {
      this.logger.log('No peers configured');
      return;
    }

    const peers = peersEnv.split(',').map(p => p.trim()).filter(Boolean);
    this.peers.push(...peers);
    this.logger.log(`Initialized with ${this.peers.length} peers`);
  }

  /**
   * Get all configured peers
   */
  getPeers(): string[] {
    return [...this.peers];
  }
} 
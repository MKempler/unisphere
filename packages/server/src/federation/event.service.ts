import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PeerService } from './peer.service';
import { UniEvent, verifyEvent, signEvent } from '@unisphere/shared';
import axios from 'axios';
import { PostDTO } from '@unisphere/shared';
import { v4 as uuidv4 } from 'uuid';

// Interface for PROFILE_MOVED event body
interface ProfileMovedData {
  newHome: string;
}

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private readonly federationTimeoutMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly peerService: PeerService,
  ) {
    this.federationTimeoutMs = parseInt(process.env.FEDERATION_TIMEOUT_MS || '5000', 10);
  }

  /**
   * Publish an event to all peers
   */
  async publish<T>(event: UniEvent<T>): Promise<void> {
    const peers = this.peerService.getPeers();
    if (peers.length === 0) {
      this.logger.log('No peers configured, skipping federation');
      return;
    }

    this.logger.log(`Publishing event ${event.id} to ${peers.length} peers`);
    
    const publishPromises = peers.map(async (peer) => {
      const url = `${peer}/federation/event`;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.federationTimeoutMs);

        await axios.post(url, event, {
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
        });

        clearTimeout(timeout);
        this.logger.log(`Successfully published to ${peer}`);
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
          this.logger.warn(`Publish to ${peer} timed out after ${this.federationTimeoutMs}ms`);
        } else {
          this.logger.error(`Failed to publish to ${peer}: ${error.message}`);
        }
      }
    });

    // We don't wait for all promises to complete - we allow them to fail silently
    await Promise.allSettled(publishPromises);
  }

  /**
   * Publish a PROFILE_MOVED event
   */
  async publishProfileMoved(userDid: string, newHome: string, privateKeyEnc: string): Promise<void> {
    const event = {
      id: uuidv4(),
      type: 'PROFILE_MOVED' as const,
      authorDid: userDid,
      createdAt: new Date().toISOString(),
      body: { newHome }
    };

    // Sign the event
    const signedEvent = signEvent(event, privateKeyEnc);
    
    // Publish to all peers
    await this.publish(signedEvent);
  }

  /**
   * Receive and process an event from a peer
   */
  async receive<T>(event: UniEvent<T>): Promise<void> {
    this.logger.log(`Received event ${event.id} of type ${event.type}`);

    // TODO: Verify signature using the author's public key
    // const isValid = verifyEvent(event, authorPublicKey);
    // if (!isValid) {
    //   this.logger.warn(`Invalid signature for event ${event.id}`);
    //   return;
    // }

    // Handle event based on type
    if (event.type === 'POST_CREATED') {
      await this.handlePostCreatedEvent(event as UniEvent<PostDTO>);
    } else if (event.type === 'PROFILE_MOVED') {
      await this.handleProfileMovedEvent(event as UniEvent<ProfileMovedData>);
    } else {
      this.logger.warn(`Unsupported event type: ${event.type}`);
    }
  }

  /**
   * Handle a POST_CREATED event
   */
  private async handlePostCreatedEvent(event: UniEvent<PostDTO>): Promise<void> {
    const { authorDid, body: post } = event;

    // Check if we already have this post
    const existingPost = await this.prisma.post.findUnique({
      where: { federationId: event.id },
    });

    if (existingPost) {
      this.logger.log(`Post ${event.id} already exists, skipping`);
      return;
    }

    // Find or create remote user
    let remoteUser = await this.prisma.remoteUser.findUnique({
      where: { did: authorDid },
    });

    if (!remoteUser) {
      this.logger.log(`Creating new remote user with DID ${authorDid}`);
      remoteUser = await this.prisma.remoteUser.create({
        data: {
          did: authorDid,
          handle: post.author.handle,
        },
      });
    }

    // Create post
    await this.prisma.post.create({
      data: {
        id: post.id, // Use the same ID as the source instance
        text: post.text,
        createdAt: new Date(post.createdAt),
        remoteAuthorId: remoteUser.id,
        federationId: event.id,
      },
    });

    this.logger.log(`Successfully created federated post ${post.id}`);
  }

  /**
   * Handle a PROFILE_MOVED event
   */
  private async handleProfileMovedEvent(event: UniEvent<ProfileMovedData>): Promise<void> {
    const { authorDid, body } = event;
    const { newHome } = body;

    this.logger.log(`Processing PROFILE_MOVED event for ${authorDid} to ${newHome}`);

    try {
      // Check for local user with this DID
      const localUser = await this.prisma.user.findFirst({
        where: { didPublicKey: authorDid }
      });

      if (localUser) {
        // Mark local user as deprecated
        await this.prisma.user.update({
          where: { id: localUser.id },
          data: { isDeprecated: true }
        });
        this.logger.log(`Marked local user ${localUser.handle} as deprecated`);

        // Get all followers
        const followers = await this.prisma.follow.findMany({
          where: { followeeId: localUser.id },
          include: { follower: true }
        });

        // Auto-follow the user at their new home for all followers
        for (const follow of followers) {
          this.logger.log(`User ${follow.follower.handle} was following ${localUser.handle}. Adding remote follow record.`);
          
          // Create or update remote user record
          let remoteUser = await this.prisma.remoteUser.findFirst({
            where: { did: authorDid }
          });

          if (!remoteUser) {
            remoteUser = await this.prisma.remoteUser.create({
              data: {
                did: authorDid,
                handle: localUser.handle,
                homeUrl: newHome
              }
            });
          } else {
            remoteUser = await this.prisma.remoteUser.update({
              where: { id: remoteUser.id },
              data: { homeUrl: newHome }
            });
          }
          
          // TODO: Create remote follow relationship
          // This requires extending the schema to track remote follows
        }
      } else {
        // Check for remote user
        const remoteUser = await this.prisma.remoteUser.findFirst({
          where: { did: authorDid }
        });

        if (remoteUser) {
          // Update home URL
          await this.prisma.remoteUser.update({
            where: { id: remoteUser.id },
            data: { homeUrl: newHome }
          });
          this.logger.log(`Updated remote user ${remoteUser.handle} with new home URL: ${newHome}`);
        } else {
          this.logger.warn(`No user found with DID ${authorDid}, cannot process PROFILE_MOVED event`);
        }
      }
    } catch (error) {
      this.logger.error(`Error processing PROFILE_MOVED event: ${error.message}`);
    }
  }
} 
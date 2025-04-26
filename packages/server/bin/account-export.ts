#!/usr/bin/env ts-node
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import * as readline from 'readline';
import { signEvent, UniEvent } from '@unisphere/shared';
import axios from 'axios';

// Load env variables
config();

const prisma = new PrismaClient();

interface ProfileMovedBody {
  newHome: string;
}

async function publishProfileMovedEvent(
  user: any, 
  newHome: string, 
  privateKeyEnc: string | null
): Promise<void> {
  if (!privateKeyEnc) {
    console.error('Cannot publish event: Private key is null');
    return;
  }

  try {
    // Use type assertion to ensure the type is accepted
    const event = {
      id: uuidv4(),
      type: 'PROFILE_MOVED' as const,
      authorDid: user.didPublicKey,
      createdAt: new Date().toISOString(),
      body: { newHome }
    } as const;

    // Sign the event
    const signedEvent = signEvent(event, privateKeyEnc);

    // Get peers from environment
    const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
    
    if (peers.length === 0) {
      console.warn('No peers configured for federation. Skipping event publication.');
      return;
    }

    // Publish to all peers
    console.log(`Publishing PROFILE_MOVED event to ${peers.length} peers...`);
    const publishPromises = peers.map(peer => 
      axios.post(`${peer}/federation/event`, signedEvent)
        .then(() => console.log(`Event published to ${peer}`))
        .catch(err => console.error(`Failed to publish to ${peer}:`, err.message))
    );

    await Promise.all(publishPromises);
    console.log('Event publication completed.');
  } catch (error) {
    console.error('Error publishing PROFILE_MOVED event:', error);
  }
}

export async function exportAccount(email: string): Promise<void> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        followers: {
          include: {
            follower: true
          }
        }
      }
    });

    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    // Prepare export data
    const exportData = {
      id: user.id,
      handle: user.handle,
      didPublicKey: user.didPublicKey,
      didPrivateKeyEnc: user.didPrivateKeyEnc,
      followers: user.followers.map(follow => ({
        followerHandle: follow.follower.handle,
        followerId: follow.follower.id,
        createdAt: follow.createdAt.toISOString()
      }))
    };

    // Write to file
    const filename = `${user.handle}.json`;
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    
    console.log(`Account exported to ${filename}`);
    
    // Ask for new server URL to publish PROFILE_MOVED event
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter the base URL of the new server (leave empty to skip): ', async (newHomeInput: string) => {
      rl.close();
      
      if (!newHomeInput || newHomeInput.trim() === '') {
        console.log('Skipping PROFILE_MOVED event publication.');
        await prisma.$disconnect();
        return;
      }

      await publishProfileMovedEvent(user, newHomeInput.trim(), user.didPrivateKeyEnc);
      await prisma.$disconnect();
    });
    
  } catch (error) {
    console.error('Error exporting account:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Only run as script if called directly
if (require.main === module) {
  (async () => {
    const email = process.argv[2];
    
    if (!email) {
      console.error('Usage: pnpm ts-node bin/account-export <email>');
      process.exit(1);
    }
    
    await exportAccount(email);
  })();
} 
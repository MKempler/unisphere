#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function generateInviteCode() {
  // Generate a random string of 8 characters
  const code = crypto.randomBytes(4).toString('hex');
  
  try {
    const invite = await prisma.invite.create({
      data: {
        code,
      },
    });
    
    console.log(`✅ Successfully created invite code: ${invite.code}`);
    return invite;
  } catch (error) {
    console.error('Failed to create invite code:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await generateInviteCode();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main(); 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo users...');

  // Clean up existing data
  await prisma.follow.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.invite.deleteMany({});
  await prisma.user.deleteMany({});

  // Create Alice user
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      handle: 'alice',
      didPublicKey: 'demo-public-key-alice',
      didPrivateKeyEnc: 'demo-encrypted-private-key-alice',
    },
  });

  // Create Bob user
  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      handle: 'bob',
      didPublicKey: 'demo-public-key-bob',
      didPrivateKeyEnc: 'demo-encrypted-private-key-bob',
    },
  });

  // Create posts for Alice and Bob
  await prisma.post.create({
    data: {
      text: 'Hello from Alice! This is my first post on UniSphere.',
      authorId: alice.id,
    },
  });

  await prisma.post.create({
    data: {
      text: 'Bob here. Excited to join the decentralized social network revolution!',
      authorId: bob.id,
    },
  });

  // Make them follow each other
  await prisma.follow.create({
    data: {
      followerId: alice.id,
      followeeId: bob.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: bob.id,
      followeeId: alice.id,
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
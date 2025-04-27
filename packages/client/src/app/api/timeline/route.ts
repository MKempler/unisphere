import { NextResponse } from 'next/server';

export async function GET() {
  // Generate some mock posts for the timeline
  const mockPosts = Array(5).fill(null).map((_, index) => ({
    id: `post-${index}`,
    text: `This is sample post #${index + 1} with some interesting content about decentralized social media.`,
    createdAt: new Date(Date.now() - index * 3600000).toISOString(),
    author: {
      id: `user${index % 3 + 1}`,
      handle: `user${index % 3 + 1}`,
      displayName: `User ${index % 3 + 1}`,
      avatarUrl: `/placeholders/avatar-${(index % 3) + 1}.png`
    },
    hashtags: index % 2 === 0 ? ['decentralized', 'kavira'] : ['tech', 'web3'],
    likeCount: Math.floor(Math.random() * 100),
    likedByMe: Math.random() > 0.5
  }));

  return NextResponse.json(mockPosts);
} 
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    // Create a mock post
    const mockPost = {
      id: `post-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
      author: {
        id: 'user-123',
        handle: 'testuser',
        displayName: 'Test User',
        avatarUrl: '/placeholders/avatar-1.png'
      },
      hashtags: extractHashtags(text),
      likeCount: 0,
      likedByMe: false
    };

    return NextResponse.json(mockPost);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// Helper function to extract hashtags from post text
function extractHashtags(text: string): string[] {
  const hashtags = text.match(/#[\w\u0590-\u05ff]+/g) || [];
  return hashtags.map(tag => tag.substring(1));
} 
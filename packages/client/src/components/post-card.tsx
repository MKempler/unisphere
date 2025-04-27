'use client'

import Link from 'next/link'

// Simplified for testing
interface PostDTO {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    handle: string;
  };
  hashtags?: string[];
  mediaUrl?: string;
}

interface PostCardProps {
  post: PostDTO;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-background dark:bg-n-900 border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <Link href={`/profile/${post.author.handle}`} className="font-medium text-primary hover:underline">
          @{post.author.handle}
        </Link>
        <span className="mx-2 text-muted-foreground">•</span>
        <time className="text-sm text-muted-foreground" dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleDateString()}
        </time>
      </div>
      
      <p className="text-foreground mb-4 whitespace-pre-wrap">{post.text}</p>
      
      {post.mediaUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img src={post.mediaUrl} alt="Post media" className="w-full h-auto" />
        </div>
      )}
      
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.hashtags.map((tag) => (
            <Link key={tag} href={`/search?q=%23${tag}`} className="text-primary text-sm hover:underline">
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 
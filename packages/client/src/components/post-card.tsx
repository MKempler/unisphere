'use client'

import { PostDTO } from '@unisphere/shared'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export interface PostCardProps {
  post: PostDTO
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="border border-gray-200 p-4 rounded-lg mb-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center mb-2">
        <Link 
          href={`/@${post.author.handle}`}
          className="font-medium text-blue-600 hover:underline"
        >
          @{post.author.handle}
        </Link>
        <span className="text-gray-500 text-sm ml-2">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-gray-800 whitespace-pre-wrap">{post.text}</p>
    </div>
  )
} 
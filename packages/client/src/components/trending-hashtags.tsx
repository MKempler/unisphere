'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Hashtag {
  name: string
  count: number
}

export function TrendingHashtags() {
  const { data: hashtags, isLoading, isError } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const response = await api.get('/search/trending')
      return response.data
    }
  })
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-200 rounded w-4/5"></div>
        ))}
      </div>
    )
  }
  
  if (isError) {
    return (
      <p className="text-muted-foreground text-sm">Unable to load trending topics</p>
    )
  }
  
  if (!hashtags || hashtags.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No trending topics yet</p>
    )
  }
  
  return (
    <ul className="space-y-3">
      {hashtags.map((tag: Hashtag) => (
        <li key={tag.name}>
          <Link 
            href={`/discover?q=%23${tag.name}`} 
            className="flex items-center justify-between hover:bg-muted px-2 py-1 rounded-md transition-colors"
          >
            <span className="font-medium">#{tag.name}</span>
            <span className="text-sm text-muted-foreground">{tag.count}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
} 
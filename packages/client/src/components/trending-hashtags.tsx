'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { fetcher } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface TrendingTag {
  name: string
  count: number
}

export function TrendingHashtags() {
  const [tags, setTags] = useState<TrendingTag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const fetchTrendingTags = async () => {
      if (!token) return

      try {
        setIsLoading(true)
        const data = await fetcher<TrendingTag[]>('/api/search/trending?limit=10', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setTags(data)
      } catch (error) {
        console.error('Error fetching trending tags:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingTags()

    // Refresh trending tags every minute
    const intervalId = setInterval(fetchTrendingTags, 60000)
    return () => clearInterval(intervalId)
  }, [token])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Hashtags</CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-5 bg-gray-200 rounded mb-2"></div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (tags.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No trending topics yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Hashtags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tags.map((tag) => (
          <div key={tag.name} className="flex justify-between items-center">
            <Link 
              href={`/search?q=%23${tag.name}`}
              className="text-blue-600 hover:underline flex-1"
            >
              #{tag.name}
            </Link>
            <span className="text-gray-500 text-sm">{tag.count}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 
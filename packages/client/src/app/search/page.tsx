'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { fetcher } from '@/lib/utils'
import { PostDTO } from '@unisphere/shared'
import { PostCard } from '@/components/post-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(searchQuery, 300)
  const [isSearching, setIsSearching] = useState(false)
  const [posts, setPosts] = useState<PostDTO[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const { token } = useAuth()
  const router = useRouter()

  const search = useCallback(async (query: string, newSearch = false, nextCursor?: string) => {
    if (!token || !query.trim()) {
      if (newSearch) {
        setPosts([])
        setCursor(null)
        setHasMore(false)
      }
      return
    }
    
    setIsSearching(true)
    
    try {
      const searchUrl = `/api/search?q=${encodeURIComponent(query)}${nextCursor ? `&cursor=${nextCursor}` : ''}&limit=10`
      const response = await fetcher<{posts: PostDTO[], nextCursor: string | null}>(searchUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (newSearch) {
        setPosts(response.posts)
      } else {
        setPosts(prev => [...prev, ...response.posts])
      }
      
      setCursor(response.nextCursor)
      setHasMore(!!response.nextCursor)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setIsSearching(false)
    }
  }, [token])

  // Search when query changes
  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery, true)
      
      // Update URL to reflect search
      const params = new URLSearchParams()
      params.set('q', debouncedQuery)
      router.push(`/search?${params.toString()}`, { scroll: false })
    } else {
      setPosts([])
      setCursor(null)
      setHasMore(false)
      router.push('/search', { scroll: false })
    }
  }, [debouncedQuery, router, search])

  const handleLoadMore = () => {
    if (!isSearching && hasMore && cursor) {
      search(debouncedQuery, false, cursor)
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      search(searchQuery, true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-white pt-4 pb-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="search"
            placeholder="Search posts or #hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </div>
      
      {debouncedQuery && (
        <h1 className="text-xl font-semibold">
          Results for: <span className="text-blue-600">{debouncedQuery}</span>
        </h1>
      )}
      
      {isSearching && posts.length === 0 ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {hasMore && (
            <div className="py-4 text-center">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                disabled={isSearching}
              >
                {isSearching ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      ) : debouncedQuery ? (
        <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
          <p>No results found for "{debouncedQuery}".</p>
          <p className="text-sm mt-2">Try different keywords or check your spelling.</p>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
          <p>Enter a search term to find posts.</p>
          <p className="text-sm mt-2">Try searching for keywords or #hashtags.</p>
        </div>
      )}
    </div>
  )
} 
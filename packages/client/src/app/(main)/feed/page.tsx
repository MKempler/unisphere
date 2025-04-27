'use client'

import { useRef, useCallback } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { PostCard } from '@/components/post-card'
import { ComposeBox } from '@/components/compose-box'

export default function FeedPage() {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const queryClient = useQueryClient()

  // Fetch timeline posts with infinite scrolling
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['timeline'],
    queryFn: async ({ pageParam }) => {
      const response = await api.get('/timeline', {
        params: { cursor: pageParam ?? undefined, limit: 10 }
      })
      return response.data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null
  })

  // Handle post creation
  const createPostMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await api.post('/posts', { text })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
      toast.success('Post created successfully!')
    },
    onError: () => {
      toast.error('Failed to create post. Please try again.')
    }
  })

  const handlePostCreated = (text: string) => {
    createPostMutation.mutate(text)
  }

  // Set up intersection observer for infinite scroll
  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingNextPage) return

    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage()
      }
    })

    if (node) observerRef.current.observe(node)
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage])

  // Flatten all posts from all pages
  const posts = data?.pages.flatMap(page => page.posts) || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Home</h1>
      
      <ComposeBox onPostCreated={handlePostCreated} />
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Timeline</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 p-4 rounded-lg animate-pulse">
                <div className="flex items-center mb-2">
                  <div className="h-4 w-32 bg-gray-300 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded ml-2"></div>
                </div>
                <div className="h-16 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            <p>Error loading posts. Please try again later.</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No posts to show yet.</p>
            <p className="text-sm mt-1">Follow people or create a post to see your timeline!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                ref={index === posts.length - 1 ? lastPostRef : undefined}
              >
                <PostCard post={post} />
              </div>
            ))}
            
            {isFetchingNextPage && (
              <div className="py-4 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 
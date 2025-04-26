'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { fetcher } from '@/lib/utils'
import { PostDTO } from '@unisphere/shared'
import { PostCard } from '@/components/post-card'
import { ComposeBox } from '@/components/compose-box'

export default function HomePage() {
  const [posts, setPosts] = useState<PostDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signup')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (token) {
      loadPosts()
    }
  }, [token])

  const loadPosts = async () => {
    setIsLoading(true)
    try {
      const fetchedPosts = await fetcher<PostDTO[]>('/api/timeline', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setPosts(fetchedPosts)
    } catch (error) {
      console.error('Error loading timeline:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostCreated = (newPost: PostDTO) => {
    setPosts(prevPosts => [newPost, ...prevPosts])
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

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
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No posts to show yet.</p>
            <p className="text-sm mt-1">Follow people or create a post to see your timeline!</p>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/post-card'
import { Loader2 } from 'lucide-react'

interface Post {
  id: string
  text: string
  author: {
    id: string
    handle: string
    displayName: string
    avatarUrl: string
  }
  createdAt: string
  likeCount: number
  likedByMe: boolean
  // other post properties
}

interface Circuit {
  id: string
  name: string
  description: string
  followersCount: number
  postsCount: number
  isFollowing: boolean
  owner: {
    id: string
    handle: string
    displayName: string
  }
}

export default function CircuitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [circuit, setCircuit] = useState<Circuit | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    if (token && id) {
      loadCircuitData()
    }
  }, [token, id])

  const loadCircuitData = async () => {
    setIsLoading(true)
    try {
      // In a real app, these would be actual API calls
      // For now, using mock data
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock circuit data
      const mockCircuit: Circuit = {
        id: id as string,
        name: id === '1' ? 'Tech News' : 'Crypto',
        description: id === '1' 
          ? 'The latest news and discussions about technology, gadgets, and the future of tech.'
          : 'Everything cryptocurrency, blockchain, and Web3 related.',
        followersCount: id === '1' ? 128 : 87,
        postsCount: id === '1' ? 42 : 31,
        isFollowing: id === '1',
        owner: {
          id: 'user1',
          handle: 'techguru',
          displayName: 'Tech Guru'
        }
      }
      
      setCircuit(mockCircuit)
      setIsFollowing(mockCircuit.isFollowing)
      
      // Mock posts for this circuit
      const mockPosts: Post[] = Array(5).fill(null).map((_, index) => ({
        id: `post-${id}-${index}`,
        text: `This is a sample post #${index + 1} in the ${mockCircuit.name} circuit about ${id === '1' ? 'technology' : 'cryptocurrency'}.`,
        author: {
          id: `user${index + 1}`,
          handle: `user${index + 1}`,
          displayName: `User ${index + 1}`,
          avatarUrl: `/placeholders/avatar-${(index % 5) + 1}.png`
        },
        createdAt: new Date(Date.now() - index * 3600000).toISOString(),
        likeCount: Math.floor(Math.random() * 100),
        likedByMe: Math.random() > 0.5
      }))
      
      setPosts(mockPosts)
    } catch (error) {
      console.error('Error loading circuit data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    if (!token || !circuit) return
    
    try {
      const endpoint = isFollowing
        ? `/api/circuits/${id}/unfollow`
        : `/api/circuits/${id}/follow`
        
      // In a real app, this would be an actual API call
      // For now, just simulating it
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setIsFollowing(!isFollowing)
      setCircuit(prev => {
        if (!prev) return prev
        return {
          ...prev,
          isFollowing: !isFollowing,
          followersCount: isFollowing 
            ? prev.followersCount - 1 
            : prev.followersCount + 1
        }
      })
    } catch (error) {
      console.error('Error toggling follow status:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  if (!circuit) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-semibold">Circuit not found</h1>
        <p className="text-muted-foreground mt-2">The circuit you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{circuit.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              by @{circuit.owner.handle}
            </p>
          </div>
          
          <Button
            variant={isFollowing ? "outline" : "default"}
            onClick={handleFollowToggle}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        </div>
        
        <p className="mt-4">{circuit.description}</p>
        
        <div className="flex gap-4 mt-4 text-sm">
          <span>{circuit.followersCount} followers</span>
          <span>{circuit.postsCount} posts</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Posts</h2>
        
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-border rounded-lg">
            <p className="text-muted-foreground">No posts in this circuit yet.</p>
          </div>
        )}
      </div>
    </div>
  )
} 
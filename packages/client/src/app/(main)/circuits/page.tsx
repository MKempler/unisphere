'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { fetcher } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Circuit {
  id: string
  name: string
  description: string
  followersCount: number
  postsCount: number
  isFollowing: boolean
  ownerHandle?: string
}

export default function CircuitsPage() {
  const [circuits, setCircuits] = useState<Circuit[]>([])
  const [myCircuits, setMyCircuits] = useState<Circuit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    if (token) {
      loadCircuits()
    }
  }, [token])

  const loadCircuits = async () => {
    setIsLoading(true)
    try {
      // Load popular circuits
      const popularCircuits = await fetcher<Circuit[]>('/api/circuits/popular', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCircuits(popularCircuits)
      
      // Load user's circuits
      const userCircuits = await fetcher<Circuit[]>('/api/circuits/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMyCircuits(userCircuits)
    } catch (error) {
      console.error('Error loading circuits:', error)
      
      // Use placeholder data for development
      setCircuits([
        { 
          id: '1', 
          name: 'Tech News', 
          description: 'Latest in technology',
          followersCount: 128,
          postsCount: 42, 
          isFollowing: true
        },
        { 
          id: '2', 
          name: 'Crypto', 
          description: 'Cryptocurrency discussions',
          followersCount: 87,
          postsCount: 31, 
          isFollowing: false
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowToggle = async (circuitId: string, isCurrentlyFollowing: boolean) => {
    if (!token) return
    
    try {
      const endpoint = isCurrentlyFollowing
        ? `/api/circuits/${circuitId}/unfollow`
        : `/api/circuits/${circuitId}/follow`
        
      await fetcher(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Update circuits list with new follow status
      setCircuits(prevCircuits => 
        prevCircuits.map(circuit => 
          circuit.id === circuitId 
            ? { 
                ...circuit, 
                isFollowing: !isCurrentlyFollowing,
                followersCount: isCurrentlyFollowing 
                  ? circuit.followersCount - 1 
                  : circuit.followersCount + 1
              }
            : circuit
        )
      )
    } catch (error) {
      console.error('Error toggling follow status:', error)
    }
  }

  const renderCircuitCard = (circuit: Circuit, isCreator = false) => (
    <div 
      key={circuit.id} 
      className="p-4 border border-border rounded-lg bg-card shadow-sm"
    >
      <div className="flex justify-between">
        <div>
          <Link 
            href={`/circuits/${circuit.id}`} 
            className="text-lg font-medium hover:text-primary"
          >
            {circuit.name}
          </Link>
          {circuit.ownerHandle && (
            <p className="text-sm text-muted-foreground">
              by @{circuit.ownerHandle}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {circuit.description}
          </p>
        </div>
        
        {!isCreator && (
          <Button
            variant={circuit.isFollowing ? "outline" : "default"}
            size="sm"
            onClick={() => handleFollowToggle(circuit.id, circuit.isFollowing)}
          >
            {circuit.isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </div>
      
      <div className="flex gap-4 mt-3 text-sm">
        <span>{circuit.followersCount} followers</span>
        <span>{circuit.postsCount} posts</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Circuits</h1>
        <Link href="/circuits/create">
          <Button size="sm">
            <Plus size={16} className="mr-1" /> Create
          </Button>
        </Link>
      </div>
      
      {myCircuits.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">My Circuits</h2>
          <div className="grid grid-cols-1 gap-4">
            {myCircuits.map(circuit => renderCircuitCard(circuit, true))}
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-3">Popular Circuits</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                <div className="h-6 w-1/3 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : circuits.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {circuits.map(circuit => renderCircuitCard(circuit))}
          </div>
        ) : (
          <div className="text-center py-8 border border-gray-200 rounded-lg">
            <p className="text-muted-foreground">No circuits found.</p>
          </div>
        )}
      </div>
    </div>
  )
} 
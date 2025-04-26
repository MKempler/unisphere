'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { useAuth } from '@/context/auth-context'
import { fetcher } from '@/lib/utils'

interface FollowButtonProps {
  handle: string
  isFollowing: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

export function FollowButton({ handle, isFollowing, onFollowChange }: FollowButtonProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const { token, user } = useAuth()

  // Don't show button if it's the current user's profile
  if (user?.handle === handle) {
    return null
  }

  const handleFollow = async () => {
    if (!token) return
    
    setIsLoading(true)
    
    try {
      const result = await fetcher<{ success: boolean }>(`/api/follow/${handle}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (result.success) {
        setFollowing(true)
        if (onFollowChange) {
          onFollowChange(true)
        }
      }
    } catch (error) {
      console.error('Error following user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={following ? 'outline' : 'default'}
      size="sm"
      onClick={handleFollow}
      disabled={isLoading || following}
    >
      {following ? 'Following' : isLoading ? 'Following...' : 'Follow'}
    </Button>
  )
} 
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  handle: string
  displayName: string
  avatarUrl?: string
  isFollowing: boolean
}

export function WhoToFollow() {
  const queryClient = useQueryClient()
  
  const { data: suggestedUsers, isLoading, isError } = useQuery({
    queryKey: ['suggested-users'],
    queryFn: async () => {
      const response = await api.get('/users/suggested')
      return response.data
    }
  })
  
  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post(`/users/${userId}/follow`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggested-users'] })
      toast.success('User followed successfully!')
    },
    onError: () => {
      toast.error('Failed to follow user. Please try again.')
    }
  })
  
  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/users/${userId}/follow`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggested-users'] })
      toast.success('User unfollowed successfully!')
    },
    onError: () => {
      toast.error('Failed to unfollow user. Please try again.')
    }
  })
  
  const handleFollowToggle = (user: User) => {
    if (user.isFollowing) {
      unfollowMutation.mutate(user.id)
    } else {
      followMutation.mutate(user.id)
    }
  }
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }
  
  if (isError) {
    return (
      <p className="text-muted-foreground text-sm">Unable to load suggestions</p>
    )
  }
  
  if (!suggestedUsers || suggestedUsers.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No suggestions available</p>
    )
  }
  
  return (
    <div className="space-y-4">
      {suggestedUsers.map((user: User) => (
        <div key={user.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full overflow-hidden">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.displayName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{user.displayName}</p>
              <p className="text-sm text-muted-foreground">@{user.handle}</p>
            </div>
          </div>
          <Button 
            variant={user.isFollowing ? "outline" : "default"} 
            size="sm"
            onClick={() => handleFollowToggle(user)}
            disabled={followMutation.isPending || unfollowMutation.isPending}
          >
            {user.isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        </div>
      ))}
    </div>
  )
} 
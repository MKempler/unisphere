'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { fetcher } from '@/lib/utils'
import { PostDTO, ProfileDTO } from '@unisphere/shared'
import { PostCard } from '@/components/post-card'
import { FollowButton } from '@/components/follow-button'

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>()
  const [profile, setProfile] = useState<ProfileDTO | null>(null)
  const [posts, setPosts] = useState<PostDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()
  
  const cleanHandle = handle ? handle.replace('@', '') : ''

  useEffect(() => {
    if (cleanHandle && token) {
      loadProfile()
    }
  }, [cleanHandle, token])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      // Load profile data
      const profileData = await fetcher<ProfileDTO>(`/api/profile/${cleanHandle}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      setProfile(profileData)
      
      // Load user's posts
      const userPosts = await fetcher<PostDTO[]>(`/api/user/${cleanHandle}/posts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      setPosts(userPosts)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowChange = (isFollowing: boolean) => {
    if (profile) {
      setProfile({
        ...profile,
        isFollowing,
        followersCount: profile.followersCount + 1,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-8 w-2/3 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
        <p className="text-gray-600">
          The user @{cleanHandle} doesn't exist or has been removed.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-1">@{profile.handle}</h1>
            <p className="text-gray-500 text-sm">
              Joined {new Date(profile.createdAt).toLocaleDateString()}
            </p>
            
            <div className="flex space-x-4 mt-2">
              <div>
                <span className="font-semibold">{profile.followersCount}</span>{' '}
                <span className="text-gray-600">followers</span>
              </div>
              <div>
                <span className="font-semibold">{profile.followingCount}</span>{' '}
                <span className="text-gray-600">following</span>
              </div>
            </div>
          </div>
          
          <FollowButton
            handle={profile.handle}
            isFollowing={profile.isFollowing || false}
            onFollowChange={handleFollowChange}
          />
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
            <p>No posts yet.</p>
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
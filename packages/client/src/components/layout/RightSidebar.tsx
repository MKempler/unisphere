'use client'

import React from 'react'
import { TrendingHashtags } from '@/components/trending-hashtags'
import { WhoToFollow } from '@/components/who-to-follow'
import { useAuth } from '@/context/AuthContext'

export function RightSidebar() {
  const { user } = useAuth()
  
  return (
    <div className="space-y-6">
      {/* Trending section */}
      <div className="bg-card rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Trending</h3>
        <TrendingHashtags />
      </div>
      
      {/* Who to follow */}
      <div className="bg-card rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Who to follow</h3>
        <WhoToFollow />
      </div>
      
      {/* About Kavira */}
      <div className="bg-card rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-2">About Kavira</h3>
        <p className="text-sm text-muted-foreground mb-3">
          One world. Many voices. Join the conversation.
        </p>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <a href="#" className="hover:underline">Privacy</a>
          <span>·</span>
          <a href="#" className="hover:underline">Terms</a>
          <span>·</span>
          <a href="#" className="hover:underline">About</a>
        </div>
      </div>
    </div>
  )
} 
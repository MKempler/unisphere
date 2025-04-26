'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/home')
      } else {
        router.push('/signup')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
        <div className="h-4 w-48 bg-gray-300 rounded"></div>
      </div>
    </div>
  )
} 
'use client'

import { useAuth } from '@/context/auth-context'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signup')
    }
  }, [user, isLoading, router])
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return null // Will redirect in the useEffect
  }
  
  return <ResponsiveLayout>{children}</ResponsiveLayout>
} 
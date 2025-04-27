'use client'

import { useAuth } from '@/context/auth-context'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/feed')
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
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/10 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="mb-2 h-12 w-12 overflow-hidden rounded-lg">
              <Image
                src="/logo.png"
                alt="Kavira Logo"
                width={48}
                height={48}
                priority
              />
            </div>
            <h1 className="text-2xl font-bold">Kavira</h1>
            <p className="text-sm text-muted-foreground">One world. Many voices.</p>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
} 
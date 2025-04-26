'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetcher } from '@/lib/utils'
import { AuthResponseDTO } from '@unisphere/shared'

type FormData = {
  email: string
}

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [token, setToken] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const onSubmitEmail = async (data: FormData) => {
    setIsSubmitting(true)
    
    try {
      await fetcher('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email: data.email }),
      })
      
      setSentEmail(data.email)
    } catch (error) {
      console.error('Error sending signup email:', error)
      alert('Error signing up. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitToken = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetcher<AuthResponseDTO>('/api/auth/callback', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })
      
      login(response.token, response.user)
      router.push('/home')
    } catch (error) {
      console.error('Error verifying token:', error)
      alert('Invalid or expired token. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Join UniSphere</h2>
      
      {!sentEmail ? (
        <form onSubmit={handleSubmit(onSubmitEmail)}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.type === 'required' ? 'Email is required' : 'Invalid email format'}
              </p>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Get Magic Link'}
          </Button>
          
          <p className="mt-4 text-sm text-gray-600 text-center">
            We'll send you a magic link to sign in or create an account.
          </p>
        </form>
      ) : (
        <div>
          <div className="mb-6">
            <div className="p-4 bg-green-100 text-green-800 rounded-md">
              <p>Magic link sent to <strong>{sentEmail}</strong></p>
              <p className="text-sm mt-1">
                Check your email and enter the token below.
              </p>
            </div>
          </div>
          
          <form onSubmit={onSubmitToken}>
            <div className="mb-4">
              <label htmlFor="token" className="block text-sm font-medium mb-1">
                Enter Magic Link Token
              </label>
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Your token"
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
              {isSubmitting ? 'Verifying...' : 'Sign In'}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
} 
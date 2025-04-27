'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

interface ComposeBoxProps {
  onPostCreated?: (text: string) => void
}

export function ComposeBox({ onPostCreated }: ComposeBoxProps) {
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { token } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text.trim() || isSubmitting || !token) return
    
    setIsSubmitting(true)
    
    try {
      if (onPostCreated) {
        onPostCreated(text)
      }
      setText('')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 border border-gray-200 p-4 rounded-lg">
      <textarea
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="What's on your mind?"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={280}
        disabled={isSubmitting}
      />
      <div className="flex justify-between items-center mt-2">
        <div className="text-sm text-gray-500">
          {text.length}/280
        </div>
        <Button
          type="submit"
          disabled={!text.trim() || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  )
} 
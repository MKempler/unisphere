'use client'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="mb-6">The page you are looking for doesn't exist.</p>
      <a href="/" className="text-blue-500 hover:underline">
        Return to Home
      </a>
    </div>
  )
} 
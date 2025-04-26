'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
              <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-blue-600">UniSphere</h1>
              </div>
            </header>
            <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 
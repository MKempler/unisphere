'use client'

import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/theme-context'
import { Navbar } from '@/components/layout/Navbar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }))

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Kavira</title>
        <meta name="description" content="One world. Many voices." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Kavira" />
        <meta property="og:description" content="One world. Many voices." />
        <meta property="og:site_name" content="Kavira" />
        <meta property="og:image" content="/brand/kavira-og.png" />
        <link rel="icon" href="/brand/kavira-logomark.svg" />
        <link rel="apple-touch-icon" href="/brand/kavira-180.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground pb-16 md:pb-0">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 px-4 py-6 md:px-6 md:py-8 lg:py-10">
                  {children}
                </main>
                <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
                  <div className="container">
                    <p>© {new Date().getFullYear()} Kavira. One world. Many voices.</p>
                  </div>
                </footer>
              </div>
              <Toaster position="top-right" />
            </AuthProvider>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  )
} 
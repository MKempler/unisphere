'use client'

import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { ThemeProvider } from '@/context/theme-context'
import { Navbar } from '@/components/layout/Navbar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Kavira</title>
        <meta name="description" content="One world. Many voices." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Kavira" />
        <meta property="og:description" content="One world. Many voices." />
        <meta property="og:site_name" content="Kavira" />
        <meta property="og:image" content="/favicon.svg" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 
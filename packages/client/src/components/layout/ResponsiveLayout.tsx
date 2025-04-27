'use client'

import React from 'react'
import { Sidebar } from './Sidebar'
import { RightSidebar } from './RightSidebar'

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
      {/* Left sidebar - navigation */}
      <div className="hidden md:block w-[200px] flex-shrink-0 border-r border-border">
        <div className="sticky top-0 p-4">
          <Sidebar />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 w-full md:max-w-[680px] min-h-screen border-x border-border">
        <div className="p-4">
          {children}
        </div>
      </div>
      
      {/* Right sidebar */}
      <div className="hidden md:block w-[280px] flex-shrink-0 border-l border-border">
        <div className="sticky top-0 p-4">
          <RightSidebar />
        </div>
      </div>
    </div>
  )
} 
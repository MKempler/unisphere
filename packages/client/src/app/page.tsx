'use client'

import { useEffect, useState } from 'react'

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Welcome to Kavira</h1>
      
      <div className="bg-white dark:bg-n-900 rounded-lg border border-border p-6 mb-4">
        <p className="text-foreground mb-4">
          This is a demo of the Kavira UI with the new branding applied. The updated features include:
        </p>
        
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>New brand colors and typography</li>
          <li>Dark mode support with theme toggle</li>
          <li>Mobile-friendly navigation with bottom tab bar</li>
          <li>Responsive design for all screen sizes</li>
          <li>SVG logo with consistent branding</li>
        </ul>
        
        <p className="text-accent font-medium">
          One world. Many voices.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-n-900 rounded-lg border border-border p-4">
          <h2 className="font-semibold mb-2">Primary Color</h2>
          <div className="h-20 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
            #3B82F6
          </div>
        </div>
        
        <div className="bg-white dark:bg-n-900 rounded-lg border border-border p-4">
          <h2 className="font-semibold mb-2">Accent Color</h2>
          <div className="h-20 bg-accent rounded-md flex items-center justify-center text-accent-foreground">
            #10B981
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

export default function ComposePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>
      
      <div className="bg-background dark:bg-n-900 rounded-lg border border-border p-4">
        <textarea 
          placeholder="What's on your mind?"
          className="w-full min-h-[150px] p-3 bg-background dark:bg-n-900 rounded-md border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
        />
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <button className="p-2 rounded-md hover:bg-muted dark:hover:bg-n-900/50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </button>
            <button className="p-2 rounded-md hover:bg-muted dark:hover:bg-n-900/50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </button>
          </div>
          
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
            Post
          </button>
        </div>
      </div>
    </div>
  )
} 
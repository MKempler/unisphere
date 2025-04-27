'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Search, 
  Radio, 
  User, 
  PenSquare
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }
  
  const links = [
    { icon: Home, label: 'Feed', href: '/feed' },
    { icon: Search, label: 'Discover', href: '/discover' },
    { icon: Radio, label: 'Circuits', href: '/circuits' },
    { icon: User, label: 'Profile', href: '/profile' }
  ]

  return (
    <nav className="flex flex-col gap-6 pt-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
            isActive(link.href) 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'text-foreground hover:bg-muted'
          }`}
        >
          <link.icon size={20} />
          <span>{link.label}</span>
        </Link>
      ))}
      
      <Link
        href="/compose"
        className="flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90"
      >
        <PenSquare size={18} />
        <span>Compose</span>
      </Link>
    </nav>
  )
} 
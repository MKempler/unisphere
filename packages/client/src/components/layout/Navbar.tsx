'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Home, Compass, CircleDot, User, Plus } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Desktop Navigation (md and up) */}
      <header className="sticky top-0 z-10 w-full border-b border-border bg-background dark:bg-n-900 hidden md:block">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/brand/kavira-logomark.svg" alt="Kavira" width={28} height={28} className="text-primary" />
              <span className="hidden sm:block font-semibold text-lg tracking-tight">Kavira</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  href={`/@${user.handle}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  @{user.handle}
                </Link>
                <button 
                  onClick={logout}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/signup"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Login / Register
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation (bottom bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background dark:bg-n-900">
        <div className="flex justify-around py-2">
          <Link 
            href="/" 
            className={`flex flex-col items-center px-3 py-2 ${
              isActive('/') ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link 
            href="/discover" 
            className={`flex flex-col items-center px-3 py-2 ${
              isActive('/discover') ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
          >
            <Compass size={24} />
            <span className="text-xs mt-1">Discover</span>
          </Link>
          <Link 
            href="/circuits" 
            className={`flex flex-col items-center px-3 py-2 ${
              isActive('/circuits') ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
          >
            <CircleDot size={24} />
            <span className="text-xs mt-1">Circuits</span>
          </Link>
          <Link 
            href={user ? `/@${user.handle}` : '/signup'} 
            className={`flex flex-col items-center px-3 py-2 ${
              pathname.startsWith('/@') ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
          >
            <User size={24} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
      
      {/* Floating Action Button for compose */}
      <Link 
        href="/compose" 
        className="md:hidden fixed bottom-20 right-4 bg-primary text-primary-foreground rounded-full p-3 shadow-lg"
      >
        <Plus size={24} />
      </Link>
    </>
  );
} 
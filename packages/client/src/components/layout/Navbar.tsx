'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 w-full border-b border-border bg-white dark:bg-n-900">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary dark:text-primary-dark">
              Kavira
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href={`/@${user.handle}`}
                className="text-sm font-medium text-foreground hover:text-primary dark:hover:text-primary-dark transition-colors"
              >
                @{user.handle}
              </Link>
              <button 
                onClick={logout}
                className="text-sm font-medium text-foreground hover:text-primary dark:hover:text-primary-dark transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/signup"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              Login / Register
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
} 
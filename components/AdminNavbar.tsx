'use client';

import { useState } from 'react';
import { Shield, Search, X, Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth';

interface AdminNavbarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function AdminNavbar({ user }: AdminNavbarProps) {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Search */}
        <div className="flex items-center flex-1 lg:justify-start">
          {/* Mobile Search Icon */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Search Bar - Hidden on mobile unless expanded */}
          <div className={cn(
            "absolute left-0 top-0 w-full px-4 py-3 bg-gray-900 lg:relative lg:top-auto lg:px-0 lg:py-0",
            "transition-all duration-200 ease-in-out",
            isSearchOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none",
            "lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto lg:max-w-md"
          )}>
            <div className="relative">
              {/* Close search button - mobile only */}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-300 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-500" aria-hidden="true" />
              </div>
              <input
                type="search"
                placeholder="Search..."
                className="block w-full rounded-md border-0 bg-gray-800 py-1.5 pl-10 pr-8 text-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg">
            <span className="absolute -top-0 -right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <Bell className="h-5 w-5" />
          </button>

          {/* User menu */}
          <div className="relative flex items-center">
            <button className="flex items-center space-x-3 p-2 text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg">
              <div className="flex items-center">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Logout */}
          <button 
            onClick={() => logout()}
            className="p-2 text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
} 
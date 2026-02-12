'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Ensure component hydrates on client
  useEffect(() => {
    setHydrated(true);
    console.log('Navigation hydrated. User:', user);
  }, [user]);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Chat', href: '/chat' },
    { label: 'Insights', href: '/insights' },
    { label: 'Settings', href: '/settings' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="glass-effect sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">Digital Twin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors font-medium ${
                  isActive(item.href)
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {hydrated ? (
              user ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-lg">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">
                    Sign In
                  </Link>
                  <Link href="/signup" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium">
                    Get Started
                  </Link>
                </>
              )
            ) : (
              // Loading skeleton
              <div className="h-10 w-40 bg-white/20 rounded-lg animate-pulse"></div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/30 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-gray-700 hover:bg-white/50 rounded cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {hydrated && user && (
              <>
                <div className="px-4 py-3 border-t border-white/30 mt-4">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-white/50 rounded transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            {hydrated && !user && (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-white/50 rounded cursor-pointer mt-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

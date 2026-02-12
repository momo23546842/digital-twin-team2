'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 w-full shadow-sm">
      <div className="flex items-center justify-between px-6 md:px-12 py-4 h-16">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 min-w-fit">
          <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">🤖</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight whitespace-nowrap hidden sm:inline">
            Digital Twin
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-gray-900 hover:text-green-600 font-normal text-sm transition duration-200 whitespace-nowrap">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/chat" className="text-gray-900 hover:text-green-600 font-normal text-sm transition duration-200 whitespace-nowrap">
                  Chat
                </Link>
                <Link href="/dashboard" className="text-gray-900 hover:text-green-600 font-normal text-sm transition duration-200 whitespace-nowrap">
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 min-w-fit justify-end">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 whitespace-nowrap hidden sm:inline font-medium">
                Hi, {user?.name}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition duration-200 whitespace-nowrap"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-gray-900 text-sm font-medium hover:text-green-600 transition duration-200 whitespace-nowrap hidden sm:inline"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition duration-200 whitespace-nowrap"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-4">
          <Link
            href="/"
            className="block text-gray-900 hover:text-green-600 font-medium transition duration-200"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/chat"
                className="block text-gray-900 hover:text-green-600 font-medium transition duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Chat
              </Link>
              <Link
                href="/dashboard"
                className="block text-gray-900 hover:text-green-600 font-medium transition duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </>
          )}
          {!isAuthenticated && (
            <Link
              href="/login"
              className="block text-gray-900 hover:text-green-600 font-medium transition duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

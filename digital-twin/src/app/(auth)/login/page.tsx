'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { setAuthData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      setAuthData(data.user, data.token);
      router.push('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 to-emerald-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-xl">🤖</span>
          </div>
          <span className="text-white font-bold text-xl">Digital Twin</span>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">AI-Powered Identity</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight">
            Your Digital<br />Twin Awaits
          </h1>
          <p className="text-white/75 text-lg leading-relaxed max-w-sm">
            An AI assistant that knows everything about you. Let it speak on your behalf.
          </p>

          {/* Fake testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 mt-8">
            <p className="text-white/90 text-sm leading-relaxed italic">
              "It's like having a clone that handles all my professional conversations perfectly."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">S</div>
              <div>
                <p className="text-white text-sm font-semibold">Sarah K.</p>
                <p className="text-white/60 text-xs">Product Designer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative text-white/50 text-xs">
          © 2025 Digital Twin. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-base">🤖</span>
            </div>
            <span className="font-bold text-gray-900">Digital Twin</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500">Sign in to continue to your Digital Twin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all duration-200 placeholder-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <span className="text-xs text-green-600 font-medium cursor-pointer hover:text-green-700">
                  Forgot password?
                </span>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all duration-200 placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>

            <p className="text-center text-sm text-gray-500 pt-2">
              Don't have an account?{' '}
              <Link href="/signup" className="text-green-600 font-semibold hover:text-green-700">
                Create one free
              </Link>
            </p>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Demo credentials</p>
            <p className="text-xs text-gray-500">
              Email: <span className="font-mono font-semibold text-gray-700">test@example.com</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Password: <span className="font-mono font-semibold text-gray-700">password123</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

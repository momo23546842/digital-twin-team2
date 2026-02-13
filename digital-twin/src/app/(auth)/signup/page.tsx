'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { setAuthData } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Signup failed');
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
            <span className="text-white/90 text-sm font-medium">Join thousands of users</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight">
            Build Your<br />Digital Identity
          </h1>
          <p className="text-white/75 text-lg leading-relaxed max-w-sm">
            Create an AI version of yourself that can answer questions, showcase your work, and represent you 24/7.
          </p>

          {/* Feature list */}
          <div className="space-y-3 mt-8">
            {[
              'AI that knows your full story',
              'Always available, never tired',
              'Professional & personalized responses',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-white/85 text-sm">{feature}</span>
              </div>
            ))}
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
            <h2 className="text-3xl font-black text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-500">Get started with your Digital Twin for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all duration-200 placeholder-gray-400"
              />
            </div>

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
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all duration-200 placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create free account'
              )}
            </button>

            <p className="text-center text-sm text-gray-500 pt-2">
              Already have an account?{' '}
              <Link href="/login" className="text-green-600 font-semibold hover:text-green-700">
                Sign in
              </Link>
            </p>
          </form>

          <p className="text-xs text-gray-400 text-center mt-8 leading-relaxed">
            By creating an account you agree to our{' '}
            <span className="text-gray-500 font-medium cursor-pointer hover:text-gray-700">Terms of Service</span>{' '}
            and{' '}
            <span className="text-gray-500 font-medium cursor-pointer hover:text-gray-700">Privacy Policy</span>
          </p>

        </div>
      </div>
    </div>
  );
}

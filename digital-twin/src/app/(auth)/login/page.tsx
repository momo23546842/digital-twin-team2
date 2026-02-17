"use client";

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
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Update auth context so the app knows we're authenticated immediately
      try {
        setAuthData(data.user, data.token);
      } catch (e) {
        console.error('setAuthData failed', e);
      }

      // Redirect to chat
      router.push('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md px-4 sm:px-0 space-y-8">
        <div className="text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <span className="text-white font-bold text-2xl">✦</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">Welcome Back</h2>
          <p className="text-sm sm:text-lg text-gray-300">Sign in to your Digital Twin account</p>
        </div>

        <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-5">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm sm:text-base font-semibold text-gray-200 mb-2">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 sm:px-5 sm:py-3 border border-white/10 rounded-lg bg-[#0b1220] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-sm sm:text-base text-white"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm sm:text-base font-semibold text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 sm:px-5 sm:py-3 border border-white/10 rounded-lg bg-[#0b1220] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-sm sm:text-base text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#25D366] text-[#061b13] font-bold rounded-lg hover:brightness-95 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center">
            <p className="text-gray-600 text-base">
              Don't have an account?{' '}
              <Link href="/signup" className="font-bold text-purple-600 hover:text-purple-700">
                Create one
              </Link>
            </p>
          </div>
        </form>

        <div className="bg-white/3 rounded-lg p-6 border border-white/5 text-left">
          <p className="text-xs font-bold text-gray-200 mb-3">DEMO CREDENTIALS:</p>
          <p className="text-xs text-gray-300 leading-relaxed">
            Email: <span className="font-mono font-semibold">test@example.com</span><br />
            Password: <span className="font-mono font-semibold">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}

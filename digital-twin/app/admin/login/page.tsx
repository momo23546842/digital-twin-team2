'use client';

import React, { useState } from 'react';
import { LogIn, AlertCircle, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));

      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Admin Access
            </h1>
            <p className="text-slate-400">Sign in to view leads and conversations</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 flex gap-2">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-400">
              Demo credentials: admin@example.com / password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

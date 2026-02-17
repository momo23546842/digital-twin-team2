'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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

      // Store auth data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      // Redirect to chat
      router.push('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md px-4 sm:px-0">
        {/* Card Container */}
        <div className="bg-[#071022] rounded-3xl shadow-2xl p-6 sm:p-10 border border-white/5">
          {/* Header Section */}
          <div className="text-center mb-12">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-2xl shadow-lg mb-6 sm:mb-8">
              <span className="text-white font-black text-2xl sm:text-3xl">✦</span>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 leading-tight">
              Create Account
            </h2>
            
            {/* Subtitle */}
            <p className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed">
              Create your Digital Twin account today
            </p>
          </div>

          {/* Form */}
          <form className="space-y-7" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-5">
                <p className="text-red-800 font-bold text-sm">{error}</p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Full Name Field */}
              <div>
                  <label htmlFor="name" className="block text-sm sm:text-xs font-black text-gray-200 mb-2 sm:mb-3 tracking-wider uppercase">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                    className="w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-white/6 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-800/10 focus:outline-none transition-all duration-200 bg-[#071022] text-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email-address" className="block text-xs font-black text-gray-200 mb-3 tracking-wider uppercase">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-5 py-4 border-2 border-white/6 rounded-2xl bg-[#071022] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-800/10 focus:outline-none transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs font-black text-gray-200 mb-3 tracking-wider uppercase">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-5 py-4 border-2 border-white/6 rounded-2xl bg-[#071022] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-800/10 focus:outline-none transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 px-6 bg-[#25D366] text-[#061b13] font-black rounded-2xl hover:brightness-95 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base tracking-tight shadow-lg mt-8"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            {/* Sign In Link */}
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-gray-700 text-sm font-medium">
                Already have an account?{' '}
                <Link href="/login" className="font-black text-purple-600 hover:text-purple-700 hover:underline transition-all duration-200">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Text */}
        <p className="text-xs text-gray-500 text-center leading-relaxed mt-8 font-medium px-4">
          By creating an account, you agree to our{' '}
          <span className="text-gray-600 font-semibold">Terms of Service</span> and{' '}
          <span className="text-gray-600 font-semibold">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const { user, isAuthenticated, login, logout, loading } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      setEmail('');
      setPassword('');
      setShowLoginForm(false);
    } catch (error: any) {
      setLoginError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white dark:bg-slate-900 shadow-sm z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="text-2xl font-bold text-gradient">Twin</div>
          <div className="flex gap-4 items-center">
            {!isAuthenticated && !loading && (
              <>
                <button
                  onClick={() => setShowLoginForm(!showLoginForm)}
                  className="btn btn-outline"
                >
                  {showLoginForm ? 'Cancel' : 'Login'}
                </button>
                <a href="/chat" className="btn btn-primary">
                  Chat Now
                </a>
              </>
            )}
            {isAuthenticated && !loading && (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email}
                </span>
                <a href="/chat" className="btn btn-primary">
                  Chat
                </a>
                <button onClick={logout} className="btn btn-outline">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Login Form Modal */}
      {showLoginForm && !isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 mt-16">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Login</h2>
            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                className="w-full btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-20 text-center section">
        <div className="container">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 animate-fadeIn">
            Meet Your Digital Twin
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 animate-slideInUp">
            An AI-powered career agent that speaks your language, answers questions about your experience, and books meetings—all in real time.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/chat" className="btn btn-primary text-lg px-8 py-3">
              Start Conversation
            </a>
            <button className="btn btn-outline text-lg px-8 py-3">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-gray-50 dark:bg-slate-800">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid-auto-fit">
            <div className="card">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Smart Chat</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Chat with an AI version of me. Ask about skills, projects, or anything else.
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-semibold mb-2">Voice Enabled</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Speak naturally and get instant responses. Hands-free interaction.
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Book Meetings</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Schedule calls directly. Integrated calendar management.
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Instant Responses</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time streaming AI responses. No waiting.
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">💾</div>
              <h3 className="text-xl font-semibold mb-2">Save Contacts</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Leave your details and stay in touch. Secure database.
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400">
                View all conversations and leads in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-8 text-center">About Me</h2>
          <div className="card">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              I'm a full-stack engineer passionate about building innovative AI solutions and digital experiences. This digital twin represents my expertise in modern web technologies, AI/ML integration, and business problem-solving.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Whether you want to discuss technology, explore collaboration opportunities, or just have a conversation about the future of AI, I'm here to help.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-primary to-accent text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start chatting now and discover how I can help you achieve your goals.
          </p>
          <a href="/chat" className="btn bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3">
            Launch Digital Twin
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-white py-8">
        <div className="container text-center">
          <p className="text-gray-400">&copy; 2024 Digital Twin. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

'use client';

import Link from 'next/link';

export function HeroSection() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-6xl mx-auto text-center">
        <div className="fade-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Your Professional Profile,
            <span className="gradient-text block mt-2">Always Available</span>
          </h1>
        </div>

        <div className="fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-xl sm:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            A Digital Twin that represents you to recruiters, clients, and visitors 24/7. Turn passive
            interest into concrete opportunities with an AI agent that truly knows your career.
          </p>
        </div>

        <div
          className="fade-in flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
          style={{ animationDelay: '0.5s' }}
        >
          <Link href="/chat" className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl flex items-center space-x-3 text-lg font-semibold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>Start Conversation</span>
          </Link>
          <Link href="/dashboard" className="group px-8 py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl flex items-center space-x-3 text-lg font-semibold border-2 border-gray-200">
            <span>View Dashboard</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 fade-in" style={{ animationDelay: '0.7s' }}>
          <FeatureCard
            icon="👥"
            title="24/7 Availability"
            description="Your AI representative never sleeps. Respond to recruiter inquiries instantly, any time of day."
          />
          <FeatureCard
            icon="📊"
            title="Career Intelligence"
            description="Turn every conversation into insights. Track what recruiters want and optimize your positioning."
          />
          <FeatureCard
            icon="⚡"
            title="Active Advocate"
            description="From static profile to proactive agent. Schedule meetings, answer questions, close opportunities."
          />
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="glass-effect p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
}

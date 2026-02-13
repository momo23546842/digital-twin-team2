'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { MessageCircle, Clock, TrendingUp, User } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Conversations', value: '12', icon: MessageCircle, color: 'bg-blue-500' },
    { label: 'Messages Sent', value: '48', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Hours Saved', value: '3.5', icon: Clock, color: 'bg-purple-500' },
    { label: 'Active Days', value: '7', icon: User, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your Digital Twin
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/chat"
              className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors group"
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-semibold group-hover:text-green-800">
                Start New Chat
              </span>
            </Link>
            <button className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors group">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-semibold group-hover:text-gray-800">
                Update Profile
              </span>
            </button>
            <button className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors group">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-semibold group-hover:text-gray-800">
                View Analytics
              </span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { time: '2 hours ago', action: 'Started conversation about project timeline' },
              { time: '5 hours ago', action: 'Updated profile information' },
              { time: '1 day ago', action: 'Chatted about technical skills' },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{activity.action}</p>
                  <p className="text-gray-500 text-sm mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import {
  LogOut,
  BarChart3,
  Users,
  MessageCircle,
  Calendar,
  Settings,
  ChevronRight,
  Phone,
  Mail,} from 'lucide-react';
import type { Contact, DashboardStats } from '@/types';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'contacts' | 'conversations' | 'meetings'>(
    'overview'
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Fetch recent contacts
      const contactsResponse = await fetch('/api/admin/contacts?limit=10&status=new', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData.contacts);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    trend,
  }: {
    icon: React.ComponentType<{ size: number }>;
    label: string;
    value: number;
    trend?: number;
  }) => (
    <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6 hover:bg-slate-700/50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
              {trend > 0 ? '+' : ''}{trend}% from yesterday
            </p>
          )}
        </div>
        <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          {[
            { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
            { id: 'contacts' as const, label: 'Contacts', icon: Users },
            { id: 'conversations' as const, label: 'Conversations', icon: MessageCircle },
            { id: 'meetings' as const, label: 'Meetings', icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                selectedTab === id
                  ? 'text-emerald-400 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-300 border-transparent'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-slate-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {selectedTab === 'overview' && stats && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    icon={MessageCircle}
                    label="Total Conversations"
                    value={stats.total_conversations}
                  />
                  <StatCard
                    icon={Users}
                    label="Total Contacts"
                    value={stats.total_contacts}
                  />
                  <StatCard
                    icon={Calendar}
                    label="Total Meetings"
                    value={stats.total_meetings}
                  />
                  <StatCard
                    icon={MessageCircle}
                    label="Pending Meetings"
                    value={stats.pending_meetings}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <StatCard
                    icon={MessageCircle}
                    label="Conversations Today"
                    value={stats.conversations_today}
                  />
                  <StatCard
                    icon={Users}
                    label="New Contacts Today"
                    value={stats.new_contacts_today}
                  />
                </div>
              </div>
            )}

            {/* Contacts Tab */}
            {selectedTab === 'contacts' && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Recent Contacts</h2>
                <div className="space-y-3">
                  {contacts.length > 0 ? (
                    contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{contact.name}</h3>
                            <div className="flex flex-col gap-1 text-sm text-slate-400">
                              <div className="flex items-center gap-2">
                                <Mail size={16} />
                                {contact.email}
                              </div>
                              {contact.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone size={16} />
                                  {contact.phone}
                                </div>
                              )}
                            </div>
                            {contact.company && (
                              <p className="text-sm text-slate-300 mt-2">{contact.company}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-xs px-2 py-1 rounded font-medium ${
                                contact.status === 'new'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-slate-600 text-slate-300'
                              }`}
                            >
                              {contact.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No contacts yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Conversations Tab */}
            {selectedTab === 'conversations' && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Recent Conversations</h2>
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
                  <p className="text-slate-400">Conversation details coming soon...</p>
                </div>
              </div>
            )}

            {/* Meetings Tab */}
            {selectedTab === 'meetings' && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Upcoming Meetings</h2>
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
                  <p className="text-slate-400">Meeting details coming soon...</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

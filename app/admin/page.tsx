'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  created_at: string;
}

interface Meeting {
  id: number;
  name: string;
  email: string;
  scheduled_at: string;
  status: string;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactsRes, meetingsRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/meetings'),
      ]);

      if (contactsRes.status === 401 || meetingsRes.status === 401) {
        logout();
        return;
      }

      if (contactsRes.ok) {
        const data = await contactsRes.json();
        setContacts(data.contacts);
      }

      if (meetingsRes.ok) {
        const data = await meetingsRes.json();
        setMeetings(data.meetings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="container py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage conversations, leads, and meetings</p>
          </div>
          {isAuthenticated && user && (
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{user.email}</p>
              <button onClick={logout} className="btn btn-secondary text-sm">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="container flex gap-8">
          {['overview', 'contacts', 'meetings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary text-primary dark:border-accent dark:text-accent'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <div className="container py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="text-2xl font-bold text-primary">{contacts.length}</div>
              <p className="text-gray-600 dark:text-gray-400">Total Contacts</p>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-accent">{meetings.length}</div>
              <p className="text-gray-600 dark:text-gray-400">Scheduled Meetings</p>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-gray-600 dark:text-gray-400">Conversations</p>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-gray-600 dark:text-gray-400">Avg Response Time</p>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Contacts</h2>
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : contacts.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No contacts yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Company</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                        <td className="px-6 py-4">{contact.name}</td>
                        <td className="px-6 py-4 text-primary dark:text-accent">{contact.email}</td>
                        <td className="px-6 py-4">{contact.company || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Scheduled Meetings</h2>
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : meetings.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No meetings scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="card">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{meeting.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{meeting.email}</p>
                        <p className="text-sm mt-2">
                          {new Date(meeting.scheduled_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="badge">{meeting.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

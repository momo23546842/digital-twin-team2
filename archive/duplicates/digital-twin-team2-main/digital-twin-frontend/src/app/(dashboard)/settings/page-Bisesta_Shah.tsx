'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import {
  ProfileSection,
  ExperienceSection,
  NotificationsSection,
  SecuritySection,
} from '@/components/settings/SettingsSections';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'experience':
        return <ExperienceSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'security':
        return <SecuritySection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <>
      <Navigation />
      <div className="content-wrapper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings & Profile</h1>
            <p className="text-gray-600 text-lg">Manage your Digital Twin and account preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
            <div className="lg:col-span-3">{renderSection()}</div>
          </div>
        </div>
      </div>
    </>
  );
}

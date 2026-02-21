'use client';

export function SettingsSidebar({ activeSection, onSectionChange }: { activeSection: string; onSectionChange: (section: string) => void }) {
  const sections = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-24">
        <nav className="p-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              <span className="font-semibold">{section.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

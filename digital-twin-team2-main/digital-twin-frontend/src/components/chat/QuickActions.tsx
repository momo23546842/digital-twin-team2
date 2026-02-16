'use client';

interface QuickActionProps {
  emoji: string;
  label: string;
  onClick: () => void;
}

export function QuickActions({ onActionClick }: { onActionClick: (action: string) => void }) {
  const actions: QuickActionProps[] = [
    { emoji: '📅', label: 'Schedule Meeting', onClick: () => onActionClick('schedule') },
    { emoji: '💼', label: 'View Portfolio', onClick: () => onActionClick('portfolio') },
    { emoji: '📄', label: 'Download Resume', onClick: () => onActionClick('resume') },
    { emoji: '🎯', label: 'Technical Skills', onClick: () => onActionClick('skills') },
  ];

  return (
    <div className="glass-effect border-t border-white/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              {action.emoji} {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

interface SkillBarProps {
  name: string;
  mentions: number;
  percentage: number;
  badge?: { text: string; type: 'hot' | 'growing' };
}

export function SkillsInDemand() {
  const skills: SkillBarProps[] = [
    { name: 'Next.js', mentions: 47, percentage: 95, badge: { text: '🔥 Hot', type: 'hot' } },
    { name: 'React', mentions: 43, percentage: 92, badge: { text: '🔥 Hot', type: 'hot' } },
    {
      name: 'TypeScript',
      mentions: 39,
      percentage: 88,
      badge: { text: '📈 Growing', type: 'growing' },
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-purple-50">
        <h2 className="text-xl font-bold text-gray-900">Skills in Demand</h2>
      </div>
      <div className="p-6 space-y-4">
        {skills.map((skill) => (
          <div key={skill.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{skill.name}</span>
                {skill.badge && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      skill.badge.type === 'hot' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {skill.badge.text}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">{skill.mentions} mentions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full"
                style={{ width: `${skill.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

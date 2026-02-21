'use client';

export function AIInsights() {
  const insights = [
    {
      emoji: '💡',
      title: 'Your profile resonates with Senior Developer roles',
      subtitle: 'Based on 15 recruiter interactions this month',
    },
    {
      emoji: '📈',
      title: 'Remote positions show 2x higher engagement',
      subtitle: 'Consider highlighting remote work preference',
    },
    {
      emoji: '🔥',
      title: 'Your Next.js expertise is in high demand',
      subtitle: '8 companies specifically mentioned this skill',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl text-white overflow-hidden">
      <div className="px-6 py-4 border-b border-purple-500">
        <h2 className="text-xl font-bold flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>AI Insights</span>
        </h2>
      </div>
      <div className="p-6 space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h3 className="font-semibold mb-2">
              {insight.emoji} {insight.title}
            </h3>
            <p className="text-sm text-blue-100">{insight.subtitle}</p>
          </div>
        ))}
        <button className="w-full mt-4 px-4 py-3 bg-white text-purple-600 rounded-xl hover:bg-blue-50 transition-all font-semibold">
          View All Insights
        </button>
      </div>
    </div>
  );
}

'use client';

import Navigation from '@/components/layout/Navigation';
import { StatCard } from '@/components/ui/StatCard';
import { SkillsInDemand } from '@/components/insights/SkillsInDemand';
import { TopLocations } from '@/components/insights/TopLocations';

export default function InsightsPage() {
  const metrics = [
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      iconBgColor: 'bg-blue-100',
      value: '1,234',
      trend: '+23%',
      description: 'Total Views',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      iconBgColor: 'bg-purple-100',
      value: '67%',
      trend: '+12%',
      description: 'Engagement Rate',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      iconBgColor: 'bg-green-100',
      value: '< 1min',
      trend: '-15%',
      description: 'Response Time',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      iconBgColor: 'bg-orange-100',
      value: '34%',
      trend: '+8%',
      description: 'Conversion Rate',
    },
  ];

  return (
    <>
      <Navigation />
      <div className="content-wrapper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Career Intelligence</h1>
            <p className="text-gray-600 text-lg">
              AI-powered insights from your interactions and profile performance
            </p>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric) => (
              <StatCard
                key={metric.description}
                icon={metric.icon}
                iconBgColor={metric.iconBgColor}
                value={metric.value}
                trend={metric.trend}
                description={metric.description}
              />
            ))}
          </div>

          {/* Skills & Geographic Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkillsInDemand />
            <TopLocations />
          </div>
        </div>
      </div>
    </>
  );
}

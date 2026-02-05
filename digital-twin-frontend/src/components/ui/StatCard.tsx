'use client';

interface StatCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  value: string | number;
  trend?: string;
  trendColor?: string;
  description: string;
}

export function StatCard({
  icon,
  iconBgColor,
  value,
  trend,
  trendColor = 'text-green-600',
  description,
}: StatCardProps) {
  return (
    <div className="stat-card bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBgColor}`}>{icon}</div>
        {trend && (
          <span className={`text-sm ${trendColor} font-semibold`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

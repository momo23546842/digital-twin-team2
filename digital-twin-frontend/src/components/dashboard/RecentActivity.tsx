'use client';

interface RecentActivityProps {
  activities: Array<{
    id: string;
    company: string;
    action: string;
    time: string;
    icon: React.ReactNode;
    bgColor: string;
  }>;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
      </div>
      <div className="p-6 space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
          >
            <div className={`p-2 rounded-lg ${activity.bgColor}`}>{activity.icon}</div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{activity.company}</p>
              <p className="text-gray-600">{activity.action}</p>
            </div>
            <span className="text-sm text-gray-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

interface LocationCardProps {
  name: string;
  opportunities: number;
  avgSalary: string;
}

export function TopLocations() {
  const locations: LocationCardProps[] = [
    { name: 'San Francisco, CA', opportunities: 18, avgSalary: '$165k' },
    { name: 'Remote', opportunities: 24, avgSalary: '$145k' },
    { name: 'New York, NY', opportunities: 15, avgSalary: '$155k' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-green-50">
        <h2 className="text-xl font-bold text-gray-900">Top Locations</h2>
      </div>
      <div className="p-6 space-y-4">
        {locations.map((location) => (
          <div
            key={location.name}
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all"
          >
            <div>
              <h3 className="font-semibold text-gray-900">{location.name}</h3>
              <p className="text-sm text-gray-600">{location.opportunities} opportunities</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">{location.avgSalary}</p>
              <p className="text-xs text-gray-500">avg. salary</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

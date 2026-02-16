'use client';

/**
 * FeatureCard Component
 * Reusable feature card with icon, title, and description
 */

export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  index?: number;
}

export function FeatureCard({ icon, title, description, index = 0 }: FeatureCardProps) {
  return (
    <div
      className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-green-300 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Hover gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative space-y-4">
        <div className="text-5xl group-hover:scale-125 group-hover:rotate-6 transition-all duration-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
          {description}
        </p>
      </div>
    </div>
  );
}

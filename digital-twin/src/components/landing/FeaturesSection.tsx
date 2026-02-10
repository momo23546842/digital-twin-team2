'use client';

import { FeatureCard } from './FeatureCard';

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesSectionProps {
  title: string;
  subtitle: string;
  features: readonly Feature[];
}

/**
 * FeaturesSection Component
 * Displays a grid of feature cards
 */
export function FeaturesSection({ title, subtitle, features }: FeaturesSectionProps) {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 space-y-6">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight">{title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">{subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard
              key={`${feature.title}-${idx}`}
              {...feature}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

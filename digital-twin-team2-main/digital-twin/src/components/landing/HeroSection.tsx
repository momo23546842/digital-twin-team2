'use client';

import { useLandingNavigation } from '@/hooks/useLanding';

export interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  primaryCta: { label: string; onClick: () => void };
  secondaryCta: { label: string; onClick: () => void };
  socialProof?: { count: string; label: string };
}

/**
 * HeroSection Component
 * Main hero section with heading, description, and CTAs
 */
export function HeroSection({
  title,
  subtitle,
  description,
  primaryCta,
  secondaryCta,
  socialProof,
}: HeroSectionProps) {
  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full hover:border-green-300 transition-colors duration-300">
          <span className="text-lg">✨</span>
          <span className="text-green-700 text-sm font-semibold tracking-wide">{subtitle}</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[1.1] tracking-tight">
            {title}
            <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              AI Twin
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl font-medium">
            {description}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          onClick={primaryCta.onClick}
          className="group relative px-8 py-4 bg-gradient-to-r from-gray-900 to-black text-white font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden"
        >
          <span className="relative inline-flex items-center gap-2">
            {primaryCta.label}
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </span>
        </button>
        <button
          onClick={secondaryCta.onClick}
          className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg"
        >
          {secondaryCta.label}
        </button>
      </div>

      {socialProof && (
        <div className="flex items-center gap-6 pt-8">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold border-3 border-white shadow-lg hover:scale-110 transition-transform hover:-translate-y-1"
              >
                {i}
              </div>
            ))}
          </div>
          <div>
            <p className="text-gray-700 font-bold text-lg">{socialProof.count}</p>
            <p className="text-gray-600 text-sm">{socialProof.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}

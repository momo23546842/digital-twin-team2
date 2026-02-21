'use client';

export interface Benefit {
  title: string;
  description: string;
}

export interface AboutSectionProps {
  heading: string;
  benefits: readonly Benefit[];
  ctaLabel: string;
  onCta: () => void;
}

/**
 * AboutSection Component
 * Displays about content with benefits list and CTA
 */
export function AboutSection({ heading, benefits, ctaLabel, onCta }: AboutSectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Visual Element */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl transform rotate-6"></div>
            <div className="absolute inset-0 bg-white rounded-3xl transform -rotate-3 shadow-xl border border-gray-200 flex items-center justify-center p-8">
              <div className="text-center space-y-6">
                <div className="text-6xl">👋</div>
                <p className="text-gray-700 font-semibold text-lg">Hi, I'm Your Digital Twin</p>
                <p className="text-gray-500">Ask me anything about skills, projects, or availability</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">{heading}</h2>

            <div className="space-y-6">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onCta}
              className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg mt-8"
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

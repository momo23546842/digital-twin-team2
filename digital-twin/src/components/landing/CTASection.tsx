'use client';

export interface CTASectionProps {
  heading: string;
  description: string;
  primaryCta: { label: string; onClick: () => void };
  secondaryCta: { label: string; onClick: () => void };
}

/**
 * CTASection Component
 * Call-to-action section with dark background
 */
export function CTASection({
  heading,
  description,
  primaryCta,
  secondaryCta,
}: CTASectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-6">{heading}</h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 font-medium">{description}</p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={primaryCta.onClick}
            className="px-8 py-4 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-lg"
          >
            {primaryCta.label}
          </button>
          <button
            onClick={secondaryCta.onClick}
            className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-300"
          >
            {secondaryCta.label}
          </button>
        </div>
      </div>
    </section>
  );
}

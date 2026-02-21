'use client';

/**
 * HeroVisual Component
 * Animated visual element for the hero section
 */
export function HeroVisual() {
  return (
    <div className="relative hidden md:block animate-fade-in-right">
      <div className="relative w-full aspect-square">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 rounded-3xl transform -rotate-6 shadow-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-3xl transform rotate-3 shadow-2xl border-2 border-gray-100 flex items-center justify-center overflow-hidden group hover:shadow-3xl transition-all duration-500">
          <div className="text-center space-y-6 p-8 group-hover:scale-105 transition-transform duration-500">
            <div className="text-7xl animate-bounce">🤖</div>
            <p className="text-gray-900 font-black text-2xl">AI Digital Twin</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Always ready to chat, answer questions, and represent you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

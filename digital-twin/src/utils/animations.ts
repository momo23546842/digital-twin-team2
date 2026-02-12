/**
 * Animation utility functions
 * Helpers for creating consistent animations across the app
 */

export const animationClasses = {
  fadeInUp: 'animate-fade-in-up',
  fadeInRight: 'animate-fade-in-right',
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in',
  blob: 'animate-blob',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
} as const;

export const transitionClasses = {
  default: 'transition-all duration-300',
  slow: 'transition-all duration-500',
  fast: 'transition-all duration-200',
} as const;

/**
 * Creates a scroll animation delay based on index
 */
export function getAnimationDelay(index: number): string {
  const delay = index * 100;
  return `animation-delay-${delay}ms`;
}

/**
 * Combines multiple class names with animation support
 */
export function createAnimatedClassName(
  baseClass: string,
  animationClass?: string,
  transitionClass: string = transitionClasses.default
): string {
  return `${baseClass} ${animationClass || ''} ${transitionClass}`.trim();
}

/**
 * Button animation helpers
 */
export const buttonAnimations = {
  hover: 'hover:scale-105 active:scale-95',
  elevate: 'hover:shadow-2xl hover:-translate-y-1',
  pulse: 'hover:shadow-lg transition-all duration-300',
} as const;

/**
 * Creates a gradient background with animation
 */
export function createGradientAnimation(
  fromColor: string,
  toColor: string,
  animate: boolean = true
): string {
  const gradient = `bg-gradient-to-r ${fromColor} ${toColor}`;
  const animation = animate ? 'animate-gradient bg-[length:200%]' : '';
  return `${gradient} ${animation}`.trim();
}

/**
 * Custom hook for scroll animation triggers
 * Tracks scroll position and triggers animations at breakpoints
 */

'use client';

import { useEffect, useState } from 'react';

export function useScrollAnimation() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      setIsScrolled(position > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollPosition, isScrolled };
}

/**
 * Custom hook for navigation
 * Provides easy navigation to different pages
 */

import { useRouter } from 'next/navigation';

export function useLandingNavigation() {
  const router = useRouter();

  return {
    goToLogin: () => router.push('/login'),
    goToSignup: () => router.push('/signup'),
    goToChat: () => router.push('/chat'),
    goToDashboard: () => router.push('/dashboard'),
  };
}

/**
 * Custom hook for animation state
 * Manages component animation states
 */

export function useAnimationState() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return { isVisible };
}

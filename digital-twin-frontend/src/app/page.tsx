'use client';

import Navigation from '@/components/layout/Navigation';
import { HeroSection } from '@/components/dashboard/HeroSection';

export default function Home() {
  return (
    <>
      <Navigation />
      <div className="content-wrapper">
        <HeroSection />
      </div>
    </>
  );
}

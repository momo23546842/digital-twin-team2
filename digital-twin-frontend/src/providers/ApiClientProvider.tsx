'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

/**
 * Provider component that sets up the API client with Next.js router.
 * This allows the API client to use client-side navigation for redirects
 * instead of full page reloads.
 */
export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Set up the redirect callback to use Next.js router
    apiClient.setOnUnauthorized(() => {
      router.push('/login');
    });

    // Cleanup is not strictly necessary since we want this to persist,
    // but we can reset to default behavior if needed
    return () => {
      apiClient.setOnUnauthorized(() => {
        window.location.href = '/login';
      });
    };
  }, [router]);

  return <>{children}</>;
}

'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

/**
 * Provider component that sets up the API client with Next.js router.
 * This allows the API client to use client-side navigation for redirects
 * instead of full page reloads.
 */
export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleUnauthorized = useCallback(() => {
    router.push('/login');
  }, [router]);

  useEffect(() => {
    // Set up the redirect callback to use Next.js router
    apiClient.setOnUnauthorized(handleUnauthorized);
  }, [handleUnauthorized]);

  return <>{children}</>;
}

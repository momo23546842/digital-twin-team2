'use client';

import { useAuth } from '@/lib/auth-context';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking auth
  // Middleware already handles redirecting unauthenticated users to /login
  // So if we're here, either we're still loading OR we're authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth check completed but not authenticated, middleware should have redirected.
  // If we're still here, it means auth verification may have had an issue.
  // Render children anyway since middleware already validated the cookie exists.
  // The ChatPageComplete will handle any API-level auth errors gracefully.
  return <>{children}</>;
}

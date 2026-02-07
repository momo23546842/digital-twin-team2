'use client';

import { ApiClientProvider } from '@/providers/ApiClientProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApiClientProvider>{children}</ApiClientProvider>;
}

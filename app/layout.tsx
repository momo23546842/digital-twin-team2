import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Digital Twin Career Agent',
  description: 'AI-powered career assistant and recruiter agent',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

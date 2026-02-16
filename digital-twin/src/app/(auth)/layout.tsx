import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import CallWidgetGate from '@/components/CallWidgetGate' 

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'Digital Twin - Your AI Career Assistant',
  description: 'Chat with an AI assistant that knows everything about you. Ask questions, explore experience, and connect.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <CallWidgetGate /> {}
        <Analytics />
      </body>
    </html>
  )
}


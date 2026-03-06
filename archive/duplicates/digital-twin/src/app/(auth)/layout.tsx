import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} font-sans antialiased min-h-screen bg-[#0f0f1a]`}>
      {children}
    </div>
  )
}


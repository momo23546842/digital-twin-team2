import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Digital Twin Career Agent",
  description: "AI-powered career guidance and job matching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0f0f1a] text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Twin - Your Professional Profile, Always Available",
  description: "A Digital Twin that represents you to recruiters, clients, and visitors 24/7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Crimson+Pro:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body
        className="bg-gradient-to-br from-purple-600 to-purple-700"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Space_Grotesk, Crimson_Pro } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-crimson-pro",
  display: "swap",
});

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
    <html lang="en" className={`${spaceGrotesk.variable} ${crimsonPro.variable}`}>
      <body
        className={`${spaceGrotesk.className} bg-gradient-to-br from-purple-600 to-purple-700`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

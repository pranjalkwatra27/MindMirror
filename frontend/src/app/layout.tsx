import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MindMirror – AI Placement Coach & Interview Platform",
  description: "Enterprise-grade AI platform for placement preparation, adaptive interview simulations, resume ATS analysis, and DSA mastery.",
  keywords: ["interview prep", "AI coach", "placement preparation", "resume analyzer", "mock interview", "DSA", "MindMirror"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#070913] text-slate-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


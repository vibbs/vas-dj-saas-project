'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@vas-dj-saas/ui";
import { AuthProvider } from "@/providers/AuthProvider";
import { validateEnv } from "@/lib/env";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Validate environment on app initialization
if (typeof window === 'undefined') {
  validateEnv();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>VAS-DJ SaaS</title>
        <meta name="description" content="Your next-generation SaaS platform" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

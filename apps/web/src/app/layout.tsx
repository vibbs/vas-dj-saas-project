import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "./Providers";
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

// Validate environment on app initialization (server-side only)
validateEnv();

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.vasdjsaas.com";

export const metadata: Metadata = {
  title: {
    default: "VAS-DJ SaaS",
    template: "%s | VAS-DJ SaaS",
  },
  description:
    "Your next-generation SaaS platform — multi-tenant, secure, and scalable.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "VAS-DJ SaaS",
    title: "VAS-DJ SaaS",
    description:
      "Your next-generation SaaS platform — multi-tenant, secure, and scalable.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VAS-DJ SaaS",
    description:
      "Your next-generation SaaS platform — multi-tenant, secure, and scalable.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

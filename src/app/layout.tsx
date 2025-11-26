
import 'dotenv/config';
import type {Metadata, Viewport} from 'next';
import { PT_Sans } from 'next/font/google';
import '@/app/globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { PWALoader } from '@/components/pwa-loader';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'NovaEd',
  description: 'Your personal AI-powered home learning companion.',
  icons: {
    icon: '/icon.png', // Standard favicon
    apple: '/icon.png', // Apple touch icon for home screen
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#1C1C1C',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
       <head>
        <link rel="apple-touch-icon" href="/icon.png"></link>
      </head>
      <body className={cn("font-sans antialiased h-full", ptSans.variable)} suppressHydrationWarning>
        <PWALoader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

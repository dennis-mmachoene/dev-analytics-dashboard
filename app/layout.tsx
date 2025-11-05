// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dev Analytics Dashboard | GitHub Portfolio Analytics',
  description: 'Analyze GitHub developer profiles with detailed insights into coding activity, language usage, and contribution patterns.',
  keywords: ['github', 'analytics', 'developer', 'portfolio', 'statistics'],
  authors: [{ name: 'Dennis Mmachoene Ramara' }],
  icons:{
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'Dev Analytics Dashboard',
    description: 'Analyze any GitHub developer profile',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
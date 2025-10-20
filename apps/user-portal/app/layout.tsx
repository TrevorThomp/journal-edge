import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/store/StoreProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'JournalEdge.io - Trading Journal & Analytics',
  description:
    'Professional trading journal with advanced analytics, calendar management, and performance tracking',
  keywords: [
    'trading journal',
    'trading analytics',
    'trade tracking',
    'trading performance',
    'stock trading',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

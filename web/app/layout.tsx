import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Campus Facility Maintenance System',
  description:
    'Campus Facility Maintenance Request Management System — Woxsen University. Manage maintenance requests, technicians, inventory, and campus infrastructure.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#FAF8F5] text-[#2A2521] antialiased selection:bg-[#F3CABE] selection:text-[#C86446]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

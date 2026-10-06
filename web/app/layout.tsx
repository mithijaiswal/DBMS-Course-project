import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Campus Facility Maintenance System | DBMS PBL',
  description:
    'Design and Implementation of a Relational Database Management System for Campus Facility Maintenance (MySQL, 3NF, Prisma ORM). Mithi Jaiswal (25WU0102158) & Soumya Purohit (25WU0102272).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#FAF8F5] text-[#2A2521] antialiased selection:bg-[#F3CABE] selection:text-[#C86446]">
        {children}
      </body>
    </html>
  );
}

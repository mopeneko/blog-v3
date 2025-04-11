import type { Metadata } from 'next';
import './globals.css';
import { NavBar } from '@/app/components/NavBar';
import { Footer } from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'もぺブログ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-theme="pastel">
      <body>
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

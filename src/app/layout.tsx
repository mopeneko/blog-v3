import type { Metadata } from 'next';
import './globals.css';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'もぺブログ',
  twitter: {
    card: 'summary',
    site: '@nkyna_',
    creator: '@nkyna_',
    title: 'もぺブログ',
  },
  openGraph: {
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: 'もぺブログ',
    siteName: 'もぺブログ',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-theme="pastel">
      <body>
        <div className="flex flex-col gap-4">
          <NavBar />
          {children}
          <Footer className="mb-4" />
        </div>
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3857753364740983"
              crossOrigin="anonymous"
            />
            <Script
              src="https://cloud.umami.is/script.js"
              data-website-id="871a8d52-f12f-4d22-bce2-bdedd46679d9"
            />
          </>
        )}
      </body>
    </html>
  );
}

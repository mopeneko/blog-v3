import type { Metadata } from 'next';
import Script from 'next/script';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';

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
  alternates: {
    types: {
      'application/rss+xml': `${process.env.NEXT_PUBLIC_SITE_URL}/rss.xml`,
    },
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
        <Theme>{children}</Theme>
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3857753364740983"
              crossOrigin="anonymous"
            />
            <Script
              src={`${process.env.NEXT_PUBLIC_SITE_URL}/XpvJpm7N.js`}
              data-website-id="871a8d52-f12f-4d22-bce2-bdedd46679d9"
            />
          </>
        )}
      </body>
    </html>
  );
}

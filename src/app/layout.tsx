import type { Metadata } from 'next';
import Script from 'next/script';
import '@radix-ui/themes/styles.css';
import { Box, Flex, Text, Theme } from '@/components/radix';
import Link from 'next/link';
import styles from './layout.module.css';

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
        <Theme>
          <Box className={styles.pageContainer}>
            <Flex direction="column" gap="4">
              <Box
                style={{
                  maxWidth: '1100px',
                  margin: '0 auto',
                  width: '100%',
                }}
              >
                <Link
                  href="/"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <Text weight="medium" color="cyan">
                    {'もぺブログ'}
                  </Text>
                </Link>
              </Box>
              {children}
            </Flex>
          </Box>
        </Theme>
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

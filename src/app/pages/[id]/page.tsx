import { Box, Card, Flex, Heading, Inset, Text } from '@radix-ui/themes';
import type { Metadata } from 'next';
import { fetchPageBySlug } from '@/lib/api/list_posts';
import type { ArticleDetail } from '@/lib/articleDetails';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

export async function generateMetadata(
  props: PageProps<'/pages/[id]'>,
): Promise<Metadata> {
  const { id } = await props.params;
  const page = await fetchPageBySlug(id);
  const image = page.thumbnail
    ? {
        url: page.thumbnail.url,
        width: page.thumbnail.width,
        height: page.thumbnail.height,
      }
    : undefined;
  return {
    title: `${page.title} - もぺブログ`,
    openGraph: {
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/pages/${id}`,
      title: `${page.title} - もぺブログ`,
      siteName: 'もぺブログ',
      images: image,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nkyna_',
      creator: '@nkyna_',
      title: `${page.title} - もぺブログ`,
      images: image,
    },
    alternates: {
      types: {
        'application/rss+xml': `${process.env.NEXT_PUBLIC_SITE_URL}/rss.xml`,
      },
    },
  };
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export default async function Page(props: PageProps<'/pages/[id]'>) {
  const { id } = await props.params;
  const apiPage = await fetchPageBySlug(id);
  const detail: ArticleDetail = {
    title: apiPage.title,
    slug: apiPage.slug,
    date: apiPage.published_at,
    updated: apiPage.updated_at,
    tags: [],
    thumbnailUrl: apiPage.thumbnail?.url,
    content: apiPage.content,
  };

  if (!detail) {
    notFound();
  }

  const heroThumbnailStyle = detail.thumbnailUrl
    ? {
        backgroundImage: `url(${detail.thumbnailUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : undefined;

  return (
    <Box className={styles.pageContainer}>
      <Box style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Flex direction="column" gap="5">
          <Card variant="surface" size="4" className={styles.heroCard}>
            <Flex direction="column" gap="4">
              <Inset clip="padding-box" side="top" pb="current">
                <Box className={styles.cover} style={heroThumbnailStyle}>
                  <Box style={{ paddingTop: '38%' }} />
                </Box>
              </Inset>

              <Flex direction={{ initial: 'column', sm: 'row' }} gap="3">
                <Flex
                  gap="3"
                  align="center"
                  wrap="wrap"
                  className={styles.meta}
                >
                  <Text color="gray" size="2">
                    公開: {formatDate(detail.date)}
                  </Text>
                  <Text color="gray" size="2" className={styles.metaDivider}>
                    ／
                  </Text>
                  <Text color="gray" size="2">
                    更新: {formatDate(detail.updated)}
                  </Text>
                </Flex>
              </Flex>

              <Flex direction="column" gap="2">
                <Text weight="medium" color="cyan">
                  {'Post'}
                </Text>
                <Heading size="8">{detail.title}</Heading>
              </Flex>
            </Flex>
          </Card>

          <Card variant="surface" size="4" className={styles.bodyCard}>
            <Box
              className={styles.articleHtml}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: CMSから記事本文がHTMLで返されるため
              dangerouslySetInnerHTML={{ __html: detail.content }}
            />
          </Card>
        </Flex>
      </Box>
    </Box>
  );
}

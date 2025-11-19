import {
  Badge,
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  Inset,
  Text,
} from '@radix-ui/themes';
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchPostsByTags, fetchTagById } from '@/lib/api/list_posts';
import type { Article } from '@/lib/article';
import styles from '../../page.module.css';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export async function generateMetadata(
  props: PageProps<'/tags/[id]'>,
): Promise<Metadata> {
  const { id } = await props.params;
  const tag = await fetchTagById(id);
  return {
    title: `${tag.name} - もぺブログ`,
    twitter: {
      card: 'summary',
      site: '@nkyna_',
      creator: '@nkyna_',
      title: `${tag.name} - もぺブログ`,
    },
    openGraph: {
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/tags/${id}`,
      title: `${tag.name} - もぺブログ`,
      siteName: 'もぺブログ',
    },
    alternates: {
      types: {
        'application/rss+xml': `${process.env.NEXT_PUBLIC_SITE_URL}/rss.xml`,
      },
    },
  };
}

export default async function TagPage(props: PageProps<'/tags/[id]'>) {
  const { id } = await props.params;
  const tag = await fetchTagById(id);
  const posts = await fetchPostsByTags([id]);
  const tagLabel = tag.name;
  const taggedArticles: Article[] = posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    date: post.published_at,
    tags: post.tags.map((tag) => ({
      id: tag.id,
      label: tag.name,
    })),
    thumbnailUrl: post.thumbnail?.url,
  }));

  return (
    <Box className={styles.pageContainer}>
      <Box style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Flex direction="column" gap="4">
          <Flex direction="column" gap="2">
            <Text weight="medium" color="cyan">
              {'Tag'}
            </Text>
            <Heading size="8">{tagLabel}</Heading>
            <Text color="gray">
              {taggedArticles.length > 0
                ? `${tagLabel} に関する記事をまとめました。`
                : `${tagLabel} の記事はまだありません。`}
            </Text>
          </Flex>

          {taggedArticles.length > 0 ? (
            <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
              {taggedArticles.map((article) => {
                const thumbnailBackground = article.thumbnailUrl
                  ? `url(${article.thumbnailUrl})`
                  : 'linear-gradient(135deg, #e3f5ff, #9bd7ff)';

                return (
                  <Card
                    key={article.slug}
                    variant="surface"
                    size="3"
                    asChild
                    style={{ height: '100%' }}
                    className={styles.articleCard}
                  >
                    <Link
                      href={`/posts/${article.slug}`}
                      style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        height: '100%',
                      }}
                    >
                      <Flex
                        direction="column"
                        gap="3"
                        style={{ height: '100%' }}
                      >
                        <Inset clip="padding-box" side="top" pb="current">
                          <Box
                            style={{
                              borderRadius: '12px',
                              overflow: 'hidden',
                              backgroundImage: thumbnailBackground,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                            }}
                            className={styles.articleThumb}
                          >
                            <Box style={{ paddingTop: '60%' }} />
                          </Box>
                        </Inset>

                        <Flex
                          direction="column"
                          gap="2"
                          style={{ flexGrow: 1 }}
                        >
                          <Heading size="4">{article.title}</Heading>
                          <Text color="gray" size="2">
                            {formatDate(article.date)}
                          </Text>
                        </Flex>

                        <Flex gap="2" wrap="wrap">
                          {article.tags.map((articleTag) => (
                            <Badge
                              key={articleTag.id}
                              color="cyan"
                              variant="soft"
                              radius="medium"
                              className={styles.tagBadge}
                            >
                              {articleTag.label}
                            </Badge>
                          ))}
                        </Flex>
                      </Flex>
                    </Link>
                  </Card>
                );
              })}
            </Grid>
          ) : (
            <Card variant="surface" size="3">
              <Flex direction="column" gap="2">
                <Heading size="4">記事が見つかりませんでした</Heading>
                <Text color="gray">
                  記事が追加され次第、このタグページに表示されます。
                </Text>
                <Link
                  href="/"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <Text weight="medium" color="cyan">
                    ホームに戻る
                  </Text>
                </Link>
              </Flex>
            </Card>
          )}
        </Flex>
      </Box>
    </Box>
  );
}

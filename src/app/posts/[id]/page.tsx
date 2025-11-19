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
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Article } from '@/lib/article';
import type { ArticleDetail } from '@/lib/articleDetails';
import styles from './page.module.css';
import { fetchPostBySlug, fetchPostsByTags } from '@/lib/api/list_posts';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default async function PostPage(props: PageProps<'/posts/[id]'>) {
  const { id } = await props.params;

  const apiArticle = await fetchPostBySlug(id);
  const detail: ArticleDetail = {
    title: apiArticle.title,
    slug: apiArticle.slug,
    date: apiArticle.published_at,
    updated: apiArticle.updated_at,
    tags: apiArticle.tags.map((tag) => ({
      id: tag.id,
      label: tag.name,
    })),
    thumbnailUrl: apiArticle.thumbnail?.url,
    content: apiArticle.content,
  };

  if (!detail) {
    notFound();
  }

  const apiRelatedArticles = await fetchPostsByTags(
    apiArticle.tags.map((tag) => tag.id),
  );

  const relatedArticles: Article[] = apiRelatedArticles.map((article) => ({
    title: article.title,
    slug: article.slug,
    date: article.published_at,
    tags: article.tags.map((tag) => ({
      id: tag.id,
      label: tag.name,
    })),
    thumbnailUrl: article.thumbnail?.url,
  }));

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
                <Flex gap="2" wrap="wrap">
                  {detail.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      color="cyan"
                      variant="soft"
                      radius="medium"
                      className={styles.tagBadge}
                      asChild
                    >
                      <Link href={`/tags/${encodeURIComponent(tag.id)}`}>
                        {tag.label}
                      </Link>
                    </Badge>
                  ))}
                </Flex>
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
              // biome-ignore lint/security/noDangerouslySetInnerHtml: CMSが記事本文をHTMLで返すため
              dangerouslySetInnerHTML={{ __html: detail.content }}
            />
          </Card>

          {relatedArticles.length > 0 ? (
            <Flex direction="column" gap="3">
              <Flex direction="column" gap="1">
                <Text weight="medium" color="cyan">
                  {'Related'}
                </Text>
                <Heading size="6">関連記事</Heading>
                <Text color="gray">
                  同じテーマの読み物を3件までピックアップしました。
                </Text>
              </Flex>

              <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
                {relatedArticles.map((related) => (
                  <Card
                    key={related.slug}
                    variant="surface"
                    size="3"
                    asChild
                    className={styles.relatedCard}
                  >
                    <Link
                      href={`/posts/${related.slug}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      <Flex direction="column" gap="3">
                        <Inset clip="padding-box" side="top" pb="current">
                          <Box
                            className={styles.relatedCover}
                            style={
                              related.thumbnailUrl
                                ? {
                                    backgroundImage: `url(${related.thumbnailUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                  }
                                : undefined
                            }
                          >
                            <Box style={{ paddingTop: '52%' }} />
                          </Box>
                        </Inset>
                        <Flex direction="column" gap="1">
                          <Heading size="4">{related.title}</Heading>
                          <Text color="gray" size="2">
                            {formatDate(related.date)}
                          </Text>
                        </Flex>
                        <Flex gap="2" wrap="wrap">
                          {related.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              color="cyan"
                              variant="soft"
                              radius="medium"
                              className={styles.tagBadge}
                            >
                              {tag.label}
                            </Badge>
                          ))}
                        </Flex>
                      </Flex>
                    </Link>
                  </Card>
                ))}
              </Grid>
            </Flex>
          ) : null}
        </Flex>
      </Box>
    </Box>
  );
}

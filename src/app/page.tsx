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
import { fetchPosts } from '@/lib/api/list_posts';
import type { Article } from '@/lib/article';
import Link from 'next/link';
import styles from './page.module.css';
import React from 'react';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default async function Home() {
  const posts = await fetchPosts();

  const articles: Article[] = posts.map((post) => ({
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
              {'Journal'}
            </Text>
            <Heading size="8">最新の記事</Heading>
            <Text color="gray">
              デザインと実装のメモを、水色ベースの落ち着いたカードでまとめました。
            </Text>
          </Flex>

          <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
            {articles.map((article, i) => {
              const thumbnailBackground = article.thumbnailUrl
                ? `url(${article.thumbnailUrl})`
                : 'linear-gradient(135deg, #e3f5ff, #9bd7ff)';

              return (
                <React.Fragment key={article.slug}>
                  {(i + 1) % 3 === 0 && (
                    <>
                      <ins
                        className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-format="fluid"
                        data-ad-layout-key="-7c+eo+1+2-5"
                        data-ad-client="ca-pub-3857753364740983"
                        data-ad-slot="5385219852"
                      />
                      <script
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: For Google AdSense ad unit
                        dangerouslySetInnerHTML={{
                          __html:
                            '(adsbygoogle = window.adsbygoogle || []).push({});',
                        }}
                      />
                    </>
                  )}
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
                          {article.tags.map((tag) => (
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
                </React.Fragment>
              );
            })}
          </Grid>
        </Flex>
      </Box>
    </Box>
  );
}

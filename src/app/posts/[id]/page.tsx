import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Inset,
  Text,
} from '@radix-ui/themes';
import type { Metadata } from 'next';
import 'lite-youtube-embed/src/lite-yt-embed.css';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Article } from '@/lib/article';
import type { ArticleDetail } from '@/lib/articleDetails';
import styles from './page.module.css';
import { fetchPostBySlug, fetchPostsByTags } from '@/lib/api/list_posts';
import { generatePostJsonLd } from '@/lib/structured-data/post';
import { LiteYTEmbed } from '@/components/LiteYTEmbed';
import type { Root } from 'hast';
import { visit } from 'unist-util-visit';
import { rehype } from 'rehype';
import type { AffiliateProduct } from '@/lib/affiliateProducts';
import Image from 'next/image';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const rehypeInsertAdsPlugin = () => {
  let count = 0;

  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'h2' || node.properties?.['ad-heading']) {
        return;
      }

      count++;
      if (count !== 2) {
        return;
      }

      const headingText = node.children[0];

      node.tagName = 'div';
      node.children = [
        {
          type: 'element',
          tagName: 'ins',
          properties: {
            className: 'adsbygoogle',
            style: 'display:block; text-align:center;',
            'data-ad-layout': 'in-article',
            'data-ad-format': 'fluid',
            'data-ad-client': 'ca-pub-3857753364740983',
            'data-ad-slot': '1281498636',
          },
          children: [],
        },
        {
          type: 'element',
          tagName: 'script',
          properties: {},
          children: [
            {
              type: 'text',
              value: '(adsbygoogle = window.adsbygoogle || []).push({});',
            },
          ],
        },
        {
          type: 'element',
          tagName: 'h2',
          properties: {
            'ad-heading': true,
          },
          children: [headingText],
        },
      ];
    });
  };
};

const rehypeLiteYTPlugin = () => {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'p' && node.children.length > 0 && node.children[0].type === 'text') {
        const matches = node.children[0].value.match(
          /<lite-youtube videoid="([a-zA-z0-9_-]+)">/,
        );
        if (!matches) {
          return;
        }

        node.tagName = 'lite-youtube';
        node.properties = { videoid: matches[1] };
        node.children = [];
      }
    });
  };
};

export async function generateMetadata(
  props: PageProps<'/posts/[id]'>,
): Promise<Metadata> {
  const { id } = await props.params;
  const post = await fetchPostBySlug(id);
  const image = post.thumbnail
    ? {
        url: post.thumbnail.url,
        width: post.thumbnail.width,
        height: post.thumbnail.height,
      }
    : undefined;
  return {
    title: `${post.title} - もぺブログ`,
    openGraph: {
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/posts/${id}`,
      title: `${post.title} - もぺブログ`,
      siteName: 'もぺブログ',
      images: image,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nkyna_',
      creator: '@nkyna_',
      title: `${post.title} - もぺブログ`,
      images: image,
    },
    alternates: {
      types: {
        'application/rss+xml': `${process.env.NEXT_PUBLIC_SITE_URL}/rss.xml`,
      },
    },
  };
}

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

  const content = String(
    await rehype()
      .use([rehypeInsertAdsPlugin, rehypeLiteYTPlugin])
      .process(detail.content),
  );

  const apiRelatedArticles = await fetchPostsByTags(
    apiArticle.tags.map((tag) => tag.id),
    3,
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

  const affiliateProduct: AffiliateProduct | undefined = apiArticle.product
    ? {
        name: apiArticle.product.name,
        maker: apiArticle.product.manufacture,
        thumbnailUrl: apiArticle.product.image?.url ?? '',
        links: apiArticle.product.links.map((link) => ({
          href: link.url,
          label: link.text,
        })),
      }
    : undefined;

  const heroThumbnailStyle = detail.thumbnailUrl
    ? {
        backgroundImage: `url(\"${detail.thumbnailUrl}\")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : undefined;

  return (
    <>
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
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </Card>

            {affiliateProduct ? (
              <Flex
                direction="column"
                gap="2"
                className={styles.affiliateSection}
              >
                <Text size="2" color="gray" className={styles.affiliateLabel}>
                  スポンサーリンク
                </Text>
                <Card
                  variant="surface"
                  size="4"
                  className={styles.affiliateCard}
                >
                  <Flex
                    direction={{ initial: 'column', sm: 'row' }}
                    gap="4"
                    align="center"
                  >
                    <Box className={styles.affiliateThumbnail}>
                      <Image
                        width={128}
                        height={128}
                        src={affiliateProduct.thumbnailUrl}
                        alt={affiliateProduct.name}
                      />
                    </Box>
                    <Flex direction="column" gap="3" style={{ flexGrow: 1 }}>
                      <Flex direction="column" gap="1">
                        <Heading size="5">{affiliateProduct.name}</Heading>
                        <Text color="gray" size="2">
                          メーカー: {affiliateProduct.maker}
                        </Text>
                      </Flex>
                      {affiliateProduct.links.length > 0 ? (
                        <Flex gap="2" wrap="wrap">
                          {affiliateProduct.links.map((link) => (
                            <Button
                              key={link.href}
                              color="cyan"
                              size="3"
                              radius="large"
                              asChild
                            >
                              <Link
                                href={link.href}
                                target="_blank"
                                rel="noreferrer noopener sponsored"
                              >
                                {link.label}
                              </Link>
                            </Button>
                          ))}
                        </Flex>
                      ) : null}
                    </Flex>
                  </Flex>
                </Card>
              </Flex>
            ) : null}

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

      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Structured Data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generatePostJsonLd({
              title: apiArticle.title,
              slug: apiArticle.slug,
              thumbnail: apiArticle.thumbnail?.url,
              publishedAt: apiArticle.published_at,
              updatedAt: apiArticle.updated_at,
            }),
          ),
        }}
      />

      <LiteYTEmbed />
    </>
  );
}

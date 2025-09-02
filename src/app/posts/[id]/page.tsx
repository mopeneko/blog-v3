import { ProductCard } from '@/components/ProductCard';
import { RelatedArticleCard } from '@/components/RelatedArticleCard';
import { Tag as TagComponent } from '@/components/Tag';
import { fetchPostsByTags } from '@/lib/api/list_posts';
import { fetchPostBySlug } from '@/lib/api/list_posts';
import NextImage from 'next/image';
import NextLink from 'next/link';
import React from 'react';
import { Root } from 'hast';
import { Metadata } from 'next';
import { rehype } from 'rehype';
import { visit } from 'unist-util-visit';
import { LiteYTEmbed } from '@/components/LiteYTEmbed';
import 'lite-youtube-embed/src/lite-yt-embed.css';
import { generatePostJsonLd } from '@/lib/structured-data/post';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = (await params).id;
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

const formatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const post = await fetchPostBySlug((await params).id);
  const product = post.product && {
    name: post.product.name,
    manufacture: post.product.manufacture,
    image: post.product.image,
    links: post.product.links.map((link) => ({
      text: link.text,
      url: link.url,
    })),
  };

  const content = String(
    await rehype().use(rehypeInsertAdsPlugin).process(post.content),
  );

  const relatedPosts = await fetchPostsByTags(
    post.tags.map((tag) => tag.id),
    3,
  );

  return (
    <>
      <article className="max-w-lg mx-auto px-2 flex flex-col gap-y-4">
        <h1 className="text-2xl font-bold">{post.title}</h1>

        <div className="grid grid-row-1 gap-y-2">
          <div className="text-xs text-right">
            <div>
              Published on {formatter.format(new Date(post.published_at))}
            </div>
            <div>Updated on {formatter.format(new Date(post.updated_at))}</div>
          </div>

          <div className="text-right">
            {post.tags.map((tag, i) => (
              <React.Fragment key={tag.id}>
                {i > 0 && ' '}
                <NextLink href={`/tags/${tag.id}`}>
                  <TagComponent name={tag.name} />
                </NextLink>
              </React.Fragment>
            ))}
          </div>
        </div>

        {post.thumbnail && (
          <NextImage
            className="w-full rounded-lg"
            src={post.thumbnail.url}
            alt={post.title}
            width={post.thumbnail.width}
            height={post.thumbnail.height}
            loading="eager"
          />
        )}

        <div
          className="prose w-full m-auto"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {product && (
          <ProductCard
            name={product.name}
            manufacture={product.manufacture}
            image={
              product.image
                ? { src: product.image.url, altText: product.name }
                : null
            }
            links={product.links}
          />
        )}

        {relatedPosts.map((relatedPost) => (
          <NextLink key={relatedPost.id} href={`/posts/${relatedPost.slug}`}>
            <RelatedArticleCard
              title={relatedPost.title}
              publishedAt={formatter.format(new Date(relatedPost.published_at))}
              updatedAt={formatter.format(new Date(relatedPost.updated_at))}
              tags={relatedPost.tags.map((tag) => ({
                id: tag.id,
                name: tag.name,
              }))}
            />
          </NextLink>
        ))}
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="autorelaxed"
          data-ad-client="ca-pub-3857753364740983"
          data-ad-slot="3205804455"
        ></ins>
        <script
          dangerouslySetInnerHTML={{
            __html: '(adsbygoogle = window.adsbygoogle || []).push({});',
          }}
        />
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generatePostJsonLd({
              title: post.title,
              slug: post.slug,
              thumbnail: post.thumbnail?.url,
              publishedAt: post.published_at,
              updatedAt: post.updated_at,
            }),
          ),
        }}
      />
      <LiteYTEmbed />
    </>
  );
}

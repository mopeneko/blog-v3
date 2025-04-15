import { Article } from '@/components/Article';
import { fetchPostBySlug } from '@/lib/api/list_posts';
import { Root } from 'hast';
import { Metadata } from 'next';
import { rehype } from 'rehype';
import { visit } from 'unist-util-visit';
import { LiteYTEmbed } from '@/components/LiteYTEmbed';
import 'lite-youtube-embed/src/lite-yt-embed.css';

export async function generateMetadata({
  params,
}: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = (await params).id;
  const post = await fetchPostBySlug(id);
  const image = post.thumbnail
    ? {
        url: post.thumbnail.src,
        width: post.thumbnail.width,
        height: post.thumbnail.height,
      }
    : undefined;
  return {
    title: `${post.title} - もぺブログ`,
    openGraph: {
      type: 'website',
      url: `https://www.mope-blog.com/posts/${id}`,
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

export default async function Post({
  params,
}: { params: Promise<{ id: string }> }) {
  const post = await fetchPostBySlug((await params).id);
  const product = post.product && {
    name: post.product.name,
    manufacture: post.product.manufacture,
    image: post.product.image,
    links: post.product.links.map((link) => ({
      text: link.data.text,
      url: link.data.url,
    })),
  };

  const content = String(
    await rehype().use(rehypeInsertAdsPlugin).process(post.content),
  );

  return (
    <>
      <Article
        title={post.title}
        publishedAt={post.published_at}
        updatedAt={post.updated_at}
        content={content}
        thumbnail={post.thumbnail || undefined}
        tags={post.tags.map((tag) => ({
          id: tag._id,
          name: tag.name,
        }))}
        product={product || undefined}
      />
      <LiteYTEmbed />
    </>
  );
}

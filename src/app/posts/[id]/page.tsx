import { Article } from '@/components/Article';
import { fetchPostBySlug } from '@/lib/api/list_posts';
import { Metadata } from 'next';

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

  return (
    <Article
      title={post.title}
      publishedAt={post.published_at}
      updatedAt={post.updated_at}
      content={post.content}
      thumbnail={post.thumbnail || undefined}
      tags={post.tags.map((tag) => ({
        id: tag._id,
        name: tag.name,
      }))}
      product={product || undefined}
    />
  );
}

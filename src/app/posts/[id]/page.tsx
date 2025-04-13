import { Article } from '@/components/Article';
import { fetchPostBySlug } from '@/lib/api/list_posts';

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

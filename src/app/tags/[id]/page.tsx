import { ArticleCard } from '@/components/ArticleCard';
import { fetchPostsByTags, fetchTagById } from '@/lib/api/list_posts';

export async function generateMetadata({
  params,
}: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const tag = await fetchTagById(id);
  return { title: `${tag.name} - もぺブログ` };
}

export default async function TagPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const posts = await fetchPostsByTags([(await params).id]);
  const articleCards = posts.map((post) => {
    const thumbnail = post.thumbnail
      ? {
          src: post.thumbnail.src,
          alt: post.thumbnail.altText,
          width: post.thumbnail.width,
          height: post.thumbnail.height,
        }
      : undefined;

    const tags = post.tags.map((tag) => ({
      id: tag._id,
      name: tag.name,
    }));

    return (
      <ArticleCard
        key={post._id}
        slug={post.slug}
        image={thumbnail}
        title={post.title}
        publishedDate={new Date(post.published_at)}
        updatedDate={new Date(post.updated_at)}
        tags={tags}
      />
    );
  });

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-2 gap-y-4">
      {articleCards}
    </div>
  );
}

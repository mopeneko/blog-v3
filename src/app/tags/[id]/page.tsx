import { ArticleCard } from '@/components/ArticleCard';
import { fetchPostsByTags, fetchTagById } from '@/lib/api/list_posts';

export async function generateMetadata({
  params,
}: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
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

export default async function TagPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const tag = await fetchTagById(id);
  const posts = await fetchPostsByTags([id]);
  const articleCards = posts.map((post) => {
    const thumbnail = post.thumbnail
      ? {
          src: post.thumbnail.url,
          width: post.thumbnail.width ?? 0,
          height: post.thumbnail.height ?? 0,
        }
      : undefined;

    const tags = post.tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    }));

    return (
      <ArticleCard
        key={post.id}
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
      <h2 className="text-2xl font-bold text-center">{tag.name}</h2>
      {articleCards}
    </div>
  );
}

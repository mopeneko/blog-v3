import React from 'react';
import { ArticleCard } from '@/components/ArticleCard';
import { fetchPosts } from '@/lib/api/list_posts';

export default async function Home() {
  const posts = await fetchPosts();
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
      {articleCards.map((articleCard, i) => (
        <React.Fragment key={articleCard.key}>
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
                  __html: '(adsbygoogle = window.adsbygoogle || []).push({});',
                }}
              />
            </>
          )}
          {articleCard}
        </React.Fragment>
      ))}
    </div>
  );
}

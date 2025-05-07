import { ArticleCard } from '@/components/ArticleCard';
import { fetchPosts } from '@/lib/api/list_posts';
import React from 'react';

export default async function Home() {
  const posts = await fetchPosts();
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
              ></ins>
              <script
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

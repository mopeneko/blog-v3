import { ProductCard } from '@/components/ProductCard';
import { RelatedArticleCard } from '@/components/RelatedArticleCard';
import { Tag as TagComponent } from '@/components/Tag';
import { fetchPostsByTags } from '@/lib/api/list_posts';
import NextImage from 'next/image';
import NextLink from 'next/link';
import React from 'react';

interface Image {
  src: string;
  altText: string;
  width: number;
  height: number;
}

interface Link {
  text: string;
  url: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Product {
  name: string;
  manufacture: string;
  image: Image | null;
  links: Link[];
}

interface ArticleProps {
  title: string;
  publishedAt: string;
  updatedAt: string;
  content: string;
  thumbnail?: Image;
  tags: Tag[];
  product?: Product;
}

const formatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const Article = async ({
  title,
  publishedAt,
  updatedAt,
  content,
  thumbnail,
  tags,
  product,
}: ArticleProps) => {
  const relatedPosts = await fetchPostsByTags(tags.map((tag) => tag.id));

  return (
    <article className="max-w-lg mx-auto px-2 flex flex-col gap-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="grid grid-row-1 gap-y-2">
        <div className="text-xs text-right">
          <div>Published on {formatter.format(new Date(publishedAt))}</div>
          <div>Updated on {formatter.format(new Date(updatedAt))}</div>
        </div>

        <div className="text-right">
          {tags.map((tag, i) => (
            <React.Fragment key={tag.id}>
              {i > 0 && ' '}
              <NextLink href={`/tags/${tag.id}`}>
                <TagComponent name={tag.name} />
              </NextLink>
            </React.Fragment>
          ))}
        </div>
      </div>

      {thumbnail && (
        <NextImage
          className="w-full rounded-lg"
          src={thumbnail.src}
          alt={thumbnail.altText}
          width={thumbnail.width}
          height={thumbnail.height}
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
          image={product.image}
          links={product.links}
        />
      )}

      {relatedPosts.map((post) => (
        <NextLink key={post._id} href={`/posts/${post.slug}`}>
          <RelatedArticleCard
            title={post.title}
            publishedAt={formatter.format(new Date(post.published_at))}
            updatedAt={formatter.format(new Date(post.updated_at))}
            tags={post.tags.map((tag) => ({
              id: tag._id,
              name: tag.name,
            }))}
          />
        </NextLink>
      ))}
    </article>
  );
};

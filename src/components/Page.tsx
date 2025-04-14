import NextImage from 'next/image';
import React from 'react';

interface Image {
  src: string;
  altText: string;
  width: number;
  height: number;
}

interface ArticleProps {
  title: string;
  publishedAt: string;
  updatedAt: string;
  content: string;
  thumbnail?: Image;
}

const formatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const Page = async ({
  title,
  publishedAt,
  updatedAt,
  content,
  thumbnail,
}: ArticleProps) => {
  return (
    <article className="max-w-lg mx-auto px-2 flex flex-col gap-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="grid grid-row-1 gap-y-2">
        <div className="text-xs text-right">
          <div>Published on {formatter.format(new Date(publishedAt))}</div>
          <div>Updated on {formatter.format(new Date(updatedAt))}</div>
        </div>
      </div>

      {thumbnail && (
        <NextImage
          className="w-full rounded-lg"
          src={thumbnail.src}
          alt={thumbnail.altText}
          width={thumbnail.width}
          height={thumbnail.height}
          loading="lazy"
        />
      )}

      <div
        className="prose w-full m-auto"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
};

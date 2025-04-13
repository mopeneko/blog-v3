import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

interface ArticleImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface Tag {
  id: string;
  name: string;
}

interface ArticleCardProps {
  image?: ArticleImage;
  title: string;
  publishedDate: Date;
  updatedDate: Date;
  tags: Tag[];
}

const formatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const ArticleCard = ({
  image,
  title,
  publishedDate,
  updatedDate,
  tags,
}: ArticleCardProps) => (
  <Link href="/posts/slug">
    <article className="card bg-base-200 shadow-sm">
      {image && (
        <figure className="aspect-video">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
          />
        </figure>
      )}

      <div className="card-body">
        <h2 className="card-title">{title}</h2>

        <footer className="card-actions justify-end">
          <div className="flex flex-col gap-y-2">
            <div className="text-xs text-right">
              <div>Published on {formatter.format(publishedDate)}</div>
              <div>Updated on {formatter.format(updatedDate)}</div>
            </div>

            <div className="text-right">
              {tags.map((tag, i) => (
                <React.Fragment key={tag.id}>
                  {i > 0 && ' '}
                  <span className="badge badge-soft badge-neutral">
                    {tag.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </article>
  </Link>
);

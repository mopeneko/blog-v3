import { Tag as TagComponent } from '@/components/Tag';
import React from 'react';

interface Tag {
  id: string;
  name: string;
}

interface RelatedArticleCardProps {
  title: string;
  publishedAt: string;
  updatedAt: string;
  tags: Tag[];
}

export const RelatedArticleCard = ({
  title,
  publishedAt,
  updatedAt,
  tags,
}: RelatedArticleCardProps) => (
  <article className="card bg-base-200 shadow-sm">
    <div className="card-body">
      <h2 className="card-title">{title}</h2>

      <footer className="card-actions justify-end">
        <div className="grid grid-row-1 gap-y-2">
          <div className="text-xs text-right">
            <div>Published on {publishedAt}</div>
            <div>Updated on {updatedAt}</div>
          </div>

          <div className="text-right">
            {tags.map((tag, i) => (
              <React.Fragment key={tag.id}>
                {i > 0 && ' '}
                <TagComponent name={tag.name} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </footer>
    </div>
  </article>
);

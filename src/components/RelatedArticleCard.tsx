import { Tag as TagComponent } from '@/components/Tag';

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
  <article className="card bg-base-200 shadow-sm mt-4">
    <div className="card-body">
      <h2 className="card-title">{title}</h2>

      <footer className="card-actions justify-end">
        <div className="grid grid-row-1 gap-y-2">
          <div className="text-xs text-right">
            <div>Published on {publishedAt}</div>
            <div>Updated on {updatedAt}</div>
          </div>

          <div className="text-right">
            {tags.map((tag) => (
              <TagComponent key={tag.id} name={tag.name} />
            ))}
          </div>
        </div>
      </footer>
    </div>
  </article>
);

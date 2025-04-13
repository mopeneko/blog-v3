import { ProductCard } from '@/components/ProductCard';
import { Tag as TagComponent } from '@/components/Tag';
import NextImage from 'next/image';
import NextLink from 'next/link';

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

export const Article = ({
  title,
  publishedAt,
  updatedAt,
  content,
  thumbnail,
  tags,
  product,
}: ArticleProps) => (
  <article className="max-w-lg mx-auto px-2 my-8">
    <h1 className="text-2xl font-bold">{title}</h1>

    <div className="grid grid-row-1 gap-y-2 mt-2">
      <div className="text-xs text-right">
        <div>Published on {publishedAt}</div>
        <div>Updated on {updatedAt}</div>
      </div>

      <div className="text-right">
        {tags.map((tag) => (
          <NextLink key={tag.id} href={`/${tag.id}`}>
            <TagComponent name={tag.name} />
          </NextLink>
        ))}
      </div>
    </div>

    {thumbnail && (
      <figure className="mt-4">
        <NextImage
          className="w-full rounded-lg"
          src={thumbnail.src}
          alt={thumbnail.altText}
          width={thumbnail.width}
          height={thumbnail.height}
          loading="lazy"
        />
      </figure>
    )}

    <div
      className="prose mt-8 w-full m-auto"
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
  </article>
);

import NextImage from 'next/image';

interface Image {
  src: string;
  altText: string;
}

interface Link {
  text: string;
  url: string;
}

interface ProductCardProps {
  name: string;
  manufacture: string;
  image: Image | null;
  links: Link[];
}

export const ProductCard = ({
  name,
  manufacture,
  image,
  links,
}: ProductCardProps) => (
  <div className="card bg-base-300 shadow-sm">
    {image && (
      <figure className="aspect-video">
        <NextImage
          className="h-full"
          src={image.src}
          alt={image.altText}
          loading="lazy"
        />
      </figure>
    )}

    <div className="card-body">
      <div className="flex justify-between">
        <h3 className="card-title">{name}</h3>
        <span className="text-xs">PR</span>
      </div>
      <p className="card-text text-sm">{manufacture}</p>

      <footer className="card-actions justify-end">
        {links.map((link) => (
          <a key={link.text} href={link.url} className="btn btn-primary">
            {link.text}
          </a>
        ))}
      </footer>
    </div>
  </div>
);

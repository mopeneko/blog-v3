export type AffiliateProductLink = {
  label: string;
  href: string;
};

export type AffiliateProduct = {
  name: string;
  maker: string;
  thumbnailUrl: string;
  links: AffiliateProductLink[];
};

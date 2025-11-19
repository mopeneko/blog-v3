export type Tag = {
  id: string;
  label: string;
};

export type Article = {
  title: string;
  slug: string;
  date: string;
  tags: Tag[];
  thumbnailUrl?: string;
};

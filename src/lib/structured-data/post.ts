interface Post {
  title: string;
  slug: string;
  thumbnail?: string;
  publishedAt: string;
  updatedAt: string;
}

export const generatePostJsonLd = (post: Post) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: 'もぺ',
      url: 'https://lem0n.cc',
    },
    ...(post.thumbnail && { image: post.thumbnail }),
  };
};

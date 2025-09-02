import { createClient } from 'microcms-js-sdk';
import { z } from 'zod';

const content = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
  revisedAt: z.string().optional(),
});

const image = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

const link = z.object({
  text: z.string(),
  url: z.string(),
});

const tag = z.object({ name: z.string() }).merge(content);

type Tag = z.infer<typeof tag>;

const product = z
  .object({
    name: z.string(),
    manufacture: z.string(),
    links: z.array(link),
    image: z.nullable(image),
  })
  .merge(content);

const post = z
  .object({
    title: z.string(),
    slug: z.string(),
    thumbnail: z.optional(image),
    content: z.string(),
    tags: z.array(tag),
    published_at: z.string(),
    updated_at: z.string(),
    product: z.nullable(product),
  })
  .merge(content);

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
});

export type Post = z.infer<typeof post>;

const page = z
  .object({
    title: z.string(),
    slug: z.string(),
    content: z.string(),
    thumbnail: z.optional(image),
    published_at: z.string(),
    updated_at: z.string(),
  })
  .merge(content);

type Page = z.infer<typeof page>;

export const fetchPosts = async () => {
  const result = await client.getList<Post>({
    endpoint: 'post',
    queries: {
      orders: '-published_at',
      depth: 2,
      limit: 100,
    },
  });
  return result.contents.map((item) => post.parse(item));
};

export const fetchPostBySlug = async (slug: string) => {
  const result = await client.getList<Post>({
    endpoint: 'post',
    queries: {
      filters: `slug[equals]${slug}`,
      depth: 2,
    },
  });
  return post.parse(result.contents[0]);
};

export const fetchPostsByTags = async (tags: string[], limit?: number) => {
  const result = await client.getList<Post>({
    endpoint: 'post',
    queries: {
      filters: `tags[contains]${tags.join('[or]')}`,
      orders: '-published_at',
      depth: 2,
      limit,
    },
  });
  return result.contents.map((item) => post.parse(item));
};

export const fetchPageBySlug = async (slug: string) => {
  const result = await client.getList<Page>({
    endpoint: 'pages',
    queries: {
      filters: `slug[equals]${slug}`,
      depth: 2,
    },
  });
  return page.parse(result.contents[0]);
};

export const fetchTagById = async (id: string) => {
  const result = await client.get<Tag>({
    endpoint: 'tag',
    contentId: id,
  });
  return tag.parse(result);
};

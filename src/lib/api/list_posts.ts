import { createClient } from 'newt-client-js';
import { z } from 'zod';

const content = z.object({
  _id: z.string(),
  _sys: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
    customOrder: z.number(),
    raw: z.object({
      createdAt: z.string(),
      updatedAt: z.string(),
      firstPublishedAt: z.string(),
      publishedAt: z.string(),
    }),
  }),
});

const image = z.object({
  _id: z.string(),
  src: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  width: z.number(),
  height: z.number(),
  title: z.string(),
  description: z.string(),
  altText: z.string(),
  metadata: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()]),
  ),
});

const link = z.object({
  _id: z.string(),
  type: z.string(),
  data: z.object({
    text: z.string(),
    url: z.string(),
  }),
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
    thumbnail: z.nullable(image),
    content: z.string(),
    tags: z.array(tag),
    published_at: z.string(),
    updated_at: z.string(),
    product: z.nullable(product),
  })
  .merge(content);

const client = createClient({
  spaceUid: process.env.NEWT_SPACE_UID!,
  token: process.env.NEWT_TOKEN!,
  apiType: process.env.NEWT_API_TYPE as 'api' | 'cdn',
});

type Post = z.infer<typeof post>;

const page = z
  .object({
    title: z.string(),
    slug: z.string(),
    content: z.string(),
    thumbnail: z.nullable(image),
    published_at: z.string(),
    updated_at: z.string(),
  })
  .merge(content);

type Page = z.infer<typeof page>;

export const fetchPosts = async () => {
  const result = await client.getContents<Post>({
    appUid: process.env.NEWT_APP_UID!,
    modelUid: process.env.NEWT_MODEL_UID!,
    query: {
      order: ['-published_at'],
      depth: 2,
    },
  });
  return result.items.map((item) => post.parse(item));
};

export const fetchPostBySlug = async (slug: string) => {
  const result = await client.getContents<Post>({
    appUid: process.env.NEWT_APP_UID!,
    modelUid: process.env.NEWT_MODEL_UID!,
    query: { slug: { match: slug }, depth: 2 },
  });
  return post.parse(result.items[0]);
};

export const fetchPostsByTags = async (tags: string[]) => {
  const result = await client.getContents<Post>({
    appUid: process.env.NEWT_APP_UID!,
    modelUid: process.env.NEWT_MODEL_UID!,
    query: {
      'tags[in]': tags.join(','),
      order: ['-published_at'],
      depth: 2,
    },
  });
  return result.items.map((item) => post.parse(item));
};

export const fetchPageBySlug = async (slug: string) => {
  const result = await client.getContents<Page>({
    appUid: process.env.NEWT_APP_UID!,
    modelUid: process.env.NEWT_PAGE_MODEL_UID!,
    query: { slug: { match: slug }, depth: 2 },
  });
  return page.parse(result.items[0]);
};

export const fetchTagById = async (id: string) => {
  const result = await client.getContent<Tag>({
    appUid: process.env.NEWT_APP_UID!,
    modelUid: process.env.NEWT_TAG_MODEL_UID!,
    contentId: id,
  });
  return tag.parse(result);
};

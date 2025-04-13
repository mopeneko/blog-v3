import { createClient, GetContentsQuery } from 'newt-client-js';
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

const product = z
  .object({
    name: z.string(),
    manufacture: z.string(),
    links: z.array(link),
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

export const fetchPosts = async (query?: GetContentsQuery) => {
  const result = await client.getContents<z.infer<typeof post>>({
    appUid: process.env.NEWT_APP_UID!,
    modelUid: process.env.NEWT_MODEL_UID!,
    query: query,
  });
  return result.items.map((item) => post.parse(item));
};

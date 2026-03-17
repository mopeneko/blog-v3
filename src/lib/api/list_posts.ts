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

let _client: ReturnType<typeof createClient> | undefined;
function getClient() {
  if (!_client) {
    _client = createClient({
      serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN ?? '',
      apiKey: process.env.MICROCMS_API_KEY ?? '',
    });
  }
  return _client;
}

const ENDPOINT_POST = 'post';
const ENDPOINT_PAGES = 'pages';
const ENDPOINT_TAG = 'tag';

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
  const result = await getClient().getList<Post>({
    endpoint: ENDPOINT_POST,
    queries: {
      orders: '-published_at',
      depth: 2,
      limit: 100,
    },
  });
  return result.contents.map((item) => post.parse(item));
};

export const fetchPostBySlug = async (slug: string) => {
  const result = await getClient().getList<Post>({
    endpoint: ENDPOINT_POST,
    queries: {
      filters: `slug[equals]${slug}`,
      depth: 2,
    },
  });
  const content = result.contents[0];
  if (!content) {
    return null;
  }
  return post.parse(content);
};

export const fetchPostsByTags = async (tags: string[], limit?: number) => {
  const result = await getClient().getList<Post>({
    endpoint: ENDPOINT_POST,
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
  const result = await getClient().getList<Page>({
    endpoint: ENDPOINT_PAGES,
    queries: {
      filters: `slug[equals]${slug}`,
      depth: 2,
    },
  });
  const content = result.contents[0];
  if (!content) {
    return null;
  }
  return page.parse(content);
};

export const fetchTagById = async (id: string) => {
  try {
    const result = await getClient().get<Tag>({
      endpoint: ENDPOINT_TAG,
      contentId: id,
    });
    return tag.parse(result);
    /* oxlint-disable-next-line no-unused-vars */
  } catch (_e) {
    return null;
  }
};

import type { Post } from '@/lib/api/list_posts';

/**
 * Post[] 型の引数を受け取り、RSSフィード文字列を返すプライベート関数
 */
export function generateRSSFeed(posts: Post[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog RSS Feed</title>
    <link>${process.env.NEXT_PUBLIC_SITE_URL}</link>
    <description>Latest blog posts</description>
    <language>ja</language>
    <atom:link href="${process.env.NEXT_PUBLIC_SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map(
        (post) => `
      <item>
        <title>${escapeXml(post.title)}</title>
        <link>${process.env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}</link>
        <guid>${post.id}</guid>
        <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
        <description>${escapeXml(extractExcerpt(post.content))}</description>
      </item>
    `,
      )
      .join('')}
  </channel>
</rss>`;
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[&<>'"]/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&apos;';
      default:
        return c;
    }
  });
}

function extractExcerpt(content: string, length = 200) {
  const text = content.replace(/<[^>]*>/g, '');
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

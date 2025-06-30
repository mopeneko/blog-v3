import { fetchPosts } from '@/lib/api/list_posts';
import { NextResponse } from 'next/server';
import { generateRSSFeed } from './rss';

export async function GET() {
  const posts = await fetchPosts();
  const rssFeed = generateRSSFeed(posts);

  return new NextResponse(rssFeed, {
    headers: {
      'Content-Type': 'application/rss+xml',
    },
  });
}

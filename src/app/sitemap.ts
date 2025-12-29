import type { MetadataRoute } from 'next';
import { fetchPosts } from '@/lib/api/list_posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await fetchPosts();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const postsUrls = posts.map((post) => ({
        url: `${baseUrl}/posts/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...postsUrls,
    ];
}

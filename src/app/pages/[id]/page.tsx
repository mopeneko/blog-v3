import { Page as PageComponent } from '@/components/Page';
import { fetchPageBySlug } from '@/lib/api/list_posts';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = (await params).id;
  const page = await fetchPageBySlug(id);
  const image = page.thumbnail
    ? {
        url: page.thumbnail.src,
        width: page.thumbnail.width,
        height: page.thumbnail.height,
      }
    : undefined;
  return {
    title: `${page.title} - もぺブログ`,
    openGraph: {
      type: 'website',
      url: `https://www.mope-blog.com/pages/${id}`,
      title: `${page.title} - もぺブログ`,
      siteName: 'もぺブログ',
      images: image,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nkyna_',
      creator: '@nkyna_',
      title: `${page.title} - もぺブログ`,
      images: image,
    },
  };
}

export default async function Page({
  params,
}: { params: Promise<{ id: string }> }) {
  const page = await fetchPageBySlug((await params).id);

  return (
    <PageComponent
      title={page.title}
      publishedAt={page.published_at}
      updatedAt={page.updated_at}
      content={page.content}
      thumbnail={page.thumbnail || undefined}
    />
  );
}

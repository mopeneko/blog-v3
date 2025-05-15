import { fetchPageBySlug } from '@/lib/api/list_posts';
import { Metadata } from 'next';
import NextImage from 'next/image';
import React from 'react';

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
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/pages/${id}`,
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

const formatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export default async function Page({
  params,
}: { params: Promise<{ id: string }> }) {
  const page = await fetchPageBySlug((await params).id);

  return (
    <article className="max-w-lg mx-auto px-2 flex flex-col gap-y-4">
      <h1 className="text-2xl font-bold">{page.title}</h1>

      <div className="grid grid-row-1 gap-y-2">
        <div className="text-xs text-right">
          <div>
            Published on {formatter.format(new Date(page.published_at))}
          </div>
          <div>Updated on {formatter.format(new Date(page.updated_at))}</div>
        </div>
      </div>

      {page.thumbnail && (
        <NextImage
          className="w-full rounded-lg"
          src={page.thumbnail.src}
          alt={page.thumbnail.altText}
          width={page.thumbnail.width}
          height={page.thumbnail.height}
          loading="eager"
        />
      )}

      <div
        className="prose w-full m-auto"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </article>
  );
}

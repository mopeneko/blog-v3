import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateRSSFeed } from './rss';
import type { Post } from '@/lib/api/list_posts';

const SITE_URL = 'https://example.com';

function parseXml(xml: string): Document {
  // Vitest環境でDOMParserがなければエラーになるので、その場合はテストをskip
  if (typeof DOMParser === 'undefined') {
    throw new Error('DOMParser is not available in this environment');
  }
  return new DOMParser().parseFromString(xml, 'application/xml');
}

describe('generateRSSFeed', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV, NEXT_PUBLIC_SITE_URL: SITE_URL };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('RSSフォーマットの基本構造を含む文字列を生成する', () => {
    const posts: Post[] = [];
    const rss = generateRSSFeed(posts);

    expect(rss).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(rss).toContain('<rss version="2.0"');
    expect(rss).toContain('<channel>');
    expect(rss).toContain('<title>Blog RSS Feed</title>');
    expect(rss).toContain(`<link>${SITE_URL}</link>`);
    expect(rss).toContain('<description>Latest blog posts</description>');
    expect(rss).toContain('<language>ja</language>');
    expect(rss).toContain(
      `<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
    );
  });

  it('生成されたRSSがXMLとしてパース可能である', () => {
    const posts: Post[] = [];
    const rss = generateRSSFeed(posts);
    expect(() => parseXml(rss)).not.toThrow();
    const doc = parseXml(rss);
    expect(doc.getElementsByTagName('rss').length).toBe(1);
    expect(doc.getElementsByTagName('channel').length).toBe(1);
  });

  it('投稿がない場合、<item>タグを含まない', () => {
    const posts: Post[] = [];
    const rss = generateRSSFeed(posts);
    expect(rss).not.toContain('<item>');
  });

  it('投稿が1つの場合、1つの<item>タグを含み内容が正しい', () => {
    const post: Post = {
      id: 'abc123',
      title: 'テスト投稿',
      slug: 'test-post',
      content: '<p>これはテスト投稿の本文です。</p>',
      tags: [],
      published_at: '2024-05-01T12:00:00Z',
      updated_at: '2024-05-01T12:00:00Z',
      thumbnail: undefined,
      createdAt: '2024-05-01T12:00:00Z',
      updatedAt: '2024-05-01T12:00:00Z',
      revisedAt: '2024-05-01T12:00:00Z',
      publishedAt: '2024-05-01T12:00:00Z',
      product: null,
    };
    const rss = generateRSSFeed([post]);
    const doc = parseXml(rss);
    const items = doc.getElementsByTagName('item');
    expect(items.length).toBe(1);

    const item = items[0];
    expect(item.getElementsByTagName('title')[0].textContent).toBe(
      'テスト投稿',
    );
    expect(item.getElementsByTagName('link')[0].textContent).toBe(
      `${SITE_URL}/posts/test-post`,
    );
    expect(item.getElementsByTagName('guid')[0].textContent).toBe('abc123');
    expect(item.getElementsByTagName('pubDate')[0].textContent).toBe(
      new Date('2024-05-01T12:00:00Z').toUTCString(),
    );
    // descriptionはHTMLタグ除去＋200文字切り詰め
    expect(item.getElementsByTagName('description')[0].textContent).toBe(
      'これはテスト投稿の本文です。',
    );
  });

  it('投稿が複数の場合、各投稿に対応する<item>タグが正しい順序で含まれる', () => {
    const posts: Post[] = [
      {
        id: 'id1',
        title: '最新記事',
        slug: 'latest',
        content: '最新記事の内容',
        tags: [],
        published_at: '2024-05-02T10:00:00Z',
        updated_at: '2024-05-02T10:00:00Z',
        thumbnail: undefined,
        createdAt: '2024-05-01T12:00:00Z',
        updatedAt: '2024-05-01T12:00:00Z',
        revisedAt: '2024-05-01T12:00:00Z',
        publishedAt: '2024-05-01T12:00:00Z',
        product: null,
      },
      {
        id: 'id2',
        title: '前の記事',
        slug: 'previous',
        content: '前の記事の内容',
        tags: [],
        published_at: '2024-05-01T09:00:00Z',
        updated_at: '2024-05-01T09:00:00Z',
        thumbnail: undefined,
        createdAt: '2024-05-01T12:00:00Z',
        updatedAt: '2024-05-01T12:00:00Z',
        revisedAt: '2024-05-01T12:00:00Z',
        publishedAt: '2024-05-01T12:00:00Z',
        product: null,
      },
    ];
    const rss = generateRSSFeed(posts);
    const doc = parseXml(rss);
    const items = doc.getElementsByTagName('item');
    expect(items.length).toBe(2);
    expect(items[0].getElementsByTagName('title')[0].textContent).toBe(
      '最新記事',
    );
    expect(items[1].getElementsByTagName('title')[0].textContent).toBe(
      '前の記事',
    );
  });

  it('titleやcontentにXML特殊文字が含まれる場合、正しくエスケープされる', () => {
    const post: Post = {
      id: 'id3',
      title: `特殊文字 & < > " ' テスト`,
      slug: 'escape-test',
      content: `<p>本文 & < > " ' テスト</p>`,
      tags: [],
      published_at: '2024-05-03T08:00:00Z',
      updated_at: '2024-05-03T08:00:00Z',
      thumbnail: undefined,
      createdAt: '2024-05-01T12:00:00Z',
      updatedAt: '2024-05-01T12:00:00Z',
      revisedAt: '2024-05-01T12:00:00Z',
      publishedAt: '2024-05-01T12:00:00Z',
      product: null,
    };
    const rss = generateRSSFeed([post]);
    // エスケープ後の文字列
    expect(rss).toContain('&');
    expect(rss).toContain('<');
    expect(rss).toContain('>');
    expect(rss).toContain('"');
    // <description> もエスケープされている
    const doc = parseXml(rss);
    const desc = doc
      .getElementsByTagName('item')[0]
      .getElementsByTagName('description')[0].textContent;
    expect(desc).toContain('&');
    expect(rss).toContain('<');
    expect(rss).toContain('>');
    expect(rss).toContain('"');
  });

  it('contentからextractExcerptで概要が抽出され、HTMLタグが除去され200文字で切り詰められる', () => {
    const longContent = '<p>' + 'あ'.repeat(300) + '</p>';
    const post: Post = {
      id: 'id4',
      title: '長文テスト',
      slug: 'long-content',
      content: longContent,
      tags: [],
      published_at: '2024-05-04T07:00:00Z',
      updated_at: '2024-05-04T07:00:00Z',
      thumbnail: undefined,
      createdAt: '2024-05-01T12:00:00Z',
      updatedAt: '2024-05-01T12:00:00Z',
      revisedAt: '2024-05-01T12:00:00Z',
      publishedAt: '2024-05-01T12:00:00Z',
      product: null,
    };
    const rss = generateRSSFeed([post]);
    const doc = parseXml(rss);
    const desc = doc
      .getElementsByTagName('item')[0]
      .getElementsByTagName('description')[0].textContent!;
    // 200文字＋... で終わる
    expect(desc).toBe('あ'.repeat(200) + '...');
    // HTMLタグが除去されている
    expect(desc).not.toContain('<');
    expect(desc).not.toContain('>');
  });
});

import { describe, expect, it } from 'vite-plus/test';
import { rehype } from 'rehype';
import { rehypeExtractBodyContents } from './extractBodyContents';

describe('rehypeExtractBodyContents', () => {
  it('完全なHTML文書から<body>内のコンテンツのみ出力される', async () => {
    const input =
      '<!doctype html><html><head><title>Test</title></head><body><h1>Hello</h1><p>World</p></body></html>';

    const result = String(await rehype().use(rehypeExtractBodyContents).process(input));

    expect(result).toBe('<h1>Hello</h1><p>World</p>');
  });

  it('doctype/html/head/bodyタグが結果に残らない', async () => {
    const input =
      '<!doctype html><html><head><meta charset="utf-8"></head><body><div>content</div></body></html>';

    const result = String(await rehype().use(rehypeExtractBodyContents).process(input));

    expect(result).not.toContain('<!doctype');
    expect(result).not.toContain('<html');
    expect(result).not.toContain('<head');
    expect(result).not.toContain('<body');
    expect(result).toBe('<div>content</div>');
  });

  it('bodyなしのフラグメントはそのまま保持される', async () => {
    const input = '<h1>Hello</h1><p>World</p>';

    const result = String(await rehype().use(rehypeExtractBodyContents).process(input));

    expect(result).toContain('<h1>Hello</h1>');
    expect(result).toContain('<p>World</p>');
  });
});

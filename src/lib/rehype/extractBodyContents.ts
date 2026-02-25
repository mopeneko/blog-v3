import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

export const rehypeExtractBodyContents = () => {
  return (tree: Root) => {
    let body: Element | undefined;

    visit(tree, 'element', (node) => {
      if (node.tagName === 'body' && !body) {
        body = node;
      }
    });

    if (body) {
      tree.children = body.children;
    }
  };
};

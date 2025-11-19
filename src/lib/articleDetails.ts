import type { Article } from './article';

export type ArticleDetail = Article & {
  updated: string;
  content: string;
};

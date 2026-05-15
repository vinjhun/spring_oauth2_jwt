export interface Page<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SessionUser {
  name: string;
  authorities: string[];
}

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  body: string;
  status: ArticleStatus;
  publishAt?: string;
  coverImageUrl?: string;
}

export interface PointBalance {
  memberId: string;
  balance: number;
}

export interface PointTransaction {
  id: number;
  memberId: string;
  delta: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface TextEntry {
  id: number;
  type: 'MESSAGE' | 'LABEL';
  textKey: string;
  locale: string;
  textValue: string;
}


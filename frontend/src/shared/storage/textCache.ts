import type { TextEntry } from '../types/api';

const CACHE_PREFIX = 'cms.text-cache.';

export function readTextCache(kind: 'messages' | 'labels', locale: string): TextEntry[] {
  const cacheKey = textCacheKey(kind, locale);
  const raw = localStorage.getItem(cacheKey);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as TextEntry[];
  } catch {
    localStorage.removeItem(cacheKey);
    return [];
  }
}

export function writeTextCache(kind: 'messages' | 'labels', locale: string, entries: TextEntry[]): void {
  localStorage.setItem(textCacheKey(kind, locale), JSON.stringify(entries));
}

function textCacheKey(kind: 'messages' | 'labels', locale: string): string {
  return `${CACHE_PREFIX}${kind}.${locale}`;
}

import { useEffect, useState } from 'react';
import { apiRequest } from '../../shared/api/http';
import { readTextCache, writeTextCache } from '../../shared/storage/textCache';
import type { Page, TextEntry } from '../../shared/types/api';

export function useTextEntries(kind: 'messages' | 'labels', locale = 'en') {
  const [entries, setEntries] = useState<TextEntry[]>(() => readTextCache(kind, locale));
  const [isLoading, setIsLoading] = useState(entries.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiRequest<Page<TextEntry>>(`/api/common/${kind}?locale=${encodeURIComponent(locale)}`)
      .then((page) => {
        if (mounted) {
          setEntries(page.content);
          writeTextCache(kind, locale, page.content);
          setIsLoading(false);
          setError(null);
        }
      })
      .catch((requestError: Error) => {
        if (mounted) {
          setIsLoading(false);
          setError(requestError.message);
        }
      });

    return () => {
      mounted = false;
    };
  }, [kind, locale]);

  return { entries, isLoading, error };
}


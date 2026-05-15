import { useEffect, useState } from 'react';
import { apiRequest } from '../../shared/api/http';
import type { Article, Page } from '../../shared/types/api';

interface ArticleState {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
}

export function useArticles(): ArticleState {
  const [state, setState] = useState<ArticleState>({
    articles: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    apiRequest<Page<Article>>('/api/cms/articles')
      .then((page) => {
        if (mounted) {
          setState({ articles: page.content, isLoading: false, error: null });
        }
      })
      .catch((error: Error) => {
        if (mounted) {
          setState({ articles: [], isLoading: false, error: error.message });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}


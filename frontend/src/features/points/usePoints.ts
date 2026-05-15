import { useEffect, useState } from 'react';
import { apiRequest } from '../../shared/api/http';
import type { Page, PointBalance, PointTransaction } from '../../shared/types/api';

interface PointsState {
  balance: PointBalance | null;
  transactions: PointTransaction[];
  isLoading: boolean;
  error: string | null;
}

export function usePoints(): PointsState {
  const [state, setState] = useState<PointsState>({
    balance: null,
    transactions: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    Promise.all([
      apiRequest<PointBalance>('/api/cms/me/points'),
      apiRequest<Page<PointTransaction>>('/api/cms/me/point-transactions'),
    ])
      .then(([balance, page]) => {
        if (mounted) {
          setState({ balance, transactions: page.content, isLoading: false, error: null });
        }
      })
      .catch((error: Error) => {
        if (mounted) {
          setState({ balance: null, transactions: [], isLoading: false, error: error.message });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}


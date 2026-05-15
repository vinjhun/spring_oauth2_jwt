import { useEffect, useState } from 'react';
import { apiRequest } from '../../shared/api/http';
import type { SessionUser } from '../../shared/types/api';

interface SessionResponse {
  authenticated: boolean;
  user?: SessionUser;
}

interface SessionState {
  user: SessionUser | null;
  isLoading: boolean;
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ user: null, isLoading: true });

  useEffect(() => {
    let mounted = true;
    apiRequest<SessionResponse>('/api/session')
      .then((session) => {
        if (mounted) {
          setState({ user: session.user ?? null, isLoading: false });
        }
      })
      .catch(() => {
        if (mounted) {
          setState({ user: null, isLoading: false });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

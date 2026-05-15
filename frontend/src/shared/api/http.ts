const JSON_CONTENT_TYPE = 'application/json';
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let csrf: { headerName: string; token: string } | null = null;

async function ensureCsrfToken(): Promise<{ headerName: string; token: string }> {
  if (csrf) {
    return csrf;
  }

  const response = await fetch('/api/csrf', { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Unable to load CSRF token: ${response.status}`);
  }

  csrf = (await response.json()) as { headerName: string; token: string };
  return csrf;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const hasBody = init.body !== undefined;
  const method = (init.method ?? 'GET').toUpperCase();

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', JSON_CONTENT_TYPE);
  }

  if (UNSAFE_METHODS.has(method)) {
    const csrfToken = await ensureCsrfToken();
    headers.set(csrfToken.headerName, csrfToken.token);
  }

  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (response.status === 401) {
    window.location.assign('/oauth2/authorization/cms-bff');
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

import { AlertCircle, LockKeyhole, LogIn, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../shared/components/Button';

interface LoginCsrfToken {
  parameterName: string;
  token: string;
}

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const [csrf, setCsrf] = useState<LoginCsrfToken | null>(null);
  const [csrfError, setCsrfError] = useState(false);
  const hasLoginError = searchParams.has('error');

  useEffect(() => {
    let ignore = false;

    fetch('/auth/csrf', { credentials: 'include' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load login token: ${response.status}`);
        }
        return response.json() as Promise<LoginCsrfToken>;
      })
      .then((token) => {
        if (!ignore) {
          setCsrf(token);
          setCsrfError(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setCsrfError(true);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4">
      <section className="w-full max-w-sm rounded-md3 border border-outline/30 bg-white p-6">
        <div>
          <h1 className="text-2xl font-semibold">CMS Console</h1>
          <p className="mt-2 text-sm text-outline">Sign in with your workspace account.</p>
        </div>

        {hasLoginError && (
          <div className="mt-5 flex gap-3 rounded-md3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>Check your email and password, then try again.</p>
          </div>
        )}

        {csrfError && (
          <div className="mt-5 flex gap-3 rounded-md3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>Login is temporarily unavailable. Confirm the authorization service is running.</p>
          </div>
        )}

        <form className="mt-6 space-y-4" action="/auth/login" method="post">
          {csrf && <input type="hidden" name={csrf.parameterName} value={csrf.token} />}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-onSurface" htmlFor="username">
              Email
            </label>
            <div className="flex min-h-11 items-center gap-3 rounded-md3 border border-outline/40 bg-white px-3 focus-within:border-primary">
              <Mail className="size-4 text-outline" aria-hidden="true" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none"
                id="username"
                name="username"
                type="email"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-onSurface" htmlFor="password">
                Password
              </label>
              <Link className="text-sm font-medium text-primary hover:underline" to="/forgot-password">
                Forgot password
              </Link>
            </div>
            <div className="flex min-h-11 items-center gap-3 rounded-md3 border border-outline/40 bg-white px-3 focus-within:border-primary">
              <LockKeyhole className="size-4 text-outline" aria-hidden="true" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <Button className="w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={!csrf}>
            <LogIn size={18} aria-hidden="true" />
            Sign in
          </Button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          <Link className="font-medium text-primary hover:underline" to="/register">
            Create account
          </Link>
          <Link className="font-medium text-primary hover:underline" to="/email-confirmation">
            Confirm email
          </Link>
        </div>
      </section>
    </main>
  );
}

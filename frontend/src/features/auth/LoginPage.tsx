import { AlertCircle, BookOpen, LockKeyhole, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../shared/components/Button';
import { ThemeToggle } from '../../shared/theme/ThemeToggle';

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
    <main className="grid min-h-screen bg-surface px-4 py-8 lg:grid-cols-[1fr_28rem] lg:px-8">
      <section className="hidden min-h-[calc(100vh-4rem)] flex-col justify-between rounded-lg3 bg-sidebar p-8 text-onSidebar lg:flex">
        <div>
          <div className="flex size-12 items-center justify-center rounded-md3 bg-onSidebar text-sidebar">
            <BookOpen size={24} aria-hidden="true" />
          </div>
          <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight">CMS Console</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-onSidebar/70">
            Manage Published Content, Point Activity, And Localized Copy From A Secure Browser Session.
          </p>
        </div>
        <div className="rounded-lg3 border border-onSidebar/10 bg-onSidebar/5 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck size={22} aria-hidden="true" />
            <p className="font-semibold">Server-Held OAuth2 Tokens</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-onSidebar/65">
            The Browser Receives The BFF Session Cookie While Access Tokens Remain Behind The Gateway.
          </p>
        </div>
      </section>

      <section className="grid place-items-center lg:px-8">
        <div className="w-full max-w-md rounded-lg3 border border-outline/15 bg-surfaceContainer p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Welcome Back</p>
              <h2 className="mt-2 text-3xl font-semibold">Sign In</h2>
              <p className="mt-2 text-sm leading-6 text-outline">Use Your Workspace Account To Open The CMS Console.</p>
            </div>
            <ThemeToggle />
        </div>

        {hasLoginError && (
          <div className="mt-5 flex gap-3 rounded-md3 border border-danger/25 bg-dangerContainer px-3 py-2 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>Check Your Email And Password, Then Try Again.</p>
          </div>
        )}

        {csrfError && (
          <div className="mt-5 flex gap-3 rounded-md3 border border-danger/25 bg-dangerContainer px-3 py-2 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>Login Is Temporarily Unavailable. Confirm The Authorization Service Is Running.</p>
          </div>
        )}

        <form className="mt-6 space-y-4" action="/auth/login" method="post">
          {csrf && <input type="hidden" name={csrf.parameterName} value={csrf.token} />}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-onSurface" htmlFor="username">
              Email
            </label>
            <div className="flex min-h-11 items-center gap-3 rounded-md3 border border-outline/25 bg-surface px-3 focus-within:border-primary">
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
                Forgot Password
              </Link>
            </div>
            <div className="flex min-h-11 items-center gap-3 rounded-md3 border border-outline/25 bg-surface px-3 focus-within:border-primary">
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

          <Button className="w-full" disabled={!csrf}>
            <LogIn size={18} aria-hidden="true" />
            Sign In
          </Button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          <Link className="font-medium text-primary hover:underline" to="/register">
            Create Account
          </Link>
          <Link className="font-medium text-primary hover:underline" to="/email-confirmation">
            Confirm Email
          </Link>
        </div>
        </div>
      </section>
    </main>
  );
}

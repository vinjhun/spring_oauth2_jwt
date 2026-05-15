import { ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/components/Button';
import { ThemeToggle } from '../../shared/theme/ThemeToggle';

type AccountAccessKind = 'forgot-password' | 'register' | 'email-confirmation';

interface AccountAccessPageProps {
  kind: AccountAccessKind;
}

const pageCopy: Record<AccountAccessKind, { title: string; body: string; action: string }> = {
  'forgot-password': {
    title: 'Reset password',
    body: 'Enter Your Account Email To Start Recovery.',
    action: 'Send Reset Link',
  },
  register: {
    title: 'Create Account',
    body: 'Enter Your Email To Begin Registration.',
    action: 'Continue',
  },
  'email-confirmation': {
    title: 'Confirm Email',
    body: 'Enter Your Email To Request A New Confirmation Message.',
    action: 'Send Confirmation',
  },
};

export function AccountAccessPage({ kind }: AccountAccessPageProps) {
  const copy = pageCopy[kind];

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4 py-8">
      <section className="w-full max-w-md rounded-lg3 border border-outline/15 bg-surfaceContainer p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-primary" to="/login">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back To Sign In
          </Link>
          <ThemeToggle />
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Account Access</p>
          <h1 className="mt-2 text-3xl font-semibold">{copy.title}</h1>
          <p className="mt-2 text-sm leading-6 text-outline">{copy.body}</p>
        </div>

        <form className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-onSurface" htmlFor="account-email">
              Email
            </label>
            <div className="flex min-h-11 items-center gap-3 rounded-md3 border border-outline/25 bg-surface px-3 focus-within:border-primary">
              <Mail className="size-4 text-outline" aria-hidden="true" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none"
                id="account-email"
                name="email"
                type="email"
                autoComplete="email"
              />
            </div>
          </div>

          <Button className="w-full" disabled>
            {copy.action}
          </Button>
        </form>
      </section>
    </main>
  );
}

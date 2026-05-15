import { ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/components/Button';

type AccountAccessKind = 'forgot-password' | 'register' | 'email-confirmation';

interface AccountAccessPageProps {
  kind: AccountAccessKind;
}

const pageCopy: Record<AccountAccessKind, { title: string; body: string; action: string }> = {
  'forgot-password': {
    title: 'Reset password',
    body: 'Enter your account email to start recovery.',
    action: 'Send reset link',
  },
  register: {
    title: 'Create account',
    body: 'Enter your email to begin registration.',
    action: 'Continue',
  },
  'email-confirmation': {
    title: 'Confirm email',
    body: 'Enter your email to request a new confirmation message.',
    action: 'Send confirmation',
  },
};

export function AccountAccessPage({ kind }: AccountAccessPageProps) {
  const copy = pageCopy[kind];

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4">
      <section className="w-full max-w-sm rounded-md3 border border-outline/30 bg-white p-6">
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-primary" to="/login">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to sign in
        </Link>

        <div className="mt-5">
          <h1 className="text-2xl font-semibold">{copy.title}</h1>
          <p className="mt-2 text-sm text-outline">{copy.body}</p>
        </div>

        <form className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-onSurface" htmlFor="account-email">
              Email
            </label>
            <div className="flex min-h-11 items-center gap-3 rounded-md3 border border-outline/40 bg-white px-3 focus-within:border-primary">
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

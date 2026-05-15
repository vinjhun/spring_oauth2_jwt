import { LogIn } from 'lucide-react';
import { Button } from '../../shared/components/Button';

export function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4">
      <section className="w-full max-w-sm rounded-md3 border border-outline/30 bg-white p-6">
        <h1 className="text-2xl font-semibold">CMS Console</h1>
        <p className="mt-2 text-sm text-outline">Sign in through the secure backend gateway.</p>
        <Button
          className="mt-6 w-full"
          onClick={() => window.location.assign('/oauth2/authorization/cms-bff')}
        >
          <LogIn size={18} aria-hidden="true" />
          Sign in
        </Button>
      </section>
    </main>
  );
}


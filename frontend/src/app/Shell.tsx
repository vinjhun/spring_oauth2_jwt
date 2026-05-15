import { BookOpen, CircleDollarSign, LogOut, MessageSquareText, Tag } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../shared/components/Button';
import { apiRequest } from '../shared/api/http';

interface ShellProps {
  userName: string;
}

const navItems = [
  { to: '/articles', label: 'Articles', icon: BookOpen },
  { to: '/points', label: 'Points', icon: CircleDollarSign },
  { to: '/messages', label: 'Messages', icon: MessageSquareText },
  { to: '/labels', label: 'Labels', icon: Tag },
];

export function Shell({ children, userName }: PropsWithChildren<ShellProps>) {
  const signOut = async () => {
    await apiRequest<void>('/api/logout', { method: 'POST' });
    window.location.assign('/');
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-outline/30 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-xl font-semibold">CMS Console</h1>
            <p className="text-sm text-outline">{userName}</p>
          </div>
          <nav className="flex flex-wrap gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex min-h-10 items-center gap-2 rounded-md3 px-3 text-sm font-medium ${
                    isActive ? 'bg-surfaceVariant text-onSurface' : 'text-outline hover:bg-surfaceVariant'
                  }`
                }
              >
                <item.icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div>
            <Button type="button" variant="text" onClick={signOut}>
              <LogOut size={18} aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

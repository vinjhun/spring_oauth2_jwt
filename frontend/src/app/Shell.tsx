import { BookOpen, CircleDollarSign, LogOut, MessageSquareText, Search, Tag } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../shared/components/Button';
import { apiRequest } from '../shared/api/http';
import { ThemeToggle } from '../shared/theme/ThemeToggle';

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
    <div className="min-h-screen bg-surface text-onSurface lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="hidden min-h-screen bg-sidebar px-5 py-6 text-onSidebar lg:flex lg:flex-col">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-onSidebar/60">Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold">CMS Console</h1>
          <p className="mt-2 truncate text-sm text-onSidebar/70">{userName}</p>
        </div>

        <nav className="mt-10 space-y-2" aria-label="Primary Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-md3 px-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-onSidebar text-sidebar shadow-sm'
                    : 'text-onSidebar/75 hover:bg-onSidebar/10 hover:text-onSidebar'
                }`
              }
            >
              <item.icon size={18} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-lg3 border border-onSidebar/10 bg-onSidebar/5 p-4">
          <p className="text-sm font-semibold">BFF Session</p>
          <p className="mt-1 text-xs leading-5 text-onSidebar/65">Browser Session Is Active. Tokens Stay Server-Side.</p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-outline/15 bg-surface/95 backdrop-blur">
          <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 lg:hidden">
                <h1 className="truncate text-xl font-semibold">CMS Console</h1>
                <p className="truncate text-sm text-outline">{userName}</p>
              </div>
              <div className="hidden min-w-0 items-center gap-3 lg:flex">
                <div className="flex size-10 items-center justify-center rounded-md3 bg-surfaceVariant text-primary">
                  <Search size={18} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Operations Console</p>
                  <p className="text-xs text-outline">Manage Content, Points, Messages, And Labels.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button type="button" variant="text" onClick={signOut}>
                  <LogOut size={18} aria-hidden="true" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Primary Navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md3 px-3 text-sm font-semibold ${
                      isActive ? 'bg-primary text-onPrimary' : 'bg-surfaceContainer text-outline hover:bg-surfaceVariant'
                    }`
                  }
                >
                  <item.icon size={18} aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
      </header>
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

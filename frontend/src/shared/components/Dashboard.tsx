import type { PropsWithChildren, ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  detail?: string;
  tone?: 'default' | 'success' | 'warning';
}

interface DataPanelProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ action, description, eyebrow = 'Workspace', title }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg3 border border-outline/15 bg-surfaceContainer px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold text-onSurface sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-outline">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function MetricCard({ detail, label, tone = 'default', value }: MetricCardProps) {
  const toneClass =
    tone === 'success'
      ? 'bg-successContainer text-success'
      : tone === 'warning'
        ? 'bg-warningContainer text-warning'
        : 'bg-surfaceVariant text-secondary';

  return (
    <div className="rounded-lg3 border border-outline/15 bg-surfaceContainer p-5 shadow-sm">
      <p className="text-sm font-medium text-outline">{label}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <p className="text-4xl font-semibold tracking-normal text-onSurface">{value}</p>
        {detail && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>{detail}</span>}
      </div>
    </div>
  );
}

export function DataPanel({ action, children, description, title }: PropsWithChildren<DataPanelProps>) {
  return (
    <section className="overflow-hidden rounded-lg3 border border-outline/15 bg-surfaceContainer shadow-sm">
      <div className="flex flex-col gap-3 border-b border-outline/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-onSurface">{title}</h3>
          {description && <p className="mt-1 text-sm text-outline">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

export function StateCard({ children }: PropsWithChildren) {
  return (
    <div className="rounded-lg3 border border-dashed border-outline/30 bg-surfaceContainer px-5 py-10 text-center text-sm text-outline">
      {children}
    </div>
  );
}

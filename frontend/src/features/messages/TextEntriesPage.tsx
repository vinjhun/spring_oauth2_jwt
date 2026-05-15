import { AlertCircle, Languages, MessageSquareText, Search, Tag } from 'lucide-react';
import { DataPanel, MetricCard, PageHeader, StateCard } from '../../shared/components/Dashboard';
import { toTitleCase } from '../../shared/utils/text';
import { useTextEntries } from './useTextEntries';

interface TextEntriesPageProps {
  kind: 'messages' | 'labels';
}

export function TextEntriesPage({ kind }: TextEntriesPageProps) {
  const { entries, isLoading, error } = useTextEntries(kind);
  const title = kind === 'messages' ? 'Messages' : 'Labels';
  const kindLabel = toTitleCase(kind);
  const description =
    kind === 'messages'
      ? 'Inspect Localized Message Copy Served By The Common Service.'
      : 'Review Localized Labels Used Across The CMS Experience.';
  const Icon = kind === 'messages' ? MessageSquareText : Tag;
  const locales = new Set(entries.map((entry) => entry.locale)).size;

  return (
    <section className="space-y-6">
      <PageHeader title={title} description={description} />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Entries" value={entries.length} detail={kindLabel} />
        <MetricCard label="Locales" value={locales} detail="Available" />
        <MetricCard label="Cache Status" value={error ? 'Cached' : 'Fresh'} detail={error ? 'Refresh Failed' : 'Synced'} tone={error ? 'warning' : 'success'} />
      </div>

      {isLoading && <StateCard>Loading {kindLabel}</StateCard>}
      {error && (
        <div className="flex gap-3 rounded-lg3 border border-warning/25 bg-warningContainer px-4 py-3 text-sm text-warning">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>Showing Cached {kindLabel}. Refresh Failed: {error}</p>
        </div>
      )}

      <DataPanel
        title={`${title} Catalog`}
        description="Localized Text Entries Currently Available To The Frontend."
        action={
          <label className="flex min-h-10 items-center gap-2 rounded-md3 border border-outline/20 bg-surface px-3 text-sm text-outline focus-within:border-primary">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">{`Search ${kindLabel}`}</span>
            <input className="w-40 bg-transparent outline-none" placeholder={`Search ${kindLabel}`} type="search" />
          </label>
        }
      >
        {entries.length === 0 ? (
          <div className="p-5">
            <StateCard>
              <Icon className="mx-auto mb-3 size-8 text-outline" aria-hidden="true" />
              No {kindLabel} Available.
            </StateCard>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-surface">
                <tr className="text-xs font-semibold uppercase tracking-wide text-outline">
                  <th className="px-5 py-3">Key</th>
                  <th className="px-5 py-3">Locale</th>
                  <th className="px-5 py-3">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/15">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface/70">
                    <td className="px-5 py-4 font-semibold text-onSurface">{entry.textKey}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-surfaceVariant px-3 py-1 text-xs font-semibold text-secondary">
                        <Languages size={14} aria-hidden="true" />
                        {entry.locale}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-outline">{entry.textValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataPanel>
    </section>
  );
}

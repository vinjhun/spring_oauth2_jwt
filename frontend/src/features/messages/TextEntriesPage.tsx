import { useTextEntries } from './useTextEntries';

interface TextEntriesPageProps {
  kind: 'messages' | 'labels';
}

export function TextEntriesPage({ kind }: TextEntriesPageProps) {
  const { entries, isLoading, error } = useTextEntries(kind);
  const title = kind === 'messages' ? 'Messages' : 'Labels';

  return (
    <section>
      <h2 className="text-2xl font-semibold">{title}</h2>
      {isLoading && <p className="mt-4 text-sm text-outline">Loading {kind}</p>}
      {error && <p className="mt-4 text-sm text-outline">Showing cached {kind}. Refresh failed: {error}</p>}
      <div className="mt-4 overflow-hidden rounded-md3 border border-outline/30 bg-white">
        {entries.length === 0 ? (
          <p className="p-4 text-sm text-outline">No {kind} available.</p>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-surfaceVariant">
              <tr>
                <th className="p-3 font-medium">Key</th>
                <th className="p-3 font-medium">Locale</th>
                <th className="p-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t border-outline/20">
                  <td className="p-3">{entry.textKey}</td>
                  <td className="p-3">{entry.locale}</td>
                  <td className="p-3">{entry.textValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}


import { FileText, Plus, Search } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { DataPanel, MetricCard, PageHeader, StateCard } from '../../shared/components/Dashboard';
import { toTitleCase } from '../../shared/utils/text';
import { useArticles } from './useArticles';

export function ArticlesPage() {
  const { articles, isLoading, error } = useArticles();
  const publishedCount = articles.filter((article) => article.status === 'PUBLISHED').length;
  const draftCount = articles.filter((article) => article.status === 'DRAFT').length;
  const statusClass = (status: string) => {
    if (status === 'PUBLISHED') {
      return 'bg-successContainer text-success';
    }
    if (status === 'DRAFT') {
      return 'bg-warningContainer text-warning';
    }
    return 'bg-surfaceVariant text-secondary';
  };

  if (isLoading) {
    return (
      <section aria-busy="true" className="space-y-6">
        <PageHeader title="Published Articles" description="Review Public Content And Publishing Status." />
        <StateCard>Loading Articles</StateCard>
      </section>
    );
  }

  if (error) {
    return (
      <section role="alert" className="space-y-6">
        <PageHeader title="Published Articles" description="Review Public Content And Publishing Status." />
        <StateCard>Unable To Load Articles: {error}</StateCard>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Published Articles"
        description="Review Public Content And Spot Drafts That Still Need Editorial Attention."
        action={
          <Button type="button">
            <Plus size={18} aria-hidden="true" />
            New article
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Articles" value={articles.length} detail="Library" />
        <MetricCard label="Published" value={publishedCount} detail="Live" tone="success" />
        <MetricCard label="Drafts" value={draftCount} detail="Needs Review" tone={draftCount > 0 ? 'warning' : 'default'} />
      </div>

      <DataPanel
        title="Article Library"
        description="A Compact View Of Content Available Through The CMS Resource Service."
        action={
          <label className="flex min-h-10 items-center gap-2 rounded-md3 border border-outline/20 bg-surface px-3 text-sm text-outline focus-within:border-primary">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search Articles</span>
            <input className="w-44 bg-transparent outline-none" placeholder="Search Articles" type="search" />
          </label>
        }
      >
        {articles.length === 0 ? (
          <div className="p-5">
            <StateCard>
              <FileText className="mx-auto mb-3 size-8 text-outline" aria-hidden="true" />
              No Published Articles Yet.
            </StateCard>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-surface">
                <tr className="text-xs font-semibold uppercase tracking-wide text-outline">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Publish Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/15">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-surface/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-onSurface">{article.title}</p>
                      <p className="mt-1 line-clamp-2 max-w-xl text-sm text-outline">
                        {article.summary || 'No Summary Provided.'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(article.status)}`}>
                        {toTitleCase(article.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-outline">{article.slug}</td>
                    <td className="px-5 py-4 text-outline">
                      {article.publishAt ? new Date(article.publishAt).toLocaleDateString() : 'Not Scheduled'}
                    </td>
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

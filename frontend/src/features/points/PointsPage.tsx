import { CircleDollarSign, TrendingUp } from 'lucide-react';
import { DataPanel, MetricCard, PageHeader, StateCard } from '../../shared/components/Dashboard';
import { usePoints } from './usePoints';

export function PointsPage() {
  const { balance, transactions, isLoading, error } = usePoints();
  const positiveTransactions = transactions.filter((transaction) => transaction.delta > 0).length;
  const totalEarned = transactions
    .filter((transaction) => transaction.delta > 0)
    .reduce((sum, transaction) => sum + transaction.delta, 0);

  if (isLoading) {
    return (
      <section aria-busy="true" className="space-y-6">
        <PageHeader title="Point Balance" description="Review Member Balance And Recent Point Movement." />
        <StateCard>Loading Points</StateCard>
      </section>
    );
  }

  if (error) {
    return (
      <section role="alert" className="space-y-6">
        <PageHeader title="Point Balance" description="Review Member Balance And Recent Point Movement." />
        <StateCard>Unable To Load Points: {error}</StateCard>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Point Balance"
        description="Track The Active Member Point Balance And Inspect The Latest Reward Adjustments."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Current Balance" value={(balance?.balance ?? 0).toLocaleString()} detail="Available" />
        <MetricCard label="Transactions" value={transactions.length} detail="Recent" />
        <MetricCard label="Earned Points" value={totalEarned.toLocaleString()} detail={`${positiveTransactions} Credits`} tone="success" />
      </div>

      <DataPanel title="Transaction History" description="Point Changes Relayed From The CMS Resource Service.">
        {transactions.length === 0 ? (
          <div className="p-5">
            <StateCard>
              <CircleDollarSign className="mx-auto mb-3 size-8 text-outline" aria-hidden="true" />
              No Point Transactions Yet.
            </StateCard>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead className="bg-surface">
                <tr className="text-xs font-semibold uppercase tracking-wide text-outline">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Delta</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/15">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-surface/70">
                    <td className="px-5 py-4 text-outline">{new Date(transaction.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          transaction.delta >= 0 ? 'bg-successContainer text-success' : 'bg-dangerContainer text-danger'
                        }`}
                      >
                        <TrendingUp size={14} aria-hidden="true" />
                        {transaction.delta > 0 ? '+' : ''}
                        {transaction.delta}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-onSurface">{transaction.reason}</td>
                    <td className="px-5 py-4 text-outline">{transaction.createdBy}</td>
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

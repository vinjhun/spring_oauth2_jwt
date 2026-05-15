import { usePoints } from './usePoints';

export function PointsPage() {
  const { balance, transactions, isLoading, error } = usePoints();

  if (isLoading) {
    return <section aria-busy="true">Loading points</section>;
  }

  if (error) {
    return <section role="alert">Unable to load points: {error}</section>;
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold">Point Balance</h2>
      <div className="mt-4 rounded-md3 border border-outline/30 bg-white p-5">
        <p className="text-sm text-outline">Current balance</p>
        <p className="mt-1 text-4xl font-semibold">{balance?.balance ?? 0}</p>
      </div>
      <div className="mt-6 overflow-hidden rounded-md3 border border-outline/30 bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-surfaceVariant">
            <tr>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Delta</th>
              <th className="p-3 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-t border-outline/20">
                <td className="p-3">{new Date(transaction.createdAt).toLocaleString()}</td>
                <td className="p-3">{transaction.delta}</td>
                <td className="p-3">{transaction.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


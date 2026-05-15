import { useArticles } from './useArticles';

export function ArticlesPage() {
  const { articles, isLoading, error } = useArticles();

  if (isLoading) {
    return <section aria-busy="true">Loading articles</section>;
  }

  if (error) {
    return <section role="alert">Unable to load articles: {error}</section>;
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold">Published Articles</h2>
      <div className="mt-4 overflow-hidden rounded-md3 border border-outline/30 bg-white">
        {articles.length === 0 ? (
          <p className="p-4 text-sm text-outline">No published articles yet.</p>
        ) : (
          <ul className="divide-y divide-outline/20">
            {articles.map((article) => (
              <li key={article.id} className="p-4">
                <h3 className="font-medium">{article.title}</h3>
                <p className="mt-1 text-sm text-outline">{article.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}


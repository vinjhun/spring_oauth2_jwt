import { Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './Shell';
import { ArticlesPage } from '../features/articles/ArticlesPage';
import { PointsPage } from '../features/points/PointsPage';
import { TextEntriesPage } from '../features/messages/TextEntriesPage';
import { AccountAccessPage } from '../features/auth/AccountAccessPage';
import { LoginPage } from '../features/auth/LoginPage';
import { useSession } from '../features/auth/useSession';

export function App() {
  const session = useSession();

  if (session.isLoading) {
    return <main className="grid min-h-screen place-items-center bg-surface text-onSurface">Loading workspace</main>;
  }

  if (!session.user) {
    return (
      <Routes>
        <Route path="/forgot-password" element={<AccountAccessPage kind="forgot-password" />} />
        <Route path="/register" element={<AccountAccessPage kind="register" />} />
        <Route path="/email-confirmation" element={<AccountAccessPage kind="email-confirmation" />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Shell userName={session.user.name}>
      <Routes>
        <Route path="/" element={<Navigate to="/articles" replace />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/points" element={<PointsPage />} />
        <Route path="/messages" element={<TextEntriesPage kind="messages" />} />
        <Route path="/labels" element={<TextEntriesPage kind="labels" />} />
      </Routes>
    </Shell>
  );
}

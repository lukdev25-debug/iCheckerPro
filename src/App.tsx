import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import CursorGlow from './components/CursorGlow';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <Loader2 className="h-8 w-8 animate-spin text-neon-500" />
      </div>
    );
  }

  if (user && showDashboard) {
    return <DashboardPage onBackToHome={() => setShowDashboard(false)} />;
  }

  if (user) {
    return <LandingPage onGetStarted={() => setShowDashboard(true)} isLoggedIn />;
  }

  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}

function App() {
  return (
    <AuthProvider>
      <CursorGlow />
      <AppContent />
    </AuthProvider>
  );
}

export default App;

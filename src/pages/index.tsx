import { useAuth } from '@/lib/auth-context-real';
import LandingPage from '@/components/LandingPage';
import AccountabilityApp from '@/components/AccountabilityApp';

export default function Home() {
  const { user, loading } = useAuth();

  // Show loading state while determining auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return <LandingPage />;
  }

  // Show main app for authenticated users
  return <AccountabilityApp />;
}

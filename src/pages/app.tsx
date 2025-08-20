import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { detectPlatform } from '@/lib/platform-detection';
import { useAuth } from '@/lib/auth-context-real';
import AccountabilityAppNative from '@/components/AccountabilityAppNative';

export default function AppPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Only check platform after component mounts (client-side)
    const platformInfo = detectPlatform();
    
    // If user is accessing via web browser (not installed app), redirect to download page
    if (platformInfo.isWebsite) {
      router.push('/download');
      return;
    }
  }, [router]);

  // Show loading state while checking auth and platform
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only render the app if user is authenticated and on the installed app
  if (!user) {
    router.push('/');
    return null;
  }

  return <AccountabilityAppNative />;
}

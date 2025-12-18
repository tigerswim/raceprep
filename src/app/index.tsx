import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { LandingPage } from '../components/LandingPage';

export default function Index() {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-mono"
        style={{ backgroundColor: '#0A0E14' }}
      >
        <span style={{ color: '#F8F8F2' }}>INITIALIZING...</span>
      </div>
    );
  }

  // Authenticated users go directly to dashboard
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // Show landing page for unauthenticated visitors
  return <LandingPage />;
}

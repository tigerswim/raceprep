import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="bg-slate-900 relative overflow-auto flex items-center justify-center" style={{ minHeight: '100dvh' }}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show auth modal if user is not authenticated
  if (!user) {
    return (
      <>
        {fallback || (
          <div className="bg-slate-900 relative overflow-auto" style={{ minHeight: '100dvh' }}>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-purple-900/20"></div>
              <div className="absolute top-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 shadow-xl text-center max-w-md">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
                <p className="text-white/70 mb-6">
                  Please sign in to access your RacePrep data and continue tracking your triathlon journey.
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
};
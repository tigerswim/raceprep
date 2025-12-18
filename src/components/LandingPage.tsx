import React, { useState } from 'react';
import { AuthModal } from './AuthModal';

export const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div
      className="min-h-screen font-mono"
      style={{ backgroundColor: '#0A0E14' }}
    >
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 md:py-12">
        {/* Header / Logo */}
        <header className="flex items-center gap-3 mb-16 md:mb-24">
          {/* Logo - Lightning bolt in outlined square */}
          <div
            className="w-12 h-12 flex items-center justify-center"
            style={{ border: '2px solid #FFD866' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="32"
              height="32"
            >
              <path
                d="M27 8L14 26h8l-2 14 13-18h-8l2-14z"
                fill="none"
                stroke="#FFD866"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h1
              className="text-xl font-bold tracking-widest"
              style={{ color: '#F8F8F2' }}
            >
              RACEPREP
            </h1>
            <p
              className="text-xs tracking-wider"
              style={{ color: '#B4B8C5' }}
            >
              PERFORMANCE ANALYTICS PLATFORM
            </p>
          </div>
        </header>

        {/* Hero Section - Two columns */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Column - Content */}
          <div className="flex-1 max-w-xl">
            <p
              className="text-xs font-semibold tracking-[0.2em] mb-4"
              style={{ color: '#FFD866' }}
            >
              TRIATHLON PERFORMANCE ANALYTICS
            </p>

            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
              style={{ color: '#F8F8F2' }}
            >
              One app to get triathlon race ready.
            </h2>

            <p
              className="text-base md:text-lg leading-relaxed mb-8"
              style={{ color: '#B4B8C5' }}
            >
              Track swim, bike, and run training. Sync with Strava. Plan every race detail. Measure what’s improving.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-4 font-bold text-sm tracking-wider transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: '#FFD866',
                color: '#0A0E14',
              }}
            >
              GET RACE READY
            </button>

            <p
              className="text-xs mt-4"
              style={{ color: '#B4B8C5' }}
            >
              Free to use. No credit card required.
            </p>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="flex-1 w-full max-w-2xl">
            <div
              className="relative"
              style={{
                transform: 'perspective(1000px) rotateY(-3deg)',
              }}
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 blur-3xl opacity-20"
                style={{ backgroundColor: '#FFD866' }}
              />

              {/* Dashboard preview image */}
              <img
                src="/images/dashboard-preview.png"
                alt="RacePrep Dashboard showing performance analytics"
                className="relative w-full h-auto"
                style={{
                  border: '2px solid #1C2127',
                  boxShadow: '0 25px 50px -12px rgba(255, 216, 102, 0.15)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signup"
      />
    </div>
  );
};

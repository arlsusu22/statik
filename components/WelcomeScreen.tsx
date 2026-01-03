
import React from 'react';
import { loginWithStrava } from '../services/stravaService';
import { ConnectWithStravaButton } from '../constants';

interface WelcomeScreenProps {
  onSkip: () => void;
  isLoading?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSkip, isLoading = false }) => {
  const handleConnect = () => {
    loginWithStrava();
  };

  // Loading state - show when authenticating
  if (isLoading) {
    return (
      <div className="relative h-screen w-full overflow-hidden flex flex-col select-none">
        {/* Dark checkerboard background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #1a1a1a 25%, transparent 25%), 
              linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #1a1a1a 75%), 
              linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            backgroundColor: '#111',
          }}
        />

        {/* Centered loading content */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6">
          {/* App name */}
          <span 
            className="text-white text-3xl tracking-wide mb-8"
            style={{ fontFamily: '"Londrina Shadow", cursive' }}
          >
            statik.
          </span>
          
          {/* Loading spinner */}
          <div className="relative w-12 h-12 mb-6">
            <div className="absolute inset-0 border-4 border-zinc-700 rounded-full" />
            <div 
              className="absolute inset-0 border-4 border-transparent border-t-[#CCFF00] rounded-full animate-spin"
              style={{ animationDuration: '0.8s' }}
            />
          </div>
          
          {/* Loading text */}
          <p className="text-zinc-400 text-sm">Connecting to Strava...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col select-none">
      
      {/* Dark checkerboard background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #1a1a1a 25%, transparent 25%), 
            linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #1a1a1a 75%), 
            linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          backgroundColor: '#111',
        }}
      />

      {/* App name / logo at top */}
      <div className="relative z-20 pt-12 text-center">
        <span 
          className="text-white text-2xl tracking-wide"
          style={{ fontFamily: '"Londrina Shadow", cursive' }}
        >
          statik.
        </span>
      </div>

      {/* Centered content */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center">
        
        {/* Main headline */}
        <h1 
          className="text-5xl text-white leading-tight mb-3"
          style={{ fontFamily: '"Londrina Outline", cursive' }}
        >
          Visualize your Effort
        </h1>
        
        {/* Subtext */}
        <p 
          className="text-zinc-400 text-lg mb-10"
          style={{ fontFamily: 'Lacquer, cursive' }}
        >
          Instant overlays for your stats
        </p>
        
        {/* Connect Strava button - Official Strava branding per brand guidelines */}
        <ConnectWithStravaButton onClick={handleConnect} />

        {/* Try demo - more prominent */}
        <button 
          onClick={onSkip}
          className="mt-5 text-white/80 hover:text-white text-sm font-medium transition-colors underline underline-offset-4 decoration-zinc-500 hover:decoration-white"
        >
          or try demo
        </button>
      </div>
    </div>
  );
};

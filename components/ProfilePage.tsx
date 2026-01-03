import React from 'react';

interface ProfilePageProps {
  onBack: () => void;
  onNavigateToSettings: () => void;
  userEmail?: string;
  isStravaConnected?: boolean;
  subscriptionStatus?: 'trial' | 'active' | 'expired' | 'none';
  trialDaysRemaining?: number;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onBack,
  onNavigateToSettings,
  userEmail = 'user@example.com',
  isStravaConnected = false,
  subscriptionStatus = 'trial',
  trialDaysRemaining = 7,
}) => {
  const getSubscriptionBadge = () => {
    switch (subscriptionStatus) {
      case 'trial':
        return (
          <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
            Trial • {trialDaysRemaining} days left
          </span>
        );
      case 'active':
        return (
          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
            Pro Active
          </span>
        );
      case 'expired':
        return (
          <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={onBack}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 
            className="text-xl"
            style={{ fontFamily: '"Londrina Shadow", cursive' }}
          >
            Profile
          </h1>
          <button
            onClick={onNavigateToSettings}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-4 py-6 space-y-6">
        {/* User Avatar & Email */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-3xl font-bold mb-3">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <p className="text-lg font-medium">{userEmail}</p>
          <div className="mt-2">{getSubscriptionBadge()}</div>
        </div>

        {/* Strava Connection */}
        <div className="bg-zinc-900 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FC4C02] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Strava</p>
                <p className="text-sm text-zinc-400">
                  {isStravaConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            {isStravaConnected ? (
              <button className="px-4 py-2 rounded-full text-sm font-medium bg-zinc-700 text-zinc-300">
                Disconnect
              </button>
            ) : (
              <img 
                src="/assets/btn_strava_connect_with_orange.png" 
                alt="Connect with Strava" 
                className="h-10 cursor-pointer hover:opacity-90 transition-opacity"
              />
            )}
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-zinc-900 rounded-xl p-4">
          <h3 className="font-medium mb-3">Subscription</h3>
          {subscriptionStatus === 'trial' && (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">
                You're on a 7-day free trial. Upgrade to Pro to keep creating beautiful overlays.
              </p>
              <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-full font-semibold">
                Upgrade to Pro - €14.99/year
              </button>
            </div>
          )}
          {subscriptionStatus === 'active' && (
            <div className="text-sm text-zinc-400">
              <p>Your Pro subscription is active.</p>
              <p className="mt-1">Renews on January 17, 2026</p>
            </div>
          )}
          {subscriptionStatus === 'expired' && (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">
                Your subscription has expired. Renew to continue creating overlays.
              </p>
              <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-full font-semibold">
                Renew - €14.99/year
              </button>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <button className="w-full text-red-400 hover:text-red-300 py-3 text-sm font-medium transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ActivityStats, OverlayPack } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ActivityFeed } from './components/ActivityFeed';
import { OverlayGallery } from './components/OverlayGallery';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { getToken, fetchActivities, fetchActivityDetails } from './services/stravaService';
import { App as CapacitorApp, URLOpenListenerEvent } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

// App Views - includes profile, settings, privacy
type AppView = 'WELCOME' | 'ACTIVITY_FEED' | 'OVERLAY_GALLERY' | 'PROFILE' | 'SETTINGS' | 'PRIVACY';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('WELCOME');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activities, setActivities] = useState<ActivityStats[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityStats | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Shared authentication handler
  const handleAuthCode = async (code: string) => {
    if (isAuthenticating) return; // Prevent double auth
    setIsAuthenticating(true);
    
    try {
      const tokenData = await getToken(code);
      if (tokenData.access_token) {
        setAccessToken(tokenData.access_token);
        const fetchedActivities = await fetchActivities(tokenData.access_token);
        setActivities(fetchedActivities);
        setIsAuthenticated(true);
        setView('ACTIVITY_FEED');
      }
    } catch (e) {
      console.error("Auth failed", e);
      alert("Failed to connect to Strava. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle deep link from Strava OAuth (mobile)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleAppUrlOpen = async (event: URLOpenListenerEvent) => {
      console.log('Deep link received:', event.url);
      
      // Close the browser that was opened for OAuth
      await Browser.close();
      
      // Parse the URL - could be statik://callback?code=xxx or https://appstatik.com/auth/callback?code=xxx
      const url = new URL(event.url);
      const code = url.searchParams.get('code');
      
      if (code) {
        handleAuthCode(code);
      }
    };

    CapacitorApp.addListener('appUrlOpen', handleAppUrlOpen);

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [isAuthenticating]);

  // Handle web OAuth callback (browser redirect)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Clear URL
      window.history.replaceState({}, document.title, window.location.pathname);
      handleAuthCode(code);
    }
  }, []);

  // Handle activity selection - fetch detailed data for better stats
  const handleActivitySelect = async (activity: ActivityStats) => {
    // Immediately show the gallery with basic data
    setSelectedActivity(activity);
    setView('OVERLAY_GALLERY');
    
    // If we have an access token, fetch detailed data for better stats (calories, etc.)
    if (accessToken) {
      const details = await fetchActivityDetails(accessToken, activity.id);
      if (details) {
        // Merge detailed data with existing activity
        const enrichedActivity: ActivityStats = {
          ...activity,
          calories: details.calories || activity.calories,
          heartRate: details.heartRate || activity.heartRate,
          maxHeartRate: details.maxHeartRate || activity.maxHeartRate,
        };
        setSelectedActivity(enrichedActivity);
        
        // Also update in the activities list for consistency
        setActivities(prev => prev.map(a => 
          a.id === activity.id ? enrichedActivity : a
        ));
      }
    }
  };

  // Navigate back from gallery to feed
  const handleBackToFeed = () => {
    setSelectedActivity(null);
    setView('ACTIVITY_FEED');
  };

  // Skip login for demo mode
  const handleSkipLogin = () => {
    setIsAuthenticated(false);
    setView('ACTIVITY_FEED');
  };

  // Navigation handlers for profile/settings/privacy
  const handleNavigateToProfile = () => setView('PROFILE');
  const handleNavigateToSettings = () => setView('SETTINGS');
  const handleNavigateToPrivacy = () => setView('PRIVACY');
  const handleBackFromProfile = () => setView('ACTIVITY_FEED');
  const handleBackFromSettings = () => setView('PROFILE');
  const handleBackFromPrivacy = () => setView('SETTINGS');

  // Render based on current view
  return (
    <div className="min-h-screen bg-zinc-950">
      {view === 'WELCOME' && (
        <WelcomeScreen onSkip={handleSkipLogin} isLoading={isAuthenticating} />
      )}
      
      {view === 'ACTIVITY_FEED' && (
        <ActivityFeed
          activities={activities}
          onSelectActivity={handleActivitySelect}
          onManualUpload={() => {}}
          onProfile={handleNavigateToProfile}
          onSettings={handleNavigateToSettings}
        />
      )}
      
      {view === 'OVERLAY_GALLERY' && selectedActivity && (
        <OverlayGallery
          activity={selectedActivity}
          onBack={handleBackToFeed}
        />
      )}

      {view === 'PROFILE' && (
        <ProfilePage
          onBack={handleBackFromProfile}
          onNavigateToSettings={handleNavigateToSettings}
          userEmail="user@example.com"
          isStravaConnected={isAuthenticated}
          subscriptionStatus="trial"
          trialDaysRemaining={7}
        />
      )}

      {view === 'SETTINGS' && (
        <SettingsPage
          onBack={handleBackFromSettings}
          onNavigateToPrivacy={handleNavigateToPrivacy}
        />
      )}

      {view === 'PRIVACY' && (
        <PrivacyPolicyPage
          onBack={handleBackFromPrivacy}
        />
      )}
    </div>
  );
};

export default App;

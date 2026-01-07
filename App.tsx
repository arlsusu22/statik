import React, { useState, useEffect } from 'react';
import { ActivityStats, OverlayPack, StravaAthlete } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ActivityFeed } from './components/ActivityFeed';
import { OverlayGallery } from './components/OverlayGallery';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { getToken, fetchActivities, fetchActivityDetails, fetchActivityChartData, getValidAccessToken, clearStoredTokens, clearActivitiesCache, getStoredTokens } from './services/stravaService';
import { initializeRevenueCat } from './services/revenueCatService';
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
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Loading state for initial auth check

  // Check for existing tokens on app startup
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        console.log('🔍 Checking for existing tokens...');
        const token = await getValidAccessToken();
        
        if (token) {
          console.log('✅ Found valid token, loading activities...');
          setAccessToken(token);
          setIsAuthenticated(true);
          
          // Load athlete profile from stored tokens
          const storedTokens = await getStoredTokens();
          if (storedTokens?.athlete) {
            setAthlete(storedTokens.athlete);
            console.log('👤 Loaded athlete profile:', storedTokens.athlete.firstname);
          }
          
          // Fetch activities with the existing token
          const fetchedActivities = await fetchActivities(token);
          setActivities(fetchedActivities);
          setView('ACTIVITY_FEED');
        } else {
          console.log('❌ No valid token found, showing welcome screen');
        }
      } catch (error) {
        console.error('Error checking existing auth:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, []);

  // Shared authentication handler
  const handleAuthCode = async (code: string, state?: string | null) => {
    if (isAuthenticating) return; // Prevent double auth
    setIsAuthenticating(true);
    
    try {
      const tokenData = await getToken(code, state);
      if (tokenData.access_token) {
        setAccessToken(tokenData.access_token);
        
        // Store athlete data if available
        if (tokenData.athlete) {
          setAthlete(tokenData.athlete);
          console.log('👤 Athlete profile received:', tokenData.athlete.firstname);
        }
        
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

  // Initialize RevenueCat on app start
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializeRevenueCat();
    }
  }, []);

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
      const state = url.searchParams.get('state');
      
      if (code) {
        handleAuthCode(code, state);
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
    const state = urlParams.get('state');

    if (code) {
      // Clear URL
      window.history.replaceState({}, document.title, window.location.pathname);
      handleAuthCode(code, state);
    }
  }, []);

  // Handle activity selection - fetch detailed data for better stats
  const handleActivitySelect = async (activity: ActivityStats) => {
    // Immediately show the gallery with basic data
    setSelectedActivity(activity);
    setView('OVERLAY_GALLERY');
    
    // If we have an access token, fetch detailed data for better stats (calories, etc.)
    if (accessToken) {
      const [details, chartData] = await Promise.all([
        fetchActivityDetails(accessToken, activity.id),
        fetchActivityChartData(accessToken, activity.id),
      ]);
      
      if (details || chartData) {
        // Merge detailed data with existing activity
        const enrichedActivity: ActivityStats = {
          ...activity,
          calories: details?.calories || activity.calories,
          heartRate: details?.heartRate || activity.heartRate,
          maxHeartRate: details?.maxHeartRate || activity.maxHeartRate,
          chartData: chartData || undefined,
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
  
  // Disconnect Strava - clear tokens and reset state
  const handleDisconnectStrava = async () => {
    try {
      console.log('🔌 Disconnecting Strava...');
      await clearStoredTokens();
      clearActivitiesCache();
      setAccessToken(null);
      setAthlete(null);
      setIsAuthenticated(false);
      setActivities([]);
      setSelectedActivity(null);
      setView('WELCOME');
      console.log('✅ Strava disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting Strava:', error);
    }
  };

  // Render based on current view
  // Show loading spinner while checking for existing auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

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
          athlete={athlete}
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
          onDisconnectStrava={handleDisconnectStrava}
          userEmail="user@example.com"
          isStravaConnected={isAuthenticated}
          subscriptionStatus="trial"
          trialDaysRemaining={7}
          athlete={athlete}
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

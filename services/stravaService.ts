import { ActivityStats, SplitData, ActivityChartData } from '../types';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { secureSet, secureGet, secureRemove } from './secureStorage';

// ---------------------------------------------------------------------------
// ⚠️ CONFIGURATION
// Client ID is safe to expose (needed for OAuth redirect)
// Client SECRET is now handled securely by Vercel backend
// ---------------------------------------------------------------------------
const CLIENT_ID = '186049'; 

// Backend API URL - uses Vercel serverless functions
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://app.appstatik.com/api' // Production: your Vercel domain
  : '/api'; // Development: proxied by Vite

// Redirect URI configuration
// Mobile uses deep link, web uses origin
const MOBILE_REDIRECT_URI = 'https://app.appstatik.com/auth/callback';
const WEB_REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin : '';
const REDIRECT_URI = Capacitor.isNativePlatform() ? MOBILE_REDIRECT_URI : WEB_REDIRECT_URI;

// Deep link scheme for the app
export const APP_SCHEME = 'statik'; 

// ---------------------------------------------------------------------------
// CACHING CONFIGURATION
// ---------------------------------------------------------------------------
const CACHE_KEYS = {
  ACTIVITIES: 'strava_activities_cache',
  ACTIVITIES_TIME: 'strava_activities_cache_time',
  ACTIVITY_DETAILS: 'strava_activity_details_cache',
  API_STATS: 'strava_api_stats',
};

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'strava_access_token',
  REFRESH_TOKEN: 'strava_refresh_token',
  EXPIRES_AT: 'strava_expires_at',
  ATHLETE: 'strava_athlete',
  OAUTH_STATE: 'strava_oauth_state', // CSRF protection
};

// Refresh token 5 minutes before expiry to avoid failed requests
const TOKEN_REFRESH_BUFFER = 5 * 60; // 5 minutes in seconds

// Cache duration in milliseconds (5 minutes for activities list)
const ACTIVITIES_CACHE_DURATION = 5 * 60 * 1000;
// Activity details cache (24 hours - detailed data rarely changes)
const DETAILS_CACHE_DURATION = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// API REQUEST LOGGING & TRACKING
// ---------------------------------------------------------------------------
interface ApiStats {
  dailyCalls: number;
  lastResetDate: string; // YYYY-MM-DD
  recentCalls: { endpoint: string; timestamp: number }[];
}

const getApiStats = (): ApiStats => {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(CACHE_KEYS.API_STATS);
  
  if (stored) {
    const stats: ApiStats = JSON.parse(stored);
    // Reset daily count if it's a new day
    if (stats.lastResetDate !== today) {
      return { dailyCalls: 0, lastResetDate: today, recentCalls: [] };
    }
    // Clean up calls older than 15 minutes for rate limit tracking
    stats.recentCalls = stats.recentCalls.filter(
      call => Date.now() - call.timestamp < 15 * 60 * 1000
    );
    return stats;
  }
  
  return { dailyCalls: 0, lastResetDate: today, recentCalls: [] };
};

const logApiCall = (endpoint: string) => {
  const stats = getApiStats();
  stats.dailyCalls += 1;
  stats.recentCalls.push({ endpoint, timestamp: Date.now() });
  localStorage.setItem(CACHE_KEYS.API_STATS, JSON.stringify(stats));
  
  // Log to console for debugging
  // Approved limits: 300 reads/15min (3000/day), 600 overall/15min (6000/day)
  console.log(`📡 Strava API: ${endpoint}`);
  console.log(`   └── Today: ${stats.dailyCalls}/3000 | Last 15min: ${stats.recentCalls.length}/300`);
  
  // Warn if approaching limits (80% threshold)
  if (stats.recentCalls.length >= 240) {
    console.warn('⚠️ Approaching 15-minute rate limit!');
  }
  if (stats.dailyCalls >= 2400) {
    console.warn('⚠️ Approaching daily rate limit!');
  }
};

// Export for monitoring (can be called from console or UI)
// Approved limits: Read 300/15min (3000/day), Overall 600/15min (6000/day)
export const getApiUsageStats = () => {
  const stats = getApiStats();
  return {
    dailyCalls: stats.dailyCalls,
    dailyLimit: 3000,
    dailyRemaining: 3000 - stats.dailyCalls,
    fifteenMinCalls: stats.recentCalls.length,
    fifteenMinLimit: 300,
    fifteenMinRemaining: 300 - stats.recentCalls.length,
  };
};

// ---------------------------------------------------------------------------
// CACHE HELPERS
// ---------------------------------------------------------------------------
const getCachedActivities = (): ActivityStats[] | null => {
  const cached = localStorage.getItem(CACHE_KEYS.ACTIVITIES);
  const cacheTime = localStorage.getItem(CACHE_KEYS.ACTIVITIES_TIME);
  
  if (cached && cacheTime) {
    const age = Date.now() - Number(cacheTime);
    if (age < ACTIVITIES_CACHE_DURATION) {
      console.log(`✅ Using cached activities (${Math.round(age / 1000)}s old)`);
      return JSON.parse(cached);
    }
    console.log(`⏰ Activities cache expired (${Math.round(age / 1000)}s old)`);
  }
  return null;
};

const cacheActivities = (activities: ActivityStats[]) => {
  localStorage.setItem(CACHE_KEYS.ACTIVITIES, JSON.stringify(activities));
  localStorage.setItem(CACHE_KEYS.ACTIVITIES_TIME, Date.now().toString());
  console.log(`💾 Cached ${activities.length} activities`);
};

const getCachedActivityDetails = (activityId: string): Partial<ActivityStats> | null => {
  const cached = localStorage.getItem(CACHE_KEYS.ACTIVITY_DETAILS);
  if (cached) {
    const allDetails: Record<string, { data: Partial<ActivityStats>; timestamp: number }> = JSON.parse(cached);
    const entry = allDetails[activityId];
    if (entry && Date.now() - entry.timestamp < DETAILS_CACHE_DURATION) {
      console.log(`✅ Using cached details for activity ${activityId}`);
      return entry.data;
    }
  }
  return null;
};

const cacheActivityDetails = (activityId: string, details: Partial<ActivityStats>) => {
  const cached = localStorage.getItem(CACHE_KEYS.ACTIVITY_DETAILS);
  const allDetails: Record<string, { data: Partial<ActivityStats>; timestamp: number }> = 
    cached ? JSON.parse(cached) : {};
  
  allDetails[activityId] = { data: details, timestamp: Date.now() };
  localStorage.setItem(CACHE_KEYS.ACTIVITY_DETAILS, JSON.stringify(allDetails));
  console.log(`💾 Cached details for activity ${activityId}`);
};

// Force refresh - clears cache (useful for pull-to-refresh)
export const clearActivitiesCache = () => {
  localStorage.removeItem(CACHE_KEYS.ACTIVITIES);
  localStorage.removeItem(CACHE_KEYS.ACTIVITIES_TIME);
  console.log('🗑️ Activities cache cleared');
};

// ---------------------------------------------------------------------------
// TOKEN MANAGEMENT
// ---------------------------------------------------------------------------

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  athlete?: any;
}

// Save tokens after OAuth or refresh (uses secure storage on native)
export const saveTokens = async (data: {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: any;
}): Promise<void> => {
  await secureSet(TOKEN_KEYS.ACCESS_TOKEN, data.access_token);
  await secureSet(TOKEN_KEYS.REFRESH_TOKEN, data.refresh_token);
  await secureSet(TOKEN_KEYS.EXPIRES_AT, data.expires_at.toString());
  if (data.athlete) {
    await secureSet(TOKEN_KEYS.ATHLETE, JSON.stringify(data.athlete));
  }
  console.log(`🔐 Tokens saved securely, expires at: ${new Date(data.expires_at * 1000).toLocaleString()}`);
};

// Get stored tokens (from secure storage on native)
export const getStoredTokens = async (): Promise<StoredTokens | null> => {
  const accessToken = await secureGet(TOKEN_KEYS.ACCESS_TOKEN);
  const refreshToken = await secureGet(TOKEN_KEYS.REFRESH_TOKEN);
  const expiresAt = await secureGet(TOKEN_KEYS.EXPIRES_AT);
  
  if (!accessToken || !refreshToken || !expiresAt) {
    return null;
  }
  
  const athleteStr = await secureGet(TOKEN_KEYS.ATHLETE);
  return {
    accessToken,
    refreshToken,
    expiresAt: Number(expiresAt),
    athlete: athleteStr ? JSON.parse(athleteStr) : undefined,
  };
};

// Check if token is expired (with buffer)
export const isTokenExpired = (expiresAt: number): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return now >= (expiresAt - TOKEN_REFRESH_BUFFER);
};

// Refresh the access token using refresh token
export const refreshAccessToken = async (refreshToken: string): Promise<StoredTokens> => {
  logApiCall('POST /api/strava/refresh (via backend)');
  
  const response = await fetch(`${API_BASE_URL}/strava/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Token refresh failed:', error);
    throw new Error(error.error || 'Failed to refresh token');
  }
  
  const data = await response.json();
  
  // Save the new tokens
  await saveTokens(data);
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  };
};

// Get a valid access token (auto-refresh if expired)
export const getValidAccessToken = async (): Promise<string | null> => {
  const tokens = await getStoredTokens();
  
  if (!tokens) {
    console.log('❌ No stored tokens found');
    return null;
  }
  
  // Check if token is expired or about to expire
  if (isTokenExpired(tokens.expiresAt)) {
    console.log('🔄 Token expired, refreshing...');
    try {
      const newTokens = await refreshAccessToken(tokens.refreshToken);
      return newTokens.accessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Clear invalid tokens
      await clearStoredTokens();
      return null;
    }
  }
  
  const timeLeft = tokens.expiresAt - Math.floor(Date.now() / 1000);
  console.log(`✅ Token valid for ${Math.round(timeLeft / 60)} more minutes`);
  return tokens.accessToken;
};

// Clear all stored tokens (logout) - removes from secure storage
export const clearStoredTokens = async (): Promise<void> => {
  await secureRemove(TOKEN_KEYS.ACCESS_TOKEN);
  await secureRemove(TOKEN_KEYS.REFRESH_TOKEN);
  await secureRemove(TOKEN_KEYS.EXPIRES_AT);
  await secureRemove(TOKEN_KEYS.ATHLETE);
  console.log('🚪 Tokens cleared securely (logged out)');
};

// Check if user is logged in (async due to secure storage)
export const isLoggedIn = async (): Promise<boolean> => {
  const tokens = await getStoredTokens();
  return tokens !== null;
};

// ---------------------------------------------------------------------------
// STRAVA API FUNCTIONS
// ---------------------------------------------------------------------------

export const loginWithStrava = async () => {
  const scope = 'activity:read_all';
  
  // Generate random state for CSRF protection
  const state = crypto.randomUUID();
  await secureSet(TOKEN_KEYS.OAUTH_STATE, state);
  
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&approval_prompt=force&scope=${scope}&state=${state}`;
  
  if (Capacitor.isNativePlatform()) {
    // Open Strava auth in in-app browser
    // The browser will be closed when we receive the deep link callback
    await Browser.open({ url: authUrl });
  } else {
    // Web fallback
    window.location.href = authUrl;
  }
};

// Verify OAuth state parameter (CSRF protection)
export const verifyOAuthState = async (receivedState: string | null): Promise<boolean> => {
  if (!receivedState) {
    console.warn('⚠️ No state parameter received in OAuth callback');
    return false;
  }
  
  const storedState = await secureGet(TOKEN_KEYS.OAUTH_STATE);
  
  // Clear stored state after checking (one-time use)
  await secureRemove(TOKEN_KEYS.OAUTH_STATE);
  
  if (!storedState) {
    console.warn('⚠️ No stored state found for OAuth verification');
    return false;
  }
  
  if (storedState !== receivedState) {
    console.error('❌ OAuth state mismatch - possible CSRF attack');
    return false;
  }
  
  console.log('✅ OAuth state verified successfully');
  return true;
};

export const getToken = async (code: string, state?: string | null) => {
  // Verify state parameter if provided (CSRF protection)
  if (state !== undefined) {
    const isValid = await verifyOAuthState(state);
    if (!isValid) {
      throw new Error('OAuth state verification failed - possible CSRF attack');
    }
  }
  
  logApiCall('POST /api/strava/token (via backend)');
  
  // Call our secure backend instead of Strava directly
  // The backend has the client_secret stored securely
  const response = await fetch(`${API_BASE_URL}/strava/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Token exchange failed:', error);
    throw new Error(error.error || 'Failed to exchange token');
  }
  
  const tokenData = await response.json();
  
  // Securely save tokens after successful OAuth
  await saveTokens(tokenData);
  
  return tokenData;
};

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  return `${m}m ${s}s`;
};

const calculatePace = (speedMetersPerSec: number, type: string): string => {
  if (speedMetersPerSec === 0) return '-';
  
  if (type === 'Ride' || type === 'VirtualRide' || type === 'E-BikeRide') {
    // Speed (km/h)
    const kph = speedMetersPerSec * 3.6;
    return `${kph.toFixed(1)} km/h`;
  } else {
    // Pace (min/km)
    const secondsPerKm = 1000 / speedMetersPerSec;
    const m = Math.floor(secondsPerKm / 60);
    const s = Math.floor(secondsPerKm % 60);
    return `${m}:${s.toString().padStart(2, '0')} /km`;
  }
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  // Example: "Today, 6:45 AM" or "Oct 24, 5:30 PM"
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric' 
  }).format(date);
};

// Fetch detailed activity data (includes calories, more stats)
export const fetchActivityDetails = async (accessToken: string, activityId: string): Promise<Partial<ActivityStats> | null> => {
  // Check cache first
  const cached = getCachedActivityDetails(activityId);
  if (cached) {
    return cached;
  }
  
  try {
    logApiCall(`GET /activities/${activityId}`);
    const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!response.ok) return null;
    
    const activity = await response.json();
    console.log('📊 Detailed activity data:', {
      calories: activity.calories,
      kilojoules: activity.kilojoules,
      average_heartrate: activity.average_heartrate,
      max_heartrate: activity.max_heartrate,
    });
    
    // Return the additional details
    let caloriesValue: string | undefined = undefined;
    if (activity.calories) {
      caloriesValue = `${Math.round(activity.calories)} kcal`;
    } else if (activity.kilojoules) {
      caloriesValue = `${Math.round(activity.kilojoules)} kcal`;
    }
    
    const details = {
      calories: caloriesValue,
      heartRate: activity.average_heartrate ? `${Math.round(activity.average_heartrate)} bpm` : undefined,
      maxHeartRate: activity.max_heartrate ? `${Math.round(activity.max_heartrate)} bpm` : undefined,
    };
    
    // Cache the result
    cacheActivityDetails(activityId, details);
    
    return details;
  } catch (error) {
    console.error('Error fetching activity details:', error);
    return null;
  }
};

// Fetch chart data for an activity (splits, zones, etc.)
export const fetchActivityChartData = async (accessToken: string, activityId: string): Promise<ActivityChartData | null> => {
  // Check cache first
  const cacheKey = `chart_${activityId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    // Cache for 24 hours
    if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
      console.log('📊 Using cached chart data for activity', activityId);
      return parsed.data;
    }
  }
  
  try {
    logApiCall(`GET /activities/${activityId} (chart data)`);
    const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!response.ok) return null;
    
    const activity = await response.json();
    
    // Extract splits data (metric by default)
    const splitsRaw = activity.splits_metric || activity.splits_standard || [];
    const splits: SplitData[] = splitsRaw.map((s: any) => ({
      split: s.split,
      distance: s.distance,
      elapsed_time: s.elapsed_time,
      moving_time: s.moving_time,
      average_speed: s.average_speed,
      elevation_difference: s.elevation_difference || 0,
      pace_zone: s.pace_zone || 0,
    }));
    
    const chartData: ActivityChartData = {
      splits: splits.length > 0 ? splits : undefined,
      hasHeartRate: activity.has_heartrate || false,
      hasElevation: activity.total_elevation_gain > 0,
      hasPower: activity.device_watts || false,
      // Elevation data
      elevationGain: activity.total_elevation_gain || 0,
      elevLow: activity.elev_low || 0,
      elevHigh: activity.elev_high || 0,
      averageSpeed: activity.average_speed || 0,
    };
    
    console.log('📊 Chart data for activity:', {
      activityId,
      splitsCount: splits.length,
      hasHeartRate: chartData.hasHeartRate,
      hasElevation: chartData.hasElevation,
    });
    
    // Cache the result
    localStorage.setItem(cacheKey, JSON.stringify({
      data: chartData,
      timestamp: Date.now(),
    }));
    
    return chartData;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return null;
  }
};

// Map Strava activity types to our internal types
const mapStravaType = (stravaType: string): 'run' | 'bike' | 'hike' | 'swim' | 'workout' => {
  const type = stravaType?.toLowerCase() || '';
  
  // Cycling types
  if (type.includes('ride') || type.includes('cycling') || type.includes('bike')) {
    return 'bike';
  }
  
  // Running types
  if (type === 'run' || type === 'virtualrun' || type === 'trailrun') {
    return 'run';
  }
  
  // Hiking/Walking
  if (type === 'hike' || type === 'walk') {
    return 'hike';
  }
  
  // Swimming
  if (type.includes('swim')) {
    return 'swim';
  }
  
  // Workout types (weight training, HIIT, crossfit, yoga, etc.)
  if (
    type.includes('weight') || 
    type.includes('workout') || 
    type.includes('crossfit') ||
    type.includes('hiit') ||
    type.includes('yoga') ||
    type.includes('pilates') ||
    type.includes('elliptical') ||
    type.includes('stairstepper') ||
    type.includes('rowing') ||
    type === 'strength training' ||
    type === 'training'
  ) {
    return 'workout';
  }
  
  // Default to run for unknown types
  return 'run';
};

export const fetchActivities = async (accessToken: string, forceRefresh = false): Promise<ActivityStats[]> => {
  // Check cache first (unless force refresh requested)
  if (!forceRefresh) {
    const cached = getCachedActivities();
    if (cached) {
      return cached;
    }
  }
  
  logApiCall('GET /athlete/activities');
  const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=30', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  const data = await response.json();
  
  if (!Array.isArray(data)) {
    console.error('Strava API Error:', data);
    return [];
  }

  console.log('🏃 Fetched', data.length, 'activities from Strava');

  const activities = data.map((activity: any, index: number) => {
    const hasPolyline = activity.map?.summary_polyline ? true : false;
    
    // Debug: Log all available fields for this activity
    if (index === 0) {
      console.log('📊 Sample activity fields:', Object.keys(activity));
      console.log('📊 Sample activity data:', {
        type: activity.type,
        calories: activity.calories,
        kilojoules: activity.kilojoules,
        average_heartrate: activity.average_heartrate,
        max_heartrate: activity.max_heartrate,
        suffer_score: activity.suffer_score,
        has_heartrate: activity.has_heartrate,
      });
    }
    
    console.log(`Activity ${index + 1}: ${activity.name} - Type: ${activity.type} - Polyline: ${hasPolyline ? '✓' : '✗ (null)'}`);
    
    // Strava uses kilojoules for cycling, calories for other activities
    // Also check for direct calories field
    let caloriesValue: string | undefined = undefined;
    if (activity.calories) {
      caloriesValue = `${Math.round(activity.calories)} kcal`;
    } else if (activity.kilojoules) {
      // Convert kJ to kcal (1 kJ ≈ 0.239 kcal, but Strava shows kJ as approx kcal for cycling)
      caloriesValue = `${Math.round(activity.kilojoules)} kcal`;
    }
    
    return {
      id: activity.id.toString(),
      title: activity.name,
      // Convert meters to km
      distance: `${(activity.distance / 1000).toFixed(2)} km`,
      time: formatTime(activity.moving_time),
      elevation: `${Math.round(activity.total_elevation_gain)} m`,
      pace: calculatePace(activity.average_speed, activity.type),
      calories: caloriesValue,
      heartRate: activity.average_heartrate ? `${Math.round(activity.average_heartrate)} bpm` : undefined,
      maxHeartRate: activity.max_heartrate ? `${Math.round(activity.max_heartrate)} bpm` : undefined,
      type: mapStravaType(activity.type),
      date: formatDate(activity.start_date),
      mapUrl: activity.map?.summary_polyline,
      // Use summary_polyline from list endpoint (not detailed polyline)
      polyline: activity.map?.summary_polyline || undefined
    };
  });
  
  // Cache the results
  cacheActivities(activities);
  
  return activities;
};

import { ActivityStats } from '../types';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

// ---------------------------------------------------------------------------
// ⚠️ CONFIGURATION
// Client ID is safe to expose (needed for OAuth redirect)
// Client SECRET is now handled securely by Vercel backend
// ---------------------------------------------------------------------------
const CLIENT_ID = '186049'; 

// Backend API URL - uses Vercel serverless functions
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://appstatik.com/api' // Production: your Vercel domain
  : '/api'; // Development: proxied by Vite

// Redirect URI configuration
// Mobile uses deep link, web uses origin
const MOBILE_REDIRECT_URI = 'https://appstatik.com/auth/callback';
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
  console.log(`📡 Strava API: ${endpoint}`);
  console.log(`   └── Today: ${stats.dailyCalls}/1000 | Last 15min: ${stats.recentCalls.length}/100`);
  
  // Warn if approaching limits
  if (stats.recentCalls.length >= 80) {
    console.warn('⚠️ Approaching 15-minute rate limit!');
  }
  if (stats.dailyCalls >= 800) {
    console.warn('⚠️ Approaching daily rate limit!');
  }
};

// Export for monitoring (can be called from console or UI)
export const getApiUsageStats = () => {
  const stats = getApiStats();
  return {
    dailyCalls: stats.dailyCalls,
    dailyLimit: 1000,
    dailyRemaining: 1000 - stats.dailyCalls,
    fifteenMinCalls: stats.recentCalls.length,
    fifteenMinLimit: 100,
    fifteenMinRemaining: 100 - stats.recentCalls.length,
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
// STRAVA API FUNCTIONS
// ---------------------------------------------------------------------------

export const loginWithStrava = async () => {
  const scope = 'activity:read_all';
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&approval_prompt=force&scope=${scope}`;
  
  if (Capacitor.isNativePlatform()) {
    // Open Strava auth in in-app browser
    // The browser will be closed when we receive the deep link callback
    await Browser.open({ url: authUrl });
  } else {
    // Web fallback
    window.location.href = authUrl;
  }
};

export const getToken = async (code: string) => {
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
  
  return response.json();
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

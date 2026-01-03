
import React, { useState, useMemo } from 'react';
import { ActivityStats } from '../types';
import { StravaIcon, RefreshIcon, ViewOnStravaLink } from '../constants';
import { getStatsForActivityType } from '../utils/activityStats';

interface ActivityFeedProps {
  activities: ActivityStats[];
  onSelectActivity: (activity: ActivityStats) => void;
  onManualUpload: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
}

// Activity type colors - vibrant but not harsh
const ACTIVITY_COLORS: Record<string, string> = {
  run: '#CCFF00',      // Neon yellow-green (signature color)
  bike: '#00D4FF',     // Cyan blue
  ride: '#00D4FF',     // Alias for bike
  hike: '#FF9F43',     // Warm orange
  walk: '#FF9F43',     // Same as hike
  swim: '#54A0FF',     // Pool blue
  workout: '#FF6B6B',  // Coral red
  default: '#A0A0A0',  // Neutral gray
};

// Simple polyline decoder (Google's encoded polyline algorithm)
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

// Mini route preview component
const RoutePreview: React.FC<{ encodedPolyline?: string; color?: string }> = ({ encodedPolyline, color = '#CCFF00' }) => {
  const pathData = useMemo(() => {
    if (!encodedPolyline) return null;
    
    try {
      const decoded = decodePolyline(encodedPolyline);
      if (decoded.length < 2) return null;
      
      // Get bounds
      const lats = decoded.map(p => p[0]);
      const lngs = decoded.map(p => p[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      // Add padding
      const padding = 0.15;
      const latRange = maxLat - minLat || 0.001;
      const lngRange = maxLng - minLng || 0.001;
      
      // Normalize to SVG coordinates (0-100)
      const points = decoded.map(([lat, lng]) => {
        const x = padding * 100 + ((lng - minLng) / lngRange) * (100 - 2 * padding * 100);
        const y = padding * 100 + ((maxLat - lat) / latRange) * (100 - 2 * padding * 100);
        return `${x},${y}`;
      });
      
      return `M ${points.join(' L ')}`;
    } catch {
      return null;
    }
  }, [encodedPolyline]);
  
  if (!pathData) {
    // Fallback animated placeholder
    return (
      <div className="w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-20">
          <path
            d="M20 80 Q30 30, 50 50 T80 20"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>
      </div>
    );
  }
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Glow effect */}
      <defs>
        <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Route path */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#routeGlow)"
        opacity="0.9"
      />
      {/* Start dot */}
      <circle
        cx={pathData.split(' ')[1].split(',')[0]}
        cy={pathData.split(' ')[1].split(',')[1]}
        r="3"
        fill={color}
      />
    </svg>
  );
};

// Fallback Mock Data if no activities are fetched (for dev/demo)

// Neighborhood run - city blocks with turns (irregular loop)
const NEIGHBORHOOD_POLYLINE = 'o{ywF~hlbMgE?gEgEgEoKgEoKfEoKnKgEnKfEfEnKfEnKgEnKgEfEgE?';

// Trail/Ride - winding path with natural curves
const TRAIL_POLYLINE = '_w_xFvwibMi@o@g@g@c@_@[WSQII@EP?^Dl@F~@LnAL~ANlBP|BNjCNvCLbDHjDFpD@vDAvDGxDMtDUrD[hDc@bDk@vCs@jCy@|BcAlBiA~AqAnAwA|@_Bn@cB\\iBNmBBqBIsBSuB[wBc@wBg@wBk@uBi@qBg@oBc@kB[gBSaBGyA@uAPmA^eAl@_A~@u@nAo@~Ag@nB_@|BWjCQxCI`DEjD?pDDvDHxDJvDLvDPpDN';

// Long run - larger irregular loop through streets
const LONG_RUN_POLYLINE = '_z{wFngnbMoKgEoKgEoKoKgEwQgEwQgEwQgEwQfEwQnKoKnKgEvQgEvQfEvQnKnKnKnKvQfEvQgEvQoKvQoKnKoKnKoKnK';

// Park loop - realistic irregular park path
const PARK_POLYLINE = 'g|xwFngnbMgEgEoKgEoKgEoKgEgEoKgEoK?wQfEwQnKoKnKgEvQ?nKfEnKnKfEvQ?vQgEvQgEnKoKvQ';

// Out and back tempo run
const TEMPO_POLYLINE = '_z{wFngnbMoKoKoKoKoKwQoKwQoKwQoKwQnKnKnKvQnKvQnKvQnKnKnKnK';

// Track workout - perfect oval (4 laps)
const TRACK_POLYLINE = 'o~uwFr|obMg@He@Z_@j@Yx@ObAGhA@hALfAR~@\\p@b@b@d@Rf@?d@Sb@c@\\q@R_ALgA@iAGiAOcAYy@_@k@e@[g@Ig@He@Z_@j@Yx@ObAGhA@hALfAR~@\\p@b@b@d@Rf@?d@Sb@c@\\q@R_ALgA@iAGiAOcAYy@_@k@e@[g@Ig@He@Z_@j@Yx@ObAGhA@hALfAR~@\\p@b@b@d@Rf@?d@Sb@c@\\q@R_ALgA@iAGiAOcAYy@_@k@e@[g@Ig@He@Z_@j@Yx@ObAGhA@hALfAR~@\\p@b@b@d@Rf@?d@Sb@c@\\q@R_ALgA@iAGiAOcAYy@_@k@e@[';

const MOCK_ACTIVITIES: ActivityStats[] = [
  {
    id: '1',
    title: 'Morning Run',
    distance: '10.02 km',
    time: '48m 12s',
    elevation: '124 m',
    pace: '4:48 /km',
    type: 'run',
    date: 'Today, 6:45 AM',
    calories: '650 kcal',
    heartRate: '165 bpm',
    polyline: NEIGHBORHOOD_POLYLINE,
  },
  {
    id: '2',
    title: 'Lunch Ride',
    distance: '24.5 km',
    time: '1h 5m 30s',
    elevation: '320 m',
    pace: '22.4 km/h',
    type: 'bike',
    date: 'Yesterday, 12:15 PM',
    calories: '480 kcal',
    heartRate: '135 bpm',
    polyline: TRAIL_POLYLINE,
  },
  {
    id: '3',
    title: 'Long Run',
    distance: '21.1 km',
    time: '1h 58m 45s',
    elevation: '210 m',
    pace: '5:38 /km',
    type: 'run',
    date: 'Sunday, 7:00 AM',
    calories: '1450 kcal',
    heartRate: '158 bpm',
    polyline: LONG_RUN_POLYLINE,
  },
  {
    id: '4',
    title: 'Park Loop',
    distance: '5.5 km',
    time: '28m 30s',
    elevation: '45 m',
    pace: '5:11 /km',
    type: 'run',
    date: 'Saturday, 8:30 AM',
    calories: '380 kcal',
    heartRate: '152 bpm',
    polyline: PARK_POLYLINE,
  },
  {
    id: '5',
    title: 'Tempo Run',
    distance: '8.0 km',
    time: '35m 12s',
    elevation: '68 m',
    pace: '4:24 /km',
    type: 'run',
    date: 'Friday, 6:00 AM',
    calories: '520 kcal',
    heartRate: '172 bpm',
    polyline: TEMPO_POLYLINE,
  },
  {
    id: '6',
    title: 'Track Workout',
    distance: '6.4 km',
    time: '24m 48s',
    elevation: '5 m',
    pace: '3:52 /km',
    type: 'run',
    date: 'Thursday, 5:30 PM',
    calories: '480 kcal',
    heartRate: '178 bpm',
    polyline: TRACK_POLYLINE,
  }
];

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, onSelectActivity, onManualUpload, onProfile, onSettings }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  // If real activities exist, use them. Otherwise use mock for display until sync.
  const displayActivities = activities.length > 0 ? activities : MOCK_ACTIVITIES;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
        setIsSyncing(false);
    }, 1500);
  };

  // Activity type icons
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'run':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
          </svg>
        );
      case 'bike':
      case 'ride':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/>
          </svg>
        );
      case 'hike':
      case 'walk':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
          </svg>
        );
      case 'swim':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M22 21c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.08.64-2.19.64-1.11 0-1.73-.37-2.18-.64-.37-.23-.6-.36-1.15-.36s-.78.13-1.15.36c-.46.27-1.08.64-2.19.64v-2c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36v2zm0-4.5c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36s-.78.13-1.15.36c-.47.27-1.09.64-2.2.64v-2c.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36v2zM8.67 12c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.12-.07.26-.15.41-.23L10.48 5C10.19 4.41 9.59 4 8.9 4H6v2h2.9l2.83 5.66c-.92.42-1.48.83-1.83 1.03-.46.27-1.08.64-2.19.64v2c1.11 0 1.73-.37 2.18-.64.37-.22.6-.36 1.15-.36z"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M2 12h4l2-6 3 12 2-6h4l2 3h3"/>
          </svg>
        );
    }
  };

  return (
    <div className="h-screen w-full flex flex-col font-sans text-white overflow-hidden relative">
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

      {/* Main Content Wrapper */}
      <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative z-10">
          {/* Header */}
          <div className="px-5 pt-8 pb-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Recent Activities</h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <div className={`w-1.5 h-1.5 rounded-full bg-[#CCFF00] ${isSyncing ? 'animate-ping' : ''}`}></div>
                 <span className="text-[10px] font-medium text-zinc-500">{activities.length > 0 ? `${activities.length} synced` : 'Demo mode'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={`w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center ${isSyncing ? 'text-[#CCFF00] border-[#CCFF00]/50' : ''}`}
                >
                    <div className={`${isSyncing ? 'animate-spin' : ''}`}>
                        <RefreshIcon />
                    </div>
                </button>
{onSettings && (
                  <button 
                      onClick={onSettings}
                      className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                  </button>
                )}
                {onProfile && (
                  <button 
                      onClick={onProfile}
                      className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                  </button>
                )}
            </div>
          </div>

          {/* Feed List - Compact Cards */}
          <div className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar">
            <div className="space-y-1">
                {displayActivities.map((activity, index) => {
                  const activityColor = ACTIVITY_COLORS[activity.type || 'run'] || ACTIVITY_COLORS.default;
                  const stats = getStatsForActivityType(activity).slice(0, 3);
                  
                  // Check if we should show date header (first item or different date from previous)
                  const showDateHeader = index === 0 || 
                    displayActivities[index - 1]?.date !== activity.date;
                  
                  return (
                    <div key={activity.id}>
                      {/* Date header */}
                      {showDateHeader && (
                        <div className="pt-4 pb-2 first:pt-0">
                          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                            {activity.date}
                          </span>
                        </div>
                      )}
                      
                      {/* Activity card */}
                      <div 
                        onClick={() => onSelectActivity(activity)}
                        className="group flex items-stretch bg-black/40 backdrop-blur-sm border border-zinc-700/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-zinc-500 active:scale-[0.98]"
                        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset' }}
                    >
                      {/* Left: Route or Icon - 72px for good touch target */}
                      <div 
                        className="w-[72px] flex-shrink-0 flex items-center justify-center bg-zinc-950/50"
                      >
                        {activity.polyline ? (
                          <div className="w-full h-full p-2.5">
                            <RoutePreview encodedPolyline={activity.polyline} color={activityColor} />
                          </div>
                        ) : (
                          <div style={{ color: activityColor, opacity: 0.8 }}>
                            {getActivityIcon(activity.type || 'run')}
                          </div>
                        )}
                      </div>
                      
                      {/* Right: Title + Stats */}
                      <div className="flex-1 py-3.5 px-4 flex flex-col justify-center min-w-0">
                        {/* Title row */}
                        <h3 className="text-[15px] font-semibold text-white truncate leading-tight mb-1.5">
                          {activity.title}
                        </h3>
                        
                        {/* Stats row - labels on top, values below */}
                        <div className="flex items-start gap-5">
                          {stats.map((stat, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className="text-[10px] text-zinc-500 uppercase tracking-wide mb-0.5">{stat.label}</span>
                              <span 
                                className="text-[14px] font-semibold leading-tight"
                                style={{ color: activityColor }}
                              >
                                {stat.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Arrow - sleek gradient style */}
                      <div className="w-10 flex items-center justify-center">
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                          style={{ 
                            background: `linear-gradient(135deg, ${activityColor}20, ${activityColor}40)`,
                            border: `1px solid ${activityColor}30`,
                          }}
                        >
                          <svg 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke={activityColor}
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="translate-x-[1px]"
                          >
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
            </div>
            
            <div className="pt-6 pb-8 text-center flex flex-col items-center gap-3">
                <span className="text-[11px] text-zinc-600">
                    {activities.length > 0 ? 'Pull to refresh' : 'Connect Strava for your activities'}
                </span>
                {/* Strava attribution - required per brand guidelines */}
                {activities.length > 0 && (
                  <img 
                    src="/assets/api_logo_pwrdBy_strava_horiz_white.png" 
                    alt="Powered by Strava"
                    style={{ height: '24px', width: 'auto' }}
                  />
                )}
            </div>
          </div>
      </div>
    </div>
  );
};

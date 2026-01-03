import { ActivityStats } from '../types';
import { getUnitSystem, convertDistance, convertElevation, convertPace } from './units';

export interface StatItem {
  key: string;
  label: string;
  value: string;
}

// Format time to Xh Xm Xs format
const formatTime = (timeStr: string): string => {
  // If already in h m s format, return as is
  if (timeStr.includes('h') || timeStr.includes('m ') || timeStr.includes('s')) {
    return timeStr;
  }
  
  const cleanStr = timeStr.replace(/[a-zA-Z]/g, '').trim();
  const parts = cleanStr.split(':');
  
  if (parts.length === 3) {
    const h = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const s = parseInt(parts[2]);
    return `${h}h ${m}m ${s}s`;
  } else if (parts.length === 2) {
    const m = parseInt(parts[0]);
    const s = parseInt(parts[1]);
    return `${m}m ${s}s`;
  }
  return timeStr;
};

// Check if a stat value is meaningful (not empty, zero, or placeholder)
const isValidStat = (value: string | undefined): boolean => {
  if (!value) return false;
  const normalized = value.toLowerCase().trim();
  // Filter out zero/empty values
  if (normalized === '0' || normalized === '-' || normalized === '') return false;
  if (normalized === '0.00 km' || normalized === '0 km') return false;
  if (normalized === '0 m' || normalized === '0m') return false;
  if (normalized === '0:00' || normalized === '00:00') return false;
  if (normalized === '0 kcal' || normalized === '0kcal') return false;
  if (normalized === '0 bpm' || normalized === '0bpm') return false;
  return true;
};

/**
 * Returns prioritized stats based on activity type
 * Run: distance → pace → time → elevation
 * Ride: distance → speed → elevation → time
 * Hike: distance → elevation → time
 * Swim: distance → time → pace
 * Workout: time → calories → heartRate (NO distance/pace/elevation)
 */
export const getStatsForActivityType = (activity: ActivityStats): StatItem[] => {
  const type = activity.type || 'run';
  const unitSystem = getUnitSystem();
  
  // Convert values based on unit system
  const distance = activity.distance ? convertDistance(activity.distance, unitSystem) : undefined;
  const elevation = activity.elevation ? convertElevation(activity.elevation, unitSystem) : undefined;
  const pace = activity.pace ? convertPace(activity.pace, unitSystem) : undefined;
  
  const allStats: Record<string, StatItem | null> = {
    distance: isValidStat(distance) ? { key: 'distance', label: 'Distance', value: distance! } : null,
    time: isValidStat(activity.time) ? { key: 'time', label: 'Time', value: formatTime(activity.time) } : null,
    pace: isValidStat(pace) ? { key: 'pace', label: type === 'bike' ? 'Speed' : 'Pace', value: pace! } : null,
    elevation: isValidStat(elevation) ? { key: 'elevation', label: 'Elevation', value: elevation! } : null,
    calories: isValidStat(activity.calories) ? { key: 'calories', label: 'Calories', value: activity.calories! } : null,
    heartRate: isValidStat(activity.heartRate) ? { key: 'heartRate', label: 'Avg HR', value: activity.heartRate! } : null,
    maxHeartRate: isValidStat(activity.maxHeartRate) ? { key: 'maxHeartRate', label: 'Max HR', value: activity.maxHeartRate! } : null,
    date: isValidStat(activity.date) ? { key: 'date', label: 'Date', value: activity.date! } : null,
  };

  let priority: string[];

  switch (type) {
    case 'bike':
      priority = ['distance', 'pace', 'elevation', 'time', 'calories', 'heartRate', 'maxHeartRate', 'date'];
      break;
    case 'hike':
      priority = ['distance', 'elevation', 'time', 'pace', 'calories', 'heartRate', 'maxHeartRate', 'date'];
      break;
    case 'swim':
      priority = ['distance', 'time', 'pace', 'calories', 'heartRate', 'maxHeartRate', 'date'];
      break;
    case 'workout':
      // Workouts prioritize: time, avg HR, calories, max HR (no distance/pace/elevation)
      priority = ['time', 'heartRate', 'calories', 'maxHeartRate', 'date'];
      break;
    case 'run':
    default:
      priority = ['distance', 'pace', 'time', 'elevation', 'calories', 'heartRate', 'maxHeartRate', 'date'];
      break;
  }

  return priority
    .map(key => allStats[key])
    .filter((stat): stat is StatItem => stat !== null);
};

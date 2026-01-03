// Unit conversion utilities

export type UnitSystem = 'metric' | 'imperial';

const STORAGE_KEY = 'app_unit_system';

// Get current unit system from localStorage
export const getUnitSystem = (): UnitSystem => {
  if (typeof localStorage === 'undefined') return 'metric';
  return (localStorage.getItem(STORAGE_KEY) as UnitSystem) || 'metric';
};

// Set unit system in localStorage
export const setUnitSystem = (system: UnitSystem): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, system);
  }
};

// Conversion functions
const KM_TO_MILES = 0.621371;
const METERS_TO_FEET = 3.28084;

// Convert distance string from km to miles
// Input: "10.45 km" -> Output: "6.49 mi"
export const convertDistance = (distanceStr: string, toSystem: UnitSystem): string => {
  if (!distanceStr) return distanceStr;
  
  // Parse the number from the string
  const match = distanceStr.match(/([\d.]+)\s*(km|mi)/i);
  if (!match) return distanceStr;
  
  const value = parseFloat(match[1]);
  const currentUnit = match[2].toLowerCase();
  
  if (toSystem === 'imperial') {
    // Convert km to miles
    if (currentUnit === 'km') {
      const miles = value * KM_TO_MILES;
      return `${miles.toFixed(2)} mi`;
    }
    return distanceStr; // Already in miles
  } else {
    // Convert miles to km
    if (currentUnit === 'mi') {
      const km = value / KM_TO_MILES;
      return `${km.toFixed(2)} km`;
    }
    return distanceStr; // Already in km
  }
};

// Convert elevation string from meters to feet
// Input: "465 m" -> Output: "1526 ft"
export const convertElevation = (elevationStr: string, toSystem: UnitSystem): string => {
  if (!elevationStr) return elevationStr;
  
  // Parse the number from the string
  const match = elevationStr.match(/([\d.]+)\s*(m|ft)/i);
  if (!match) return elevationStr;
  
  const value = parseFloat(match[1]);
  const currentUnit = match[2].toLowerCase();
  
  if (toSystem === 'imperial') {
    // Convert meters to feet
    if (currentUnit === 'm') {
      const feet = Math.round(value * METERS_TO_FEET);
      return `${feet} ft`;
    }
    return elevationStr; // Already in feet
  } else {
    // Convert feet to meters
    if (currentUnit === 'ft') {
      const meters = Math.round(value / METERS_TO_FEET);
      return `${meters} m`;
    }
    return elevationStr; // Already in meters
  }
};

// Convert pace string from /km to /mi
// Input: "5:30 /km" -> Output: "8:51 /mi"
export const convertPace = (paceStr: string, toSystem: UnitSystem): string => {
  if (!paceStr) return paceStr;
  
  // Check if it's speed (km/h) rather than pace
  if (paceStr.includes('km/h') || paceStr.includes('mi/h') || paceStr.includes('mph')) {
    return convertSpeed(paceStr, toSystem);
  }
  
  // Parse pace format "M:SS /km" or "M:SS /mi"
  const match = paceStr.match(/(\d+):(\d{2})\s*\/(km|mi)/i);
  if (!match) return paceStr;
  
  const minutes = parseInt(match[1]);
  const seconds = parseInt(match[2]);
  const currentUnit = match[3].toLowerCase();
  const totalSeconds = minutes * 60 + seconds;
  
  if (toSystem === 'imperial') {
    // Convert /km to /mi (multiply by ~1.609)
    if (currentUnit === 'km') {
      const newTotalSeconds = Math.round(totalSeconds / KM_TO_MILES);
      const newMinutes = Math.floor(newTotalSeconds / 60);
      const newSeconds = newTotalSeconds % 60;
      return `${newMinutes}:${newSeconds.toString().padStart(2, '0')} /mi`;
    }
    return paceStr;
  } else {
    // Convert /mi to /km (divide by ~1.609)
    if (currentUnit === 'mi') {
      const newTotalSeconds = Math.round(totalSeconds * KM_TO_MILES);
      const newMinutes = Math.floor(newTotalSeconds / 60);
      const newSeconds = newTotalSeconds % 60;
      return `${newMinutes}:${newSeconds.toString().padStart(2, '0')} /km`;
    }
    return paceStr;
  }
};

// Convert speed string from km/h to mi/h
// Input: "25.5 km/h" -> Output: "15.8 mph"
export const convertSpeed = (speedStr: string, toSystem: UnitSystem): string => {
  if (!speedStr) return speedStr;
  
  // Parse speed format "XX.X km/h" or "XX.X mph"
  const match = speedStr.match(/([\d.]+)\s*(km\/h|mph|mi\/h)/i);
  if (!match) return speedStr;
  
  const value = parseFloat(match[1]);
  const currentUnit = match[2].toLowerCase();
  
  if (toSystem === 'imperial') {
    // Convert km/h to mph
    if (currentUnit === 'km/h') {
      const mph = value * KM_TO_MILES;
      return `${mph.toFixed(1)} mph`;
    }
    return speedStr;
  } else {
    // Convert mph to km/h
    if (currentUnit === 'mph' || currentUnit === 'mi/h') {
      const kmh = value / KM_TO_MILES;
      return `${kmh.toFixed(1)} km/h`;
    }
    return speedStr;
  }
};

// Convert all relevant fields in an activity for display
export const convertActivityForDisplay = (activity: {
  distance?: string;
  elevation?: string;
  pace?: string;
  [key: string]: any;
}, toSystem: UnitSystem): typeof activity => {
  return {
    ...activity,
    distance: activity.distance ? convertDistance(activity.distance, toSystem) : activity.distance,
    elevation: activity.elevation ? convertElevation(activity.elevation, toSystem) : activity.elevation,
    pace: activity.pace ? convertPace(activity.pace, toSystem) : activity.pace,
  };
};

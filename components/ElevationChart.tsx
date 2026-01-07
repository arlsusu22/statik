import React, { memo, useMemo } from 'react';
import { SplitData, OverlayPack } from '../types';
import { getUnitSystem } from '../utils/units';

// Helper to adjust color brightness
const adjustColorBrightness = (hex: string, percent: number): string => {
  // Handle rgba or rgb colors
  if (hex.startsWith('rgb')) {
    const match = hex.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = Math.min(255, Math.max(0, parseInt(match[1]) + (255 * percent / 100)));
      const g = Math.min(255, Math.max(0, parseInt(match[2]) + (255 * percent / 100)));
      const b = Math.min(255, Math.max(0, parseInt(match[3]) + (255 * percent / 100)));
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
  }
  
  // Handle hex colors
  let color = hex.replace('#', '');
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  
  const num = parseInt(color, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + (255 * percent / 100)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + (255 * percent / 100)));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + (255 * percent / 100)));
  
  return `#${(0x1000000 + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
};

interface ElevationChartProps {
  splits?: SplitData[]; // Uses splits data for elevation profile
  pack: OverlayPack;
  isPreview?: boolean;
  fillColor?: string; // Color for chart fill (defaults to routeColor)
  textColor?: string; // Color for text/labels (defaults to stats color)
  fillOpacity?: number; // Opacity of the fill (0-1)
  showLabels?: boolean; // Show axis labels
  showTitle?: boolean; // Show "Elevation Gain" header with value
  // Actual elevation data from Strava
  elevationGain?: number; // Total elevation gain in meters
  elevLow?: number; // Lowest elevation (starting point typically)
  elevHigh?: number; // Highest elevation reached
  // Cycling mode - shows speed + elevation
  activityType?: 'run' | 'bike' | 'hike' | 'swim' | 'workout';
  averageSpeed?: number; // Average speed in m/s (for cycling header)
  // Style props passed directly from OverlayRenderer
  fontFamily?: string;
  defaultRouteColor?: string;
  defaultStatsColor?: string;
}

export const ElevationChart: React.FC<ElevationChartProps> = memo(({
  splits,
  pack,
  isPreview = false,
  fillColor,
  textColor,
  fillOpacity = 0.6,
  showLabels = true,
  showTitle = true,
  elevationGain = 0,
  elevLow = 0,
  elevHigh = 0,
  activityType,
  averageSpeed = 0,
  fontFamily: fontFamilyProp = 'sans-serif',
  defaultRouteColor = '#FFFFFF',
  defaultStatsColor = '#FFFFFF',
}) => {
  const isMetric = getUnitSystem() === 'metric';
  const isCycling = activityType === 'bike';
  
  // Colors match the pack style
  const activeFillColor = fillColor || defaultRouteColor;
  const activeTextColor = textColor || defaultStatsColor;
  const fontFamily = fontFamilyProp;
  
  // For cycling: use a lighter shade for speed
  const speedFillColor = adjustColorBrightness(activeFillColor, 40);
  
  // Calculate elevation profile using actual elevation data
  // Start from elevLow and use splits' elevation_difference to build the profile
  const { elevationData, speedData } = useMemo(() => {
    if (!splits || splits.length === 0) return { elevationData: null, speedData: null };
    
    // Build elevation profile starting from the lowest elevation point
    // and adding each split's elevation difference
    let currentElevation = elevLow;
    const elevPoints: { distance: number; elevation: number }[] = [{ distance: 0, elevation: currentElevation }];
    const speedPoints: { distance: number; speed: number }[] = [];
    
    splits.forEach((split, index) => {
      currentElevation += split.elevation_difference || 0;
      elevPoints.push({
        distance: index + 1,
        elevation: currentElevation,
      });
      
      // Speed data for cycling
      if (isCycling) {
        speedPoints.push({
          distance: index + 0.5, // Center of split
          speed: split.average_speed || 0,
        });
      }
    });
    
    return { elevationData: elevPoints, speedData: speedPoints };
  }, [splits, elevLow, isCycling]);
  
  // Handle missing data
  if (!elevationData || elevationData.length < 2) {
    return (
      <div 
        className="flex items-center justify-center"
        style={{ fontFamily, color: activeTextColor }}
      >
        <span className={isPreview ? 'text-[8px]' : 'text-sm'}>No elevation data</span>
      </div>
    );
  }
  
  // Chart dimensions
  const chartWidth = isPreview ? 180 : 300;
  const chartHeight = isPreview ? 60 : 100;
  const padding = { top: 15, right: 15, bottom: showLabels ? 18 : 5, left: 10 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  
  // Calculate min/max for scaling
  const minElevation = Math.min(...elevationData.map(p => p.elevation));
  const maxElevation = Math.max(...elevationData.map(p => p.elevation));
  const elevationRange = maxElevation - minElevation || 1;
  const maxDistance = elevationData[elevationData.length - 1].distance || 1;
  
  // Scale functions
  const xScale = (distance: number) => padding.left + (distance / maxDistance) * innerWidth;
  const yScale = (elevation: number) => padding.top + innerHeight - ((elevation - minElevation) / elevationRange) * innerHeight;
  
  // Build SVG paths
  const points = elevationData.map(p => `${xScale(p.distance)},${yScale(p.elevation)}`);
  const linePathD = `M${points.join(' L')}`;
  const areaPathD = `${linePathD} L${xScale(maxDistance)},${yScale(minElevation)} L${xScale(0)},${yScale(minElevation)} Z`;
  
  // Format elevation for display
  const formatElevation = (m: number) => {
    if (isMetric) {
      return `${Math.round(m)}m`;
    } else {
      return `${Math.round(m * 3.28084)}ft`;
    }
  };
  
  // Format distance for display
  const formatDistance = (d: number) => {
    if (isMetric) {
      return `${d}km`;
    } else {
      return `${d}mi`;
    }
  };
  
  // Starting and highest elevation points
  const startElevation = elevationData[0].elevation;
  const highestPoint = elevationData.reduce((max, p) => p.elevation > max.elevation ? p : max, elevationData[0]);
  
  // Use actual elevHigh for display if available, otherwise use calculated max
  const displayHighest = elevHigh > 0 ? elevHigh : highestPoint.elevation;
  
  // Format elevation gain for header
  const formatElevationGain = (m: number) => {
    if (isMetric) {
      return `${Math.round(m)}m`;
    } else {
      return `${Math.round(m * 3.28084)}ft`;
    }
  };
  
  // Format speed for cycling (km/h or mph)
  const formatSpeed = (mps: number) => {
    if (isMetric) {
      return `${(mps * 3.6).toFixed(1)} km/h`;
    } else {
      return `${(mps * 2.237).toFixed(1)} mph`;
    }
  };
  
  // Speed data scaling for cycling
  const minSpeed = speedData && speedData.length > 0 ? Math.min(...speedData.map(p => p.speed)) : 0;
  const maxSpeed = speedData && speedData.length > 0 ? Math.max(...speedData.map(p => p.speed)) : 1;
  const speedRange = maxSpeed - minSpeed || 1;
  
  // Scale function for speed (normalized to same chart height)
  const yScaleSpeed = (speed: number) => padding.top + innerHeight - ((speed - minSpeed) / speedRange) * innerHeight;
  
  // Build speed SVG path for cycling
  let speedLinePathD = '';
  let speedAreaPathD = '';
  if (isCycling && speedData && speedData.length > 0) {
    const speedPoints = speedData.map(p => `${xScale(p.distance)},${yScaleSpeed(p.speed)}`);
    speedLinePathD = `M${speedPoints.join(' L')}`;
    speedAreaPathD = `${speedLinePathD} L${xScale(speedData[speedData.length - 1].distance)},${yScaleSpeed(minSpeed)} L${xScale(speedData[0].distance)},${yScaleSpeed(minSpeed)} Z`;
  }

  const fontSize = isPreview ? 6 : 10;
  const titleSize = isPreview ? 10 : 14;
  const gainSize = isPreview ? 14 : 22;
  const gradientId = `elevation-gradient-${pack}-${Math.random().toString(36).substr(2, 5)}`;
  const speedGradientId = `speed-gradient-${pack}-${Math.random().toString(36).substr(2, 5)}`;
  
  return (
    <div className="flex flex-col items-center">
      {/* Header - shows elevation gain, and avg speed for cycling */}
      {showTitle && (
        <div className={`flex ${isCycling ? 'flex-row gap-6' : 'flex-col'} items-center mb-2`}>
          {/* Elevation Gain */}
          <div className="flex flex-col items-center">
            <div 
              style={{ 
                fontFamily, 
                color: activeTextColor,
                fontSize: titleSize,
                opacity: 0.7,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Elevation
            </div>
            <div 
              style={{ 
                fontFamily, 
                color: activeFillColor,
                fontSize: gainSize,
                fontWeight: 'bold',
              }}
            >
              {formatElevationGain(elevationGain)}
            </div>
          </div>
          
          {/* Average Speed - only for cycling */}
          {isCycling && averageSpeed > 0 && (
            <div className="flex flex-col items-center">
              <div 
                style={{ 
                  fontFamily, 
                  color: activeTextColor,
                  fontSize: titleSize,
                  opacity: 0.7,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Avg Speed
              </div>
              <div 
                style={{ 
                  fontFamily, 
                  color: speedFillColor,
                  fontSize: gainSize,
                  fontWeight: 'bold',
                }}
              >
                {formatSpeed(averageSpeed)}
              </div>
            </div>
          )}
        </div>
      )}
      
      <svg 
        width={chartWidth} 
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        style={{ overflow: 'visible' }}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={activeFillColor} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={activeFillColor} stopOpacity={fillOpacity * 0.3} />
          </linearGradient>
          {isCycling && (
            <linearGradient id={speedGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={speedFillColor} stopOpacity={fillOpacity * 0.8} />
              <stop offset="100%" stopColor={speedFillColor} stopOpacity={fillOpacity * 0.2} />
            </linearGradient>
          )}
        </defs>
        
        {/* Speed area for cycling (behind elevation) */}
        {isCycling && speedAreaPathD && (
          <>
            <path
              d={speedAreaPathD}
              fill={`url(#${speedGradientId})`}
            />
            <path
              d={speedLinePathD}
              fill="none"
              stroke={speedFillColor}
              strokeWidth={isPreview ? 1 : 1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7}
            />
          </>
        )}
        
        {/* Starting elevation label - at bottom left */}
        {showLabels && (
          <text
            x={xScale(0)}
            y={chartHeight - 3}
            textAnchor="start"
            fill={activeTextColor}
            fontSize={fontSize}
            fontFamily={fontFamily}
            opacity={0.8}
          >
            {formatElevation(startElevation)}
          </text>
        )}
        
        {/* Highest elevation label - at the peak */}
        {showLabels && (
          <text
            x={xScale(highestPoint.distance)}
            y={yScale(highestPoint.elevation) - 5}
            textAnchor="middle"
            fill={activeTextColor}
            fontSize={fontSize}
            fontFamily={fontFamily}
            opacity={0.8}
          >
            {formatElevation(displayHighest)}
          </text>
        )}
        
        {/* Filled area */}
        <path
          d={areaPathD}
          fill={`url(#${gradientId})`}
        />
        
        {/* Top line edge */}
        <path
          d={linePathD}
          fill="none"
          stroke={activeFillColor}
          strokeWidth={isPreview ? 1.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
      </svg>
    </div>
  );
});

export default ElevationChart;

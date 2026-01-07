import React, { memo, useMemo } from 'react';
import { SplitData, OverlayPack, ChartOrientation, ChartBarEffect } from '../types';
import { getUnitSystem } from '../utils/units';

interface SplitsChartProps {
  splits?: SplitData[]; // Optional - may not be loaded yet
  pack: OverlayPack;
  isPreview?: boolean;
  barColor?: string; // Color for chart bars (defaults to routeColor)
  textColor?: string; // Color for text/numbers (defaults to stats color)
  maxBars?: number; // Cap the number of bars shown
  orientation?: ChartOrientation; // Vertical or horizontal bars
  barEffect?: ChartBarEffect; // Effect applied to bars
  showLabels?: boolean; // Show pace labels
  showTitle?: boolean; // Show "Splits" title
  // Style props passed directly from OverlayRenderer
  fontFamily?: string;
  routeColor?: string;
  statsColor?: string;
}

// Convert m/s to pace string based on unit system
const speedToPace = (speedMs: number, isMetric: boolean): string => {
  if (speedMs <= 0) return '-';
  // Seconds per km or mile
  const metersPerUnit = isMetric ? 1000 : 1609.34;
  const secondsPerUnit = metersPerUnit / speedMs;
  const mins = Math.floor(secondsPerUnit / 60);
  const secs = Math.floor(secondsPerUnit % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Generate gradient colors for multi-color effect
const getGradientColors = (): string[] => {
  // Create a vibrant gradient through complementary colors
  return [
    '#FF6B6B', // Red
    '#FFE66D', // Yellow
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
  ];
};

// Generate shine gradient (same color, lighter to darker)
const getShineGradient = (baseColor: string): { light: string; dark: string } => {
  // Parse hex color and create lighter/darker versions
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Lighter version (add white)
  const lightR = Math.min(255, r + 60);
  const lightG = Math.min(255, g + 60);
  const lightB = Math.min(255, b + 60);
  
  // Darker version (subtract)
  const darkR = Math.max(0, r - 40);
  const darkG = Math.max(0, g - 40);
  const darkB = Math.max(0, b - 40);
  
  return {
    light: `rgb(${lightR}, ${lightG}, ${lightB})`,
    dark: `rgb(${darkR}, ${darkG}, ${darkB})`,
  };
};

export const SplitsChart: React.FC<SplitsChartProps> = memo(({
  splits,
  pack,
  isPreview = false,
  barColor,
  textColor,
  maxBars = 10,
  orientation = 'vertical',
  barEffect = 'solid',
  showLabels = true,
  showTitle = true,
  fontFamily = 'sans-serif',
  routeColor: defaultRouteColor = '#FFFFFF',
  statsColor = '#FFFFFF',
}) => {
  const isMetric = getUnitSystem() === 'metric';
  
  // Bar color matches route/map, text color matches stats
  const activeBarColor = barColor || defaultRouteColor;
  const activeTextColor = textColor || statsColor;
  
  // Generate unique gradient ID for this chart instance
  const gradientId = useMemo(() => `chart-gradient-${Math.random().toString(36).substr(2, 9)}`, []);
  const shineGradientId = useMemo(() => `chart-shine-${Math.random().toString(36).substr(2, 9)}`, []);
  
  // Handle missing splits
  if (!splits || splits.length === 0) {
    return (
      <div 
        className="flex items-center justify-center"
        style={{ fontFamily, color: activeTextColor }}
      >
        <span className={isPreview ? 'text-[8px]' : 'text-sm'}>No splits data</span>
      </div>
    );
  }
  
  // Limit splits to maxBars
  const displaySplits = splits.slice(0, maxBars);
  
  // Find min/max pace for scaling
  const paces = displaySplits.map(s => s.average_speed > 0 ? 1000 / s.average_speed : 0);
  const validPaces = paces.filter(p => p > 0);
  
  if (validPaces.length === 0) {
    return (
      <div 
        className="flex items-center justify-center"
        style={{ fontFamily: fontFamily, color: activeTextColor }}
      >
        <span className={isPreview ? 'text-[8px]' : 'text-sm'}>No splits data</span>
      </div>
    );
  }
  
  const minPace = Math.min(...validPaces);
  const maxPace = Math.max(...validPaces);
  const paceRange = maxPace - minPace || 1;
  
  // Chart dimensions based on orientation
  const barWidth = isPreview ? 8 : 20;
  const barGap = isPreview ? 2 : 4;
  const maxBarLength = isPreview ? 60 : 140;
  
  // For vertical: width is based on bar count, height is fixed
  // For horizontal: width is fixed, height is based on bar count
  const chartWidth = orientation === 'vertical' 
    ? displaySplits.length * (barWidth + barGap)
    : maxBarLength + (isPreview ? 30 : 60); // Extra space for labels
  
  const chartHeight = orientation === 'vertical'
    ? maxBarLength + (isPreview ? 12 : 24)
    : displaySplits.length * (barWidth + barGap);
  
  // Get gradient colors for multi-color effect
  const gradientColors = getGradientColors();
  const shineColors = getShineGradient(activeBarColor);
  
  // Get fill for bar based on effect
  const getBarFill = (index: number): string => {
    switch (barEffect) {
      case 'gradient-multi':
        return `url(#${gradientId}-${index})`;
      case 'gradient-shine':
        return `url(#${shineGradientId})`;
      default:
        return activeBarColor;
    }
  };
  
  return (
    <div className={`flex flex-col items-center ${orientation === 'horizontal' ? 'w-full' : ''}`}>
      {/* Chart title */}
      {showTitle && (
        <div 
          className={`${isPreview ? 'text-[6px] mb-1' : 'text-xs mb-2'} uppercase tracking-wider`}
          style={{ 
            fontFamily: fontFamily, 
            color: activeTextColor,
            WebkitTextStroke: isPreview ? '0.3px #000' : '0.5px #000',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            paintOrder: 'stroke fill',
          } as React.CSSProperties}
        >
          Splits
        </div>
      )}
      
      {/* Bar chart */}
      <svg 
        width={chartWidth} 
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        {/* Gradient definitions */}
        <defs>
          {/* Multi-color gradients - one per bar with different color */}
          {barEffect === 'gradient-multi' && displaySplits.map((_, index) => {
            const colorIndex = index % gradientColors.length;
            const nextColorIndex = (index + 1) % gradientColors.length;
            return (
              <linearGradient 
                key={`gradient-${index}`}
                id={`${gradientId}-${index}`} 
                x1="0%" 
                y1="0%" 
                x2={orientation === 'vertical' ? '0%' : '100%'} 
                y2={orientation === 'vertical' ? '100%' : '0%'}
              >
                <stop offset="0%" stopColor={gradientColors[colorIndex]} />
                <stop offset="100%" stopColor={gradientColors[nextColorIndex]} />
              </linearGradient>
            );
          })}
          
          {/* Shine gradient - same for all bars */}
          {barEffect === 'gradient-shine' && (
            <linearGradient 
              id={shineGradientId} 
              x1="0%" 
              y1="0%" 
              x2={orientation === 'vertical' ? '100%' : '0%'} 
              y2={orientation === 'vertical' ? '100%' : '100%'}
            >
              <stop offset="0%" stopColor={shineColors.light} />
              <stop offset="50%" stopColor={activeBarColor} />
              <stop offset="100%" stopColor={shineColors.dark} />
            </linearGradient>
          )}
        </defs>
        
        {displaySplits.map((split, index) => {
          const pace = split.average_speed > 0 ? 1000 / split.average_speed : 0;
          // Invert: faster pace (lower number) = taller/longer bar
          const normalizedLength = pace > 0 
            ? 1 - ((pace - minPace) / paceRange) 
            : 0;
          // Ensure minimum bar length
          const barLength = Math.max(normalizedLength * maxBarLength * 0.8 + maxBarLength * 0.2, maxBarLength * 0.15);
          
          if (orientation === 'vertical') {
            // Vertical bars (original layout)
            const x = index * (barWidth + barGap);
            const y = maxBarLength - barLength;
            
            return (
              <g key={split.split}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barLength}
                  rx={isPreview ? 1 : 2}
                  fill={getBarFill(index)}
                  stroke="#000000"
                  strokeWidth={isPreview ? 0.5 : 1}
                  opacity={0.9}
                />
                
                {/* Pace label on bar (only for non-preview) */}
                {!isPreview && showLabels && pace > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fontSize="8"
                    fill={activeTextColor}
                    fontFamily={fontFamily}
                    stroke="#000000"
                    strokeWidth={0.5}
                    paintOrder="stroke fill"
                  >
                    {speedToPace(split.average_speed, isMetric)}
                  </text>
                )}
                
                {/* Split number label */}
                <text
                  x={x + barWidth / 2}
                  y={maxBarLength + (isPreview ? 8 : 16)}
                  textAnchor="middle"
                  fontSize={isPreview ? 5 : 10}
                  fill={activeTextColor}
                  fontFamily={fontFamily}
                  stroke="#000000"
                  strokeWidth={isPreview ? 0.3 : 0.5}
                  paintOrder="stroke fill"
                >
                  {split.split}
                </text>
              </g>
            );
          } else {
            // Horizontal bars
            const y = index * (barWidth + barGap);
            const labelOffset = isPreview ? 15 : 25;
            
            return (
              <g key={split.split}>
                {/* Split number label (left side) */}
                <text
                  x={labelOffset / 2}
                  y={y + barWidth / 2 + (isPreview ? 2 : 4)}
                  textAnchor="middle"
                  fontSize={isPreview ? 5 : 10}
                  fill={activeTextColor}
                  fontFamily={fontFamily}
                  stroke="#000000"
                  strokeWidth={isPreview ? 0.3 : 0.5}
                  paintOrder="stroke fill"
                >
                  {split.split}
                </text>
                
                {/* Bar */}
                <rect
                  x={labelOffset}
                  y={y}
                  width={barLength}
                  height={barWidth}
                  rx={isPreview ? 1 : 2}
                  fill={getBarFill(index)}
                  stroke="#000000"
                  strokeWidth={isPreview ? 0.5 : 1}
                  opacity={0.9}
                />
                
                {/* Pace label (right of bar, only for non-preview) */}
                {!isPreview && showLabels && pace > 0 && (
                  <text
                    x={labelOffset + barLength + 4}
                    y={y + barWidth / 2 + 3}
                    textAnchor="start"
                    fontSize="8"
                    fill={activeTextColor}
                    fontFamily={fontFamily}
                    stroke="#000000"
                    strokeWidth={0.5}
                    paintOrder="stroke fill"
                  >
                    {speedToPace(split.average_speed, isMetric)}
                  </text>
                )}
              </g>
            );
          }
        })}
      </svg>
      
      {/* Legend - only in full view */}
      {!isPreview && displaySplits.length < splits.length && (
        <div 
          className="text-[8px] mt-1 opacity-50"
          style={{ fontFamily: fontFamily, color: activeTextColor }}
        >
          Showing {displaySplits.length} of {splits.length} splits
        </div>
      )}
    </div>
  );
});

SplitsChart.displayName = 'SplitsChart';

export default SplitsChart;

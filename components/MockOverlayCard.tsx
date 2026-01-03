import React from 'react';
import { StatsOverlay } from './StatsOverlay';
import { 
  ActivityContext, 
  OverlayLayout,
  VisibleStats, 
  SeparatedStats,
  BackgroundConfig,
  ImageAdjustments,
  RouteConfig 
} from '../types';

interface MockOverlayCardProps {
  layout: OverlayLayout;
  title: string;
  distance: string;
  time: string;
  pace: string;
  elevation?: string;
  polyline?: string;
  svgPath?: string;
  routeColor?: string;
  width?: number;
  height?: number;
  showRoute?: boolean;
}

// Default visible stats for preview cards
const defaultVisibleStats: VisibleStats = {
  title: true,
  distance: true,
  time: true,
  elevation: false,
  pace: true,
  calories: false,
  heartRate: false,
  date: false,
};

const defaultSeparatedStats: SeparatedStats = {
  distance: false,
  time: false,
  elevation: false,
  pace: false,
  calories: false,
  heartRate: false,
  date: false,
};

const defaultBgConfig: BackgroundConfig = {
  x: 0,
  y: 0,
  scale: 1,
  opacity: 1,
  transparent: true, // Show checkerboard
};

const defaultImageAdjustments: ImageAdjustments = {
  noise: 0,
  saturation: 0,
  contrast: 0,
  brightness: 0,
  warmth: 0,
};

export const MockOverlayCard: React.FC<MockOverlayCardProps> = ({
  layout,
  title,
  distance,
  time,
  pace,
  elevation = '0m',
  polyline,
  svgPath,
  routeColor = '#0a9396',
  width = 208,
  height = 370,
  showRoute = true,
}) => {
  // Construct mock ActivityContext
  const mockContext: ActivityContext = {
    stats: {
      title,
      distance,
      time,
      elevation,
      pace,
      polyline,
    },
    backgroundImage: null,
    bgConfig: defaultBgConfig,
    layout, // Just pass the string like 'RETRO_CLASSIC'
    customColor: '',
    fontWeight: 'bold',
    textShadow: true,
    textStyle: 'default',
    textAlign: 'center',
    statsLayout: 'vertical',
    imageFilter: 'none',
    imageFilterStrength: 50,
    imageAdjustments: defaultImageAdjustments,
    visibleStats: defaultVisibleStats,
    separatedStats: defaultSeparatedStats,
    elementPositions: {},
    selectedElementId: null,
    showLabels: true,
  };

  // Route config for the polyline
  const routeConfig: RouteConfig = {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    strokeWidth: 3,
    color: routeColor,
    style: 'smooth',
    outline: true,
    outlineWidth: 2,
    outlineColor: '#000000',
  };

  // Internal render size (larger for proper StatsOverlay rendering)
  const internalWidth = 360;
  const internalHeight = 640;
  
  // Scale factor to fit into the desired display size
  const scaleX = width / internalWidth;
  const scaleY = height / internalHeight;
  const scale = Math.min(scaleX, scaleY);

  return (
    <div 
      style={{ 
        width, 
        height,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
      }}
    >
      {/* Scale down the StatsOverlay to fit */}
      <div
        style={{
          width: internalWidth,
          height: internalHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <StatsOverlay
          context={mockContext}
          showRoute={showRoute && !!polyline}
          routeConfig={routeConfig}
          isEditing={false}
          isExporting={false}
        />
      </div>
      
      {/* SVG Route overlay (hand-drawn from Figma) */}
      {svgPath && showRoute && (
        <svg
          viewBox="0 0 303 600"
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '55%',
            pointerEvents: 'none',
          }}
        >
          <path
            d={svgPath}
            fill="none"
            stroke={routeColor}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: `drop-shadow(0 2px 4px ${routeColor}66)`,
            }}
          />
        </svg>
      )}
    </div>
  );
};

// =============================================================================
// PRESET MOCK DATA for welcome page slideshow
// =============================================================================

// Track oval - a classic 400m track shape (multiple laps)
const TRACK_OVAL_SVG = `M 80 150 
  C 80 100 120 70 170 70 
  C 220 70 260 100 260 150 
  C 260 200 220 230 170 230 
  C 120 230 80 200 80 150 Z
  M 75 150 
  C 75 95 118 62 170 62 
  C 222 62 265 95 265 150 
  C 265 205 222 238 170 238 
  C 118 238 75 205 75 150 Z
  M 70 150 
  C 70 90 115 55 170 55 
  C 225 55 270 90 270 150 
  C 270 210 225 245 170 245 
  C 115 245 70 210 70 150 Z`;

// Irregular trail run - not a loop, point to point with natural curves
const TRAIL_RUN_SVG = `M 30 580 
  L 35 560 C 40 540 55 520 70 510 
  C 85 500 95 485 90 465 
  L 85 440 C 80 420 90 400 110 390 
  C 130 380 145 360 155 340 
  L 170 310 C 180 285 175 260 160 245 
  C 145 230 140 210 150 190 
  L 165 165 C 175 145 195 135 215 140 
  C 235 145 250 130 255 110 
  L 260 85 C 262 65 250 50 235 45 
  C 220 40 210 25 220 10`;

// Irregular loop - organic shape like a neighborhood run
const IRREGULAR_LOOP_SVG = `M 150 280 
  L 130 260 C 110 240 85 230 70 200 
  C 55 170 45 140 60 110 
  C 75 80 100 60 140 55 
  L 180 50 C 210 48 240 60 260 90 
  C 280 120 285 155 275 185 
  L 260 220 C 250 245 265 270 250 295 
  C 235 320 205 330 175 325 
  L 155 315 C 140 305 145 290 150 280 Z`;

export const MOCK_CARDS: Array<{
  layout: OverlayLayout;
  title: string;
  distance: string;
  time: string;
  pace: string;
  svgPath?: string;
  routeColor?: string;
}> = [
  {
    layout: 'RETRO_CLASSIC',
    title: 'Track Workout',
    distance: '4.8 km',
    time: '22:30',
    pace: '4:41 /km',
    svgPath: TRACK_OVAL_SVG,
    routeColor: '#FF4136',
  },
  {
    layout: 'DOODLE_COLUMN',
    title: 'Trail Run',
    distance: '8.2 km',
    time: '52:15',
    pace: '6:22 /km',
    svgPath: TRAIL_RUN_SVG,
    routeColor: '#2ECC40',
  },
  {
    layout: 'CYBER_CIRCULAR',
    title: 'Neighborhood Loop',
    distance: '5.5 km',
    time: '28:00',
    pace: '5:05 /km',
    svgPath: IRREGULAR_LOOP_SVG,
    routeColor: '#54efea',
  },
  {
    layout: 'CHUNKY_CLASSIC',
    title: 'Marathon Day',
    distance: '42.2 km',
    time: '3:45:22',
    pace: '5:20 /km',
    svgPath: IRREGULAR_LOOP_SVG,
    routeColor: '#FFD700',
  },
  {
    layout: 'GLASS_GRID',
    title: 'Weekend Long',
    distance: '15.5 km',
    time: '1:22:00',
    pace: '5:18 /km',
    svgPath: TRAIL_RUN_SVG,
    routeColor: '#FFFFFF',
  },
  {
    layout: 'GROOVY_WAVY',
    title: 'Track Session',
    distance: '6.4 km',
    time: '28:12',
    pace: '4:24 /km',
    svgPath: TRACK_OVAL_SVG,
    routeColor: '#FF6B35',
  },
];

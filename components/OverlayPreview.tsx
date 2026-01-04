import React, { useRef, useState, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { ActivityStats, OverlayPack, PACK_CONFIG, RouteStyle, ElementEffect, ElementEffectType, StickerOutline, StickerStyle } from '../types';
import type { OverlayVariant } from './OverlayGallery';
import { PACK_TAB_STYLES } from './OverlayGallery';
import { OverlayRenderer, PACK_STYLES } from './OverlayRenderer';
import { getStatsForActivityType, StatItem } from '../utils/activityStats';
import { EFFECT_OPTIONS } from './EffectWrapper';

// Route style options with labels and descriptions
const ROUTE_STYLE_OPTIONS: { id: RouteStyle; label: string; icon: string }[] = [
  { id: 'smooth', label: 'Solid', icon: '━' },
  { id: '3d', label: '3D', icon: '▣' },
  { id: 'glow', label: 'Glow', icon: '◉' },
  { id: 'gradient', label: 'Gradient', icon: '▓' },
  { id: 'dotted', label: 'Dotted', icon: '•••' },
  { id: 'dashed', label: 'Dashed', icon: '---' },
];

interface OverlayPreviewProps {
  activity: ActivityStats;
  pack: OverlayPack;
  variant: OverlayVariant;
  backgroundImage?: string | null;
  imageAspectRatio?: number | null;
  onClose: () => void;
}

// Only show the active packs - OFL licensed fonts only
const ACTIVE_PACKS: OverlayPack[] = [
  OverlayPack.RETRO,
  OverlayPack.GROOVY,
  OverlayPack.DOODLE,
  OverlayPack.CHICLE,
  OverlayPack.ABRIL_FATFACE,
  OverlayPack.SLACKEY,
  OverlayPack.LOBSTER,
  OverlayPack.CYBER,
  OverlayPack.GLITCH,
  OverlayPack.DOKDO,
  OverlayPack.RUBIK_MAZE,
  OverlayPack.GRIDLOCK,
  // New OFL fonts
  OverlayPack.BOCALUPO,
  OverlayPack.CAFE24_MOYAMOYA,
  OverlayPack.KUBO,
  OverlayPack.SPEED_FREAK,
  OverlayPack.BLOCKY,
  OverlayPack.GRITH,
  OverlayPack.LT_RAILWAY,
  OverlayPack.CDT_BIVAQUE,
  OverlayPack.CHICOREE,
  OverlayPack.PIXEL_AWAY,
  OverlayPack.HYRAX,
  OverlayPack.MIDNIGHT_LETTERS,
  OverlayPack.NOSE_TRANSPORT,
  OverlayPack.ORBIX,
  OverlayPack.QUADRIANA,
  OverlayPack.QUANTUM,
  OverlayPack.RUNTTI,
  OverlayPack.TACHYO,
  OverlayPack.XANMONO,
  OverlayPack.CAL_SANS,
];

// Overlay variants for the swiper
// Note: circular and wavy are commented out for future use
const OVERLAY_VARIANTS: { id: OverlayVariant; label: string; icon: string }[] = [
  { id: 'stats-only', label: 'Stats', icon: 'stats' },
  { id: 'hero-stat', label: 'Hero', icon: 'hero' },
  { id: 'route-stats', label: 'Route + Stats', icon: 'route-stats' },
  // { id: 'circular', label: 'Circle', icon: 'circle' },
  // { id: 'wavy', label: 'Wave', icon: 'wave' },
  { id: 'create', label: 'Create', icon: 'create' },
];

// Custom hook for swipe gesture detection
const useSwipeGesture = (onSwipeLeft: () => void, onSwipeRight: () => void) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;
  const maxVerticalDistance = 100; // Ignore if too much vertical movement

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = touchStartY.current !== null ? 
      Math.abs(e.changedTouches[0].clientY - touchStartY.current) : 0;
    
    // Only trigger swipe if horizontal movement is significant and vertical is minimal
    if (Math.abs(deltaX) > minSwipeDistance && deltaY < maxVerticalDistance) {
      if (deltaX > 0) {
        onSwipeLeft(); // Swiped left - go to next
      } else {
        onSwipeRight(); // Swiped right - go to previous
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
  }, [onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchMove, onTouchEnd };
};

// Mini preview component for variant thumbnails
const VariantMiniPreview: React.FC<{ variant: OverlayVariant; color: string }> = ({ variant, color }) => {
  const boxStyle = { backgroundColor: color };
  const lineStyle = { backgroundColor: color };
  
  switch (variant) {
    case 'route-stats':
      return (
        <div className="w-full h-full flex flex-col p-1.5 gap-1">
          {/* Route squiggle */}
          <div className="flex-1 flex items-center justify-center">
            <svg viewBox="0 0 30 20" className="w-full h-full" style={{ stroke: color, fill: 'none', strokeWidth: 2 }}>
              <path d="M3 15 Q8 5, 15 10 T27 5" />
            </svg>
          </div>
          {/* Stats row */}
          <div className="flex gap-1 justify-center">
            <div className="w-3 h-2 rounded-sm" style={boxStyle} />
            <div className="w-3 h-2 rounded-sm" style={boxStyle} />
            <div className="w-3 h-2 rounded-sm" style={boxStyle} />
          </div>
        </div>
      );
    case 'stats-only':
      return (
        <div className="w-full h-full flex flex-col p-1.5 gap-0.5">
          {/* Stats on top */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-6 h-1.5 rounded-sm" style={boxStyle} />
            <div className="w-5 h-1.5 rounded-sm opacity-80" style={boxStyle} />
            <div className="w-4 h-1.5 rounded-sm opacity-60" style={boxStyle} />
          </div>
          {/* Route at bottom */}
          <div className="flex-1 flex items-center justify-center">
            <svg viewBox="0 0 30 18" className="w-full h-full" style={{ stroke: color, fill: 'none', strokeWidth: 2 }}>
              <path d="M3 14 Q8 4, 15 9 T27 4" />
            </svg>
          </div>
        </div>
      );
    case 'route-only':
      return (
        <div className="w-full h-full flex items-center justify-center p-1">
          <svg viewBox="0 0 30 30" className="w-full h-full" style={{ stroke: color, fill: 'none', strokeWidth: 2.5 }}>
            <path d="M5 25 Q10 5, 15 15 T25 5" />
          </svg>
        </div>
      );
    case 'title-only':
      return (
        <div className="w-full h-full flex items-center justify-center p-1.5">
          <div className="w-8 h-2.5 rounded-sm" style={boxStyle} />
        </div>
      );
    case 'full-data':
      return (
        <div className="w-full h-full flex flex-col items-center justify-end gap-0.5 p-1.5 pb-2">
          <div className="flex gap-1 items-baseline">
            <div className="w-4 h-1.5 rounded-sm" style={boxStyle} />
            <div className="w-2 h-1 rounded-sm opacity-60" style={boxStyle} />
          </div>
          <div className="flex gap-1 items-baseline">
            <div className="w-3 h-1.5 rounded-sm" style={boxStyle} />
            <div className="w-2 h-1 rounded-sm opacity-60" style={boxStyle} />
          </div>
          <div className="flex gap-1 items-baseline">
            <div className="w-5 h-1.5 rounded-sm" style={boxStyle} />
            <div className="w-2 h-1 rounded-sm opacity-60" style={boxStyle} />
          </div>
        </div>
      );
    case 'create':
      return (
        <div className="w-full h-full flex items-center justify-center p-1">
          {/* Plus icon */}
          <div className="relative w-6 h-6">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-1.5 rounded-sm" style={boxStyle} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-5 rounded-sm" style={boxStyle} />
          </div>
        </div>
      );
    case 'scattered':
      return (
        <div className="w-full h-full relative p-1">
          {/* Route in center */}
          <svg viewBox="0 0 30 30" className="absolute inset-0 m-auto w-3/4 h-3/4" style={{ stroke: color, fill: 'none', strokeWidth: 2 }}>
            <path d="M8 22 Q12 10, 18 15 T25 8" />
          </svg>
          {/* Scattered stat boxes */}
          <div className="absolute top-1 left-1 w-3 h-1.5 rounded-sm" style={boxStyle} />
          <div className="absolute top-2 right-1 w-2.5 h-1.5 rounded-sm opacity-80" style={boxStyle} />
          <div className="absolute bottom-1 left-2 w-2.5 h-1.5 rounded-sm opacity-70" style={boxStyle} />
          <div className="absolute bottom-2 right-1 w-3 h-1.5 rounded-sm" style={boxStyle} />
        </div>
      );
    case 'hero-stat':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1.5">
          {/* Large hero stat */}
          <div className="w-7 h-3 rounded-sm" style={boxStyle} />
          {/* Smaller supporting stats */}
          <div className="flex gap-1">
            <div className="w-2 h-1 rounded-sm opacity-60" style={boxStyle} />
            <div className="w-2 h-1 rounded-sm opacity-60" style={boxStyle} />
            <div className="w-2 h-1 rounded-sm opacity-60" style={boxStyle} />
          </div>
        </div>
      );
    case 'circular':
      return (
        <div className="w-full h-full flex items-center justify-center p-1">
          {/* Circle of stats */}
          <div className="relative w-8 h-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-1 rounded-sm" style={boxStyle} />
            <div className="absolute top-1.5 right-0 w-2 h-1 rounded-sm opacity-80" style={boxStyle} />
            <div className="absolute bottom-1.5 right-0 w-2 h-1 rounded-sm opacity-60" style={boxStyle} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1 rounded-sm opacity-80" style={boxStyle} />
            <div className="absolute bottom-1.5 left-0 w-2 h-1 rounded-sm opacity-60" style={boxStyle} />
            <div className="absolute top-1.5 left-0 w-2 h-1 rounded-sm" style={boxStyle} />
          </div>
        </div>
      );
    case 'wavy':
      return (
        <div className="w-full h-full flex items-center justify-center gap-0.5 p-1">
          {/* Wavy line of stats */}
          <div className="w-1.5 h-2 rounded-sm" style={{ ...boxStyle, transform: 'translateY(2px)' }} />
          <div className="w-1.5 h-2.5 rounded-sm" style={{ ...boxStyle, transform: 'translateY(-2px)' }} />
          <div className="w-1.5 h-2 rounded-sm opacity-80" style={{ ...boxStyle, transform: 'translateY(1px)' }} />
          <div className="w-1.5 h-2.5 rounded-sm opacity-80" style={{ ...boxStyle, transform: 'translateY(-3px)' }} />
          <div className="w-1.5 h-2 rounded-sm opacity-60" style={{ ...boxStyle, transform: 'translateY(2px)' }} />
        </div>
      );
    default:
      return null;
  }
};

// HSL to Hex conversion
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// HSV to Hex conversion (for square picker)
function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Hex to HSV conversion
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  
  return { h, s, v };
}

// Color picker component - square gradient with hue slider
const ColorSpectrum: React.FC<{
  value: string | undefined;
  onChange: (color: string | undefined) => void;
  defaultColor: string;
}> = ({ value, onChange, defaultColor }) => {
  const squareRef = React.useRef<HTMLDivElement>(null);
  const hueRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingSquare, setIsDraggingSquare] = React.useState(false);
  const [isDraggingHue, setIsDraggingHue] = React.useState(false);
  
  // HSV state
  const displayColor = value || defaultColor;
  const initialHsv = hexToHsv(displayColor);
  const [hue, setHue] = React.useState(initialHsv.h);
  const [saturation, setSaturation] = React.useState(initialHsv.s);
  const [brightness, setBrightness] = React.useState(initialHsv.v);

  const isAuto = value === undefined;

  // Update color when HSV changes
  const updateColor = (h: number, s: number, v: number) => {
    onChange(hsvToHex(h, s, v));
  };

  // Handle square (saturation/brightness) interaction
  const handleSquareInteraction = (clientX: number, clientY: number) => {
    if (!squareRef.current) return;
    const rect = squareRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    const s = (x / rect.width) * 100;
    const v = 100 - (y / rect.height) * 100;
    setSaturation(s);
    setBrightness(v);
    updateColor(hue, s, v);
  };

  // Handle hue slider interaction
  const handleHueInteraction = (clientY: number) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    const h = (y / rect.height) * 360;
    setHue(h);
    updateColor(h, saturation, brightness);
  };

  return (
    <div className="space-y-2">
      {/* Main picker area - constrained height for mobile */}
      <div className="flex gap-3" style={{ height: 'min(200px, 35vh)' }}>
        {/* Saturation/Brightness - full width */}
        <div
          ref={squareRef}
          className="flex-1 h-full rounded-lg cursor-crosshair touch-none relative overflow-hidden"
          style={{
            background: `
              linear-gradient(to top, #000, transparent),
              linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
            `,
          }}
          onPointerDown={(e) => {
            setIsDraggingSquare(true);
            e.currentTarget.setPointerCapture(e.pointerId);
            handleSquareInteraction(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (!isDraggingSquare) return;
            handleSquareInteraction(e.clientX, e.clientY);
          }}
          onPointerUp={() => setIsDraggingSquare(false)}
        >
          {/* Position indicator */}
          {!isAuto && (
            <div
              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none"
              style={{
                left: `calc(${saturation}% - 8px)`,
                top: `calc(${100 - brightness}% - 8px)`,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
          )}
        </div>
        
        {/* Hue slider (vertical) */}
        <div
          ref={hueRef}
          className="w-6 rounded-lg cursor-pointer touch-none relative"
          style={{
            background: `linear-gradient(to bottom, 
              hsl(0, 100%, 50%),
              hsl(60, 100%, 50%),
              hsl(120, 100%, 50%),
              hsl(180, 100%, 50%),
              hsl(240, 100%, 50%),
              hsl(300, 100%, 50%),
              hsl(360, 100%, 50%)
            )`,
          }}
          onPointerDown={(e) => {
            setIsDraggingHue(true);
            e.currentTarget.setPointerCapture(e.pointerId);
            handleHueInteraction(e.clientY);
          }}
          onPointerMove={(e) => {
            if (!isDraggingHue) return;
            handleHueInteraction(e.clientY);
          }}
          onPointerUp={() => setIsDraggingHue(false)}
        >
          {/* Hue indicator */}
          <div
            className="absolute left-0 right-0 h-2 rounded-sm border-2 border-white pointer-events-none"
            style={{
              top: `calc(${(hue / 360) * 100}% - 4px)`,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      </div>
      
      {/* Quick options row - just white, black and current color */}
      <div className="flex gap-2 items-center justify-center">
        <button
          onClick={() => onChange('#FFFFFF')}
          className={`w-8 h-8 rounded-lg bg-white border-2 transition-all ${value === '#FFFFFF' ? 'border-[#CCFF00] scale-105' : 'border-zinc-600'}`}
        />
        <button
          onClick={() => onChange('#000000')}
          className={`w-8 h-8 rounded-lg bg-black border-2 transition-all ${value === '#000000' ? 'border-[#CCFF00] scale-105' : 'border-zinc-600'}`}
        />
        {/* Current color preview */}
        <div 
          className="w-8 h-8 rounded-lg border-2 border-zinc-600"
          style={{ backgroundColor: displayColor }}
        />
      </div>
    </div>
  );
};

export const OverlayPreview: React.FC<OverlayPreviewProps> = ({
  activity,
  pack: initialPack,
  variant: initialVariant,
  backgroundImage: initialBackgroundImage,
  imageAspectRatio: initialAspectRatio,
  onClose,
}) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(initialBackgroundImage || null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(initialAspectRatio || null);
  
  // Lock preview container size when editing to prevent resize when panels open
  const [lockedPreviewSize, setLockedPreviewSize] = useState<{ width: number; height: number } | null>(null);
  
  // Editable state
  const [currentPack, setCurrentPack] = useState<OverlayPack>(initialPack);
  const [currentVariant, setCurrentVariant] = useState<OverlayVariant>(initialVariant);
  const [customColor, setCustomColor] = useState<string | undefined>(undefined);
  const [customRouteColor, setCustomRouteColor] = useState<string | undefined>(undefined);
  const [routeStyle, setRouteStyle] = useState<RouteStyle>('smooth');
  const [showLabels, setShowLabels] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerMode, setColorPickerMode] = useState<'text' | 'route' | 'statsOutline' | 'routeOutline'>('text');
  const [showStatsEditor, setShowStatsEditor] = useState(false);
  const [showStatsListEditor, setShowStatsListEditor] = useState(false);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const [showEffectsEditor, setShowEffectsEditor] = useState(false);
  
  // Visual effects state
  const [statsEffect, setStatsEffect] = useState<ElementEffect>({ type: 'none', intensity: 50 });
  const [routeEffect, setRouteEffect] = useState<ElementEffect>({ type: 'none', intensity: 50 });
  const [effectTarget, setEffectTarget] = useState<'stats' | 'route'>('stats');
  
  // Sticker outline state
  const [statsSticker, setStatsSticker] = useState<StickerOutline>({ enabled: false, thickness: 3, color: '#FFFFFF' });
  const [routeSticker, setRouteSticker] = useState<StickerOutline>({ enabled: false, thickness: 3, color: '#FFFFFF' });

  // Photo upload handlers - with resize for performance
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoadingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        
        // Load and optionally resize the image for performance
        const img = new Image();
        img.onload = () => {
          const ratio = img.width / img.height;
          setImageAspectRatio(ratio);
          
          // Resize if image is too large (max 2000px on longest side)
          const MAX_SIZE = 2000;
          if (img.width > MAX_SIZE || img.height > MAX_SIZE) {
            const canvas = document.createElement('canvas');
            let newWidth = img.width;
            let newHeight = img.height;
            
            if (img.width > img.height) {
              newWidth = MAX_SIZE;
              newHeight = (img.height / img.width) * MAX_SIZE;
            } else {
              newHeight = MAX_SIZE;
              newWidth = (img.width / img.height) * MAX_SIZE;
            }
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, newWidth, newHeight);
            setBackgroundImage(canvas.toDataURL('image/jpeg', 0.9));
          } else {
            setBackgroundImage(dataUrl);
          }
          setIsLoadingImage(false);
        };
        img.onerror = () => {
          setIsLoadingImage(false);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setBackgroundImage(null);
    setImageAspectRatio(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Stats management - needed for per-variant state initialization
  const allAvailableStats = getStatsForActivityType(activity);
  
  // Default settings per variant type
  const getDefaultVariantSettings = (variant: OverlayVariant) => {
    return {
      showRoute: true,
      showTitle: false,
      showDate: false,
      enabledStats: allAvailableStats.filter(s => s.key !== 'date').slice(0, 3).map(s => s.key),
      createdElements: [] as string[],
    };
  };
  
  // Per-variant state - each overlay has its own independent settings
  type VariantSettings = {
    showRoute: boolean;
    showTitle: boolean;
    showDate: boolean;
    enabledStats: string[];
    createdElements: string[];
  };
  
  const [variantSettings, setVariantSettings] = useState<Record<OverlayVariant, VariantSettings>>(() => {
    const variants: OverlayVariant[] = ['stats-only', 'route-stats', 'hero-stat', 'create'];
    const initial: Partial<Record<OverlayVariant, VariantSettings>> = {};
    variants.forEach(v => {
      initial[v] = getDefaultVariantSettings(v);
    });
    return initial as Record<OverlayVariant, VariantSettings>;
  });
  
  // Get current variant's settings
  const currentSettings = variantSettings[currentVariant];
  const showRoute = currentSettings.showRoute;
  const showTitle = currentSettings.showTitle;
  const showDate = currentSettings.showDate;
  const enabledStats = currentSettings.enabledStats;
  const createdElements = currentSettings.createdElements;
  
  // Setters that update the current variant's settings
  const setShowRoute = (value: boolean) => {
    setVariantSettings(prev => ({
      ...prev,
      [currentVariant]: { ...prev[currentVariant], showRoute: value }
    }));
  };
  
  const setShowTitle = (value: boolean) => {
    setVariantSettings(prev => ({
      ...prev,
      [currentVariant]: { ...prev[currentVariant], showTitle: value }
    }));
  };
  
  const setShowDate = (value: boolean) => {
    setVariantSettings(prev => ({
      ...prev,
      [currentVariant]: { ...prev[currentVariant], showDate: value }
    }));
  };
  
  const setEnabledStats = (value: string[] | ((prev: string[]) => string[])) => {
    setVariantSettings(prev => ({
      ...prev,
      [currentVariant]: { 
        ...prev[currentVariant], 
        enabledStats: typeof value === 'function' ? value(prev[currentVariant].enabledStats) : value 
      }
    }));
  };
  
  const setCreatedElements = (value: string[] | ((prev: string[]) => string[])) => {
    setVariantSettings(prev => ({
      ...prev,
      [currentVariant]: { 
        ...prev[currentVariant], 
        createdElements: typeof value === 'function' ? value(prev[currentVariant].createdElements) : value 
      }
    }));
  };
  
  const [activityTitle, setActivityTitle] = useState(activity.title || 'Afternoon Run');
  
  // Create mode - UI state (not per-variant)
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [editingElementType, setEditingElementType] = useState<string | null>(null);
  
  // Carousel scroll ref
  const carouselRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Index-based navigation for swipe
  const currentPackIndex = ACTIVE_PACKS.indexOf(currentPack);
  const currentVariantIndex = OVERLAY_VARIANTS.findIndex(v => v.id === currentVariant);
  
  // Handle carousel scroll to update current variant - debounced for stability
  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current || isScrollingRef.current) return;
    
    // Debounce the scroll detection
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (!carouselRef.current) return;
      
      const container = carouselRef.current;
      const children = container.children;
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      
      let bestIndex = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const childRect = child.getBoundingClientRect();
        const childCenter = childRect.left + childRect.width / 2;
        const distance = Math.abs(containerCenter - childCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          bestIndex = i;
        }
      }
      
      if (bestIndex !== currentVariantIndex) {
        setCurrentVariant(OVERLAY_VARIANTS[bestIndex].id);
      }
    }, 100);
  }, [currentVariantIndex]);
  
  // Scroll to current variant when it changes (e.g., when pack changes)
  useEffect(() => {
    if (!carouselRef.current) return;
    
    const container = carouselRef.current;
    const targetChild = container.children[currentVariantIndex] as HTMLElement;
    
    if (targetChild) {
      isScrollingRef.current = true;
      
      // Scroll to center the target element
      const containerWidth = container.offsetWidth;
      const childWidth = targetChild.offsetWidth;
      const childLeft = targetChild.offsetLeft;
      const targetScroll = childLeft - (containerWidth - childWidth) / 2;
      
      container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
      
      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 350);
    }
  }, [currentVariantIndex, currentPack]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  
  // Legacy swipe handlers kept for pack switching at edges
  const goToNextVariant = useCallback(() => {
    const nextIndex = currentVariantIndex + 1;
    if (nextIndex < OVERLAY_VARIANTS.length) {
      setCurrentVariant(OVERLAY_VARIANTS[nextIndex].id);
    } else if (currentPackIndex < ACTIVE_PACKS.length - 1) {
      // Move to next pack, first variant
      setCurrentPack(ACTIVE_PACKS[currentPackIndex + 1]);
      setCurrentVariant(OVERLAY_VARIANTS[0].id);
      setCustomColor(undefined);
      setCustomRouteColor(undefined);
    }
  }, [currentVariantIndex, currentPackIndex]);
  
  const goToPrevVariant = useCallback(() => {
    const prevIndex = currentVariantIndex - 1;
    if (prevIndex >= 0) {
      setCurrentVariant(OVERLAY_VARIANTS[prevIndex].id);
    } else if (currentPackIndex > 0) {
      // Move to previous pack, last variant
      setCurrentPack(ACTIVE_PACKS[currentPackIndex - 1]);
      setCurrentVariant(OVERLAY_VARIANTS[OVERLAY_VARIANTS.length - 1].id);
      setCustomColor(undefined);
      setCustomRouteColor(undefined);
    }
  }, [currentVariantIndex, currentPackIndex]);
  
  const swipeHandlers = useSwipeGesture(goToNextVariant, goToPrevVariant);
  
  // Helper to lock preview size before opening a panel
  const lockPreviewSize = () => {
    if (previewContainerRef.current && !lockedPreviewSize) {
      const rect = previewContainerRef.current.getBoundingClientRect();
      setLockedPreviewSize({ width: rect.width, height: rect.height });
    }
  };
  
  // Helper to close all editor panels and unlock preview size
  const closeAllPanels = () => {
    setShowStatsEditor(false);
    setShowStatsListEditor(false);
    setShowMapEditor(false);
    setShowTitleEditor(false);
    setShowColorPicker(false);
    setShowCreateMenu(false);
    setShowEffectsEditor(false);
    setLockedPreviewSize(null); // Unlock when all panels closed
  };
  
  // Add element to create canvas
  const addCreateElement = (elementType: string) => {
    if (!createdElements.includes(elementType)) {
      setCreatedElements(prev => [...prev, elementType]);
    }
    setShowCreateMenu(false);
  };
  
  // Remove element from create canvas
  const removeCreateElement = (elementType: string) => {
    setCreatedElements(prev => prev.filter(e => e !== elementType));
    closeAllPanels();
    setEditingElementType(null);
  };

  const toggleStat = (key: string) => {
    setEnabledStats(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!exportRef.current) return;
    
    setIsExporting(true);
    
    try {
      // Wait for all fonts to be loaded before capturing
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: undefined,
        skipFonts: false,
      });
      
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `overlay-${Date.now()}.png`, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Activity Overlay',
            });
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 2000);
            setIsExporting(false);
            return;
          }
        } catch (shareError) {
          console.log('Share failed, falling back to download:', shareError);
        }
      }
      
      const link = document.createElement('a');
      link.download = `overlay-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header with back button and save only */}
      <div className="flex items-center justify-between px-4 pt-14 pb-3 bg-zinc-900/90">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        
        {/* Spacer */}
        <div className="flex-1" />
        
        {/* Save button only */}
        <button
          onClick={handleSave}
          disabled={isExporting}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
            exportSuccess
              ? 'bg-green-500 border-green-500 text-white'
              : isExporting
              ? 'bg-zinc-700 border-zinc-600 text-zinc-400 cursor-wait'
              : 'bg-[#CCFF00] border-[#CCFF00] text-black hover:bg-[#b8e600] active:scale-95'
          }`}
          title="Save to Photos"
        >
          {exportSuccess ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          ) : isExporting ? (
            <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          )}
        </button>
      </div>
      
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
      
      {/* Toolbar buttons - Labels, Map toggle, Color, Photo */}
      <div className="bg-zinc-900/60 border-b border-white/5 px-4 py-2">
        <div className="flex justify-center gap-2">
          {/* Photo upload/remove button */}
          <button
            onClick={backgroundImage ? handleRemovePhoto : handlePhotoButtonClick}
            disabled={isLoadingImage}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              isLoadingImage
                ? 'bg-zinc-800 text-zinc-400 border-white/10 cursor-wait'
                : backgroundImage 
                  ? 'bg-white text-black border-white' 
                  : 'bg-zinc-800 text-zinc-400 border-white/10 hover:bg-zinc-700'
            }`}
            title={isLoadingImage ? 'Loading...' : backgroundImage ? 'Remove photo' : 'Add photo'}
          >
            {isLoadingImage ? (
              <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            ) : backgroundImage ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            )}
          </button>
          
          {/* Labels toggle (T button) */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              showLabels 
                ? 'bg-white text-black border-white' 
                : 'bg-zinc-800 text-zinc-400 border-white/10 hover:bg-zinc-700'
            }`}
            title={showLabels ? 'Hide labels' : 'Show labels'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7V4h16v3"/>
              <path d="M9 20h6"/>
              <path d="M12 4v16"/>
            </svg>
          </button>
          
          {/* Map/Route toggle */}
          <button
            onClick={() => setShowRoute(!showRoute)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              showRoute 
                ? 'bg-white text-black border-white' 
                : 'bg-zinc-800 text-zinc-400 border-white/10 hover:bg-zinc-700'
            }`}
            title={showRoute ? 'Hide route' : 'Show route'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/>
              <path d="M9 3v15"/>
              <path d="M15 6v15"/>
            </svg>
          </button>
          
          {/* Unified Color picker toggle */}
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowStatsEditor(false);
              setShowStatsListEditor(false);
              setShowMapEditor(false);
            }}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              showColorPicker
                ? 'bg-white text-black border-white' 
                : 'bg-zinc-800 text-zinc-400 border-white/10 hover:bg-zinc-700'
            }`}
            title="Colors"
          >
            {/* Color wheel / palette icon with gradient preview */}
            <div className="w-5 h-5 rounded-full border-2 border-zinc-400 overflow-hidden relative">
              <div 
                className="absolute inset-0"
                style={{ 
                  background: `conic-gradient(from 0deg, 
                    ${customColor || PACK_STYLES[currentPack]?.color || '#fff'} 0deg 180deg,
                    ${customRouteColor || PACK_STYLES[currentPack]?.routeColor || '#fff'} 180deg 360deg
                  )`,
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Preview Area - horizontal carousel */}
      <div 
        className="flex-1 flex flex-col overflow-hidden relative"
        onClick={() => { closeAllPanels(); setEditingElementType(null); }}
      >
        {/* Pack name indicator at top */}
        <div className="flex justify-center py-2">
          <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm">
            <span 
              className="text-xs font-bold uppercase tracking-wider"
              style={{ 
                fontFamily: PACK_TAB_STYLES[currentPack]?.font,
                color: PACK_TAB_STYLES[currentPack]?.color || '#fff',
              }}
            >
              {PACK_CONFIG[currentPack].label}
            </span>
          </div>
        </div>
        
        {/* Horizontal scrolling carousel */}
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="flex-1 flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar items-center"
          style={{ 
            scrollBehavior: 'smooth', 
            WebkitOverflowScrolling: 'touch',
            scrollPaddingLeft: '6%',
            scrollPaddingRight: '6%',
            paddingLeft: '6%',
            paddingRight: '6%',
          }}
        >
          {OVERLAY_VARIANTS.map((variant, index) => {
            const isActive = index === currentVariantIndex;
            const settings = variantSettings[variant.id];
            
            return (
              <div
                key={variant.id}
                className={`flex-shrink-0 snap-center transition-all duration-200 ${isActive ? 'scale-100 opacity-100' : 'scale-[0.92] opacity-50'}`}
                style={{ 
                  width: '88%',
                  maxWidth: '400px', // Limit width on larger screens like iPad
                }}
              >
                <div 
                  ref={isActive ? previewContainerRef : undefined}
                  className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 w-full"
                  style={{
                    aspectRatio: imageAspectRatio ?? 9/16,
                    maxHeight: 'calc(100vh - 280px)', // Ensure it fits within viewport
                  }}
                >
                  {/* Checkerboard background */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #2a2a2a 25%, transparent 25%), 
                        linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #2a2a2a 75%), 
                        linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)
                      `,
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                      backgroundColor: '#1a1a1a',
                    }}
                  />
                  
                  {/* Background image if provided */}
                  {backgroundImage && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                  )}
                  
                  {/* The actual overlay (export ref only on active) */}
                  <div ref={isActive ? exportRef : undefined} className="absolute inset-0">
                    {/* Include background in export */}
                    {backgroundImage && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                      />
                    )}
                    <OverlayRenderer
                      activity={activity}
                      pack={currentPack}
                      variant={variant.id}
                      customColor={customColor}
                      customRouteColor={customRouteColor}
                      customRouteStyle={routeStyle}
                      showLabels={showLabels}
                      showRoute={settings?.showRoute ?? true}
                      enabledStats={(settings?.enabledStats ?? []).filter(s => s !== 'date')}
                      showTitle={settings?.showTitle ?? false}
                      activityTitle={activityTitle}
                      showDate={settings?.showDate ?? false}
                      activityDate={activity.date}
                      isPreview={!isActive}
                      isEditing={isActive}
                      createdElements={settings?.createdElements ?? []}
                      onRemoveElement={isActive ? removeCreateElement : undefined}
                      statsEffect={statsEffect}
                      routeEffect={routeEffect}
                      statsSticker={statsSticker}
                      routeSticker={routeSticker}
                      onStatsTap={isActive ? (elementType) => {
                        lockPreviewSize();
                        setShowStatsEditor(true);
                        setShowStatsListEditor(false);
                        setShowMapEditor(false);
                        setShowTitleEditor(false);
                        setShowColorPicker(false);
                        setShowCreateMenu(false);
                        setEditingElementType(elementType || 'stats');
                      } : undefined}
                      onRouteTap={isActive ? () => {
                        lockPreviewSize();
                        setShowStatsEditor(false);
                        setShowStatsListEditor(false);
                        setShowMapEditor(true);
                        setShowTitleEditor(false);
                        setShowColorPicker(false);
                        setShowCreateMenu(false);
                        setEditingElementType('route');
                      } : undefined}
                      onTitleTap={isActive ? () => {
                        lockPreviewSize();
                        setShowStatsEditor(false);
                        setShowStatsListEditor(false);
                        setShowMapEditor(false);
                        setShowTitleEditor(true);
                        setShowColorPicker(false);
                        setShowCreateMenu(false);
                        setEditingElementType('title');
                      } : undefined}
                    />
                  </div>
                  
                  {/* Floating + button - only on active */}
                  {isActive && (
                    <button
                      onClick={(e) => { e.stopPropagation(); closeAllPanels(); setShowCreateMenu(true); setEditingElementType(null); }}
                      className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shadow-lg z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Variant dots - below carousel */}
        <div className="flex justify-center gap-1.5 py-3">
          {OVERLAY_VARIANTS.map((v, i) => (
            <div
              key={v.id}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentVariantIndex ? 'bg-white scale-110' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom section - either editor panel OR default controls */}
      <div className="bg-zinc-900/95 border-t border-white/10">
        {/* Stats Menu Panel */}
        {showStatsEditor ? (
          <div className="p-4 max-h-[35vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                {currentVariant === 'create' && editingElementType && editingElementType !== 'stats' 
                  ? `Edit ${allAvailableStats.find(s => s.key === editingElementType)?.label || 'Stat'}` 
                  : 'Edit Stats'}
              </h3>
              <button onClick={() => { setShowStatsEditor(false); setEditingElementType(null); }} className="text-zinc-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            {/* Quick actions row */}
            <div className="flex gap-2 mb-3">
              {/* Only show stats list picker if NOT in create mode */}
              {currentVariant !== 'create' && (
                <button
                  onClick={() => { setShowStatsEditor(false); setShowStatsListEditor(true); }}
                  className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-800 border border-zinc-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
                    <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
                  </svg>
                  <span className="text-xs text-zinc-300">{enabledStats.length} stats</span>
                </button>
              )}
              <button
                onClick={() => { setShowStatsEditor(false); setColorPickerMode('text'); setShowColorPicker(true); }}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-800 border border-zinc-700"
              >
                <div className="w-4 h-4 rounded-full border-2 border-zinc-600" style={{ backgroundColor: customColor || PACK_STYLES[currentPack]?.color || '#fff' }} />
                <span className="text-xs text-zinc-300">Color</span>
              </button>
              <button
                onClick={() => setStatsSticker(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all ${
                  statsSticker.enabled 
                    ? 'bg-[#CCFF00]/20 border border-[#CCFF00]/50' 
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
                <span className={`text-xs ${statsSticker.enabled ? 'text-white' : 'text-zinc-400'}`}>Outline</span>
              </button>
              {/* Remove button for create mode */}
              {currentVariant === 'create' && editingElementType && (
                <button
                  onClick={() => removeCreateElement(editingElementType)}
                  className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-500/20 border border-red-500/50 hover:bg-red-500/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                  <span className="text-xs text-red-400">Remove</span>
                </button>
              )}
            </div>
            
            {/* Outline options - only show when enabled */}
            {statsSticker.enabled && (
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowStatsEditor(false); setColorPickerMode('statsOutline'); setShowColorPicker(true); }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-800 border border-zinc-700"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-zinc-600" style={{ backgroundColor: statsSticker.color }} />
                  <span className="text-xs text-zinc-400">Outline Color</span>
                </button>
                <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800 border border-zinc-700">
                  <span className="text-[10px] text-zinc-500">Size</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={statsSticker.thickness}
                    onChange={(e) => setStatsSticker(prev => ({ ...prev, thickness: parseInt(e.target.value) }))}
                    className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]"
                  />
                </div>
              </div>
            )}
          </div>
        ) : showStatsListEditor ? (
          <div className="p-4 max-h-[45vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Select Stats</h3>
              <button onClick={() => { setShowStatsListEditor(false); setEditingElementType(null); }} className="text-zinc-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {allAvailableStats.map((stat) => {
                const isEnabled = enabledStats.includes(stat.key);
                return (
                  <button
                    key={stat.key}
                    onClick={() => toggleStat(stat.key)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isEnabled ? 'bg-[#CCFF00]/20 border border-[#CCFF00]/50' : 'bg-zinc-800 border border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isEnabled ? 'bg-[#CCFF00] border-[#CCFF00]' : 'border-zinc-600'}`}>
                        {isEnabled && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                      </div>
                      <span className={`text-sm font-medium ${isEnabled ? 'text-white' : 'text-zinc-400'}`}>{stat.label}</span>
                    </div>
                    <span className={`text-sm ${isEnabled ? 'text-[#CCFF00]' : 'text-zinc-500'}`}>{stat.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : showMapEditor ? (
          <div className="p-4 max-h-[35vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Edit Route</h3>
              <button onClick={() => { setShowMapEditor(false); setEditingElementType(null); }} className="text-zinc-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            {/* Visibility, Color, and Outline row */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setShowRoute(!showRoute)}
                className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all ${showRoute ? 'bg-[#CCFF00]/20 border border-[#CCFF00]/50' : 'bg-zinc-800 border border-zinc-700'}`}
              >
                <span className={`text-xs ${showRoute ? 'text-white' : 'text-zinc-400'}`}>{showRoute ? 'Visible' : 'Hidden'}</span>
              </button>
              <button
                onClick={() => { setShowMapEditor(false); setColorPickerMode('route'); setShowColorPicker(true); }}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-800 border border-zinc-700"
              >
                <div className="w-4 h-4 rounded-full border-2 border-zinc-600" style={{ backgroundColor: customRouteColor || PACK_STYLES[currentPack]?.routeColor || '#fff' }} />
                <span className="text-xs text-zinc-300">Color</span>
              </button>
              <button
                onClick={() => setRouteSticker({ ...routeSticker, enabled: !routeSticker.enabled })}
                className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all ${
                  routeSticker.enabled
                    ? 'bg-[#CCFF00]/20 border border-[#CCFF00]/50'
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
                <span className={`text-xs ${routeSticker.enabled ? 'text-white' : 'text-zinc-400'}`}>Outline</span>
              </button>
              {/* Remove button for create mode */}
              {currentVariant === 'create' && editingElementType === 'route' && (
                <button
                  onClick={() => removeCreateElement('route')}
                  className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-500/20 border border-red-500/50 hover:bg-red-500/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                  <span className="text-xs text-red-400">Remove</span>
                </button>
              )}
            </div>
            
            {/* Outline options - only show when enabled */}
            {routeSticker.enabled && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => { setShowMapEditor(false); setColorPickerMode('routeOutline'); setShowColorPicker(true); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700"
                >
                  <div className="w-4 h-4 rounded-full border border-zinc-600" style={{ backgroundColor: routeSticker.color }} />
                  <span className="text-xs text-zinc-400">Outline Color</span>
                </button>
                <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800 border border-zinc-700">
                  <span className="text-[10px] text-zinc-500">Size</span>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={routeSticker.thickness}
                    onChange={(e) => setRouteSticker({ ...routeSticker, thickness: parseInt(e.target.value) })}
                    className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]"
                  />
                </div>
              </div>
            )}
            
            {/* Route Style selector */}
            <div className="mb-2">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Style</h4>
              <div className="grid grid-cols-3 gap-2">
                {ROUTE_STYLE_OPTIONS.map((style) => {
                  const isActive = routeStyle === style.id;
                  const previewColor = customRouteColor || PACK_STYLES[currentPack]?.routeColor || '#fff';
                  return (
                    <button
                      key={style.id}
                      onClick={() => setRouteStyle(style.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-[#CCFF00]/20 border border-[#CCFF00]/50' 
                          : 'bg-zinc-800 border border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      {/* Style preview */}
                      <div className="w-full h-4 flex items-center justify-center overflow-hidden">
                        {style.id === 'smooth' && (
                          <div className="w-full h-1 rounded-full" style={{ backgroundColor: previewColor }} />
                        )}
                        {style.id === '3d' && (
                          <div className="w-full h-2 relative">
                            <div className="absolute top-1 left-0.5 w-full h-1 rounded-full bg-black/50" />
                            <div className="absolute top-0 left-0 w-full h-1 rounded-full" style={{ backgroundColor: previewColor }} />
                          </div>
                        )}
                        {style.id === 'glow' && (
                          <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: previewColor, boxShadow: `0 0 6px ${previewColor}` }} />
                        )}
                        {style.id === 'gradient' && (
                          <div className="w-full h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)' }} />
                        )}
                        {style.id === 'dotted' && (
                          <div className="flex gap-1">
                            {[0,1,2,3,4].map(i => (
                              <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: previewColor }} />
                            ))}
                          </div>
                        )}
                        {style.id === 'dashed' && (
                          <div className="flex gap-1">
                            {[0,1,2].map(i => (
                              <div key={i} className="w-4 h-1 rounded-sm" style={{ backgroundColor: previewColor }} />
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] ${isActive ? 'text-white' : 'text-zinc-400'}`}>{style.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : showTitleEditor ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Edit Title</h3>
              <button onClick={() => { setShowTitleEditor(false); setEditingElementType(null); }} className="text-zinc-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <input
              type="text"
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
              placeholder="Enter title..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#CCFF00] mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowTitle(!showTitle)}
                className={`flex-1 flex items-center justify-between p-3 rounded-xl transition-all ${showTitle ? 'bg-[#CCFF00]/20 border border-[#CCFF00]/50' : 'bg-zinc-800 border border-zinc-700'}`}
              >
                <span className={`text-sm font-medium ${showTitle ? 'text-white' : 'text-zinc-400'}`}>Show Title</span>
                <div className={`w-10 h-6 rounded-full transition-all relative ${showTitle ? 'bg-[#CCFF00]' : 'bg-zinc-600'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showTitle ? 'left-5' : 'left-1'}`} />
                </div>
              </button>
              {/* Remove button for create mode */}
              {currentVariant === 'create' && editingElementType === 'title' && (
                <button
                  onClick={() => removeCreateElement('title')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/20 border border-red-500/50 hover:bg-red-500/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                  <span className="text-sm text-red-400">Remove</span>
                </button>
              )}
            </div>
          </div>
        ) : showCreateMenu ? (
          <div className="max-h-[50vh] flex flex-col">
            {/* Sticky header */}
            <div className="flex items-center justify-between p-4 pb-3 bg-zinc-900 sticky top-0 z-10 border-b border-zinc-800">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Add Element</h3>
              <button onClick={() => setShowCreateMenu(false)} className="text-zinc-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            {/* Scrollable content */}
            <div className="overflow-y-auto p-4 pt-2 space-y-2">
              {/* Title option */}
              {(() => {
                const isTitleAdded = currentVariant === 'create' ? createdElements.includes('title') : showTitle;
                return (
                  <button
                    onClick={() => {
                      if (currentVariant === 'create') {
                        if (isTitleAdded) removeCreateElement('title');
                        else addCreateElement('title');
                      } else {
                        setShowTitle(!showTitle);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isTitleAdded 
                        ? 'bg-[#CCFF00]/20 border border-[#CCFF00]/50' 
                        : 'bg-zinc-800 border border-zinc-700 hover:border-[#CCFF00]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isTitleAdded ? 'text-[#CCFF00]' : 'text-zinc-400'}>
                        <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
                      </svg>
                      <span className={`text-sm font-medium ${isTitleAdded ? 'text-white' : 'text-zinc-300'}`}>Title</span>
                    </div>
                    {isTitleAdded && (
                      <span className="text-xs text-[#CCFF00]">Added</span>
                    )}
                  </button>
                );
              })()}
              
              {/* Date option */}
              {(() => {
                const isDateAdded = currentVariant === 'create' ? createdElements.includes('date') : showDate;
                return (
                  <button
                    onClick={() => {
                      if (currentVariant === 'create') {
                        if (isDateAdded) removeCreateElement('date');
                        else addCreateElement('date');
                      } else {
                        setShowDate(!showDate);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isDateAdded 
                        ? 'bg-[#CCFF00]/20 border border-[#CCFF00]/50' 
                        : 'bg-zinc-800 border border-zinc-700 hover:border-[#CCFF00]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isDateAdded ? 'text-[#CCFF00]' : 'text-zinc-400'}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span className={`text-sm font-medium ${isDateAdded ? 'text-white' : 'text-zinc-300'}`}>Date</span>
                    </div>
                    {isDateAdded ? (
                      <span className="text-xs text-[#CCFF00]">Added</span>
                    ) : (
                      <span className="text-xs text-zinc-500">{activity.date || 'No date'}</span>
                    )}
                  </button>
                );
              })()}
              
              {/* Route option - only show if activity has a polyline */}
              {activity.polyline && (() => {
                const isRouteAdded = currentVariant === 'create' ? createdElements.includes('route') : showRoute;
                return (
                  <button
                    onClick={() => {
                      if (currentVariant === 'create') {
                        if (isRouteAdded) removeCreateElement('route');
                        else addCreateElement('route');
                      } else {
                        setShowRoute(!showRoute);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isRouteAdded 
                        ? 'bg-[#CCFF00]/20 border border-[#CCFF00]/50' 
                        : 'bg-zinc-800 border border-zinc-700 hover:border-[#CCFF00]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isRouteAdded ? 'text-[#CCFF00]' : 'text-zinc-400'}>
                        <path d="M3 17L9 11L13 15L21 7"/>
                      </svg>
                      <span className={`text-sm font-medium ${isRouteAdded ? 'text-white' : 'text-zinc-300'}`}>Route</span>
                    </div>
                    {isRouteAdded && (
                      <span className="text-xs text-[#CCFF00]">Added</span>
                    )}
                  </button>
                );
              })()}
              
              {/* Divider */}
              <div className="border-t border-zinc-700 my-2" />
              
              {/* Individual stats - exclude date as it's now a separate element */}
              {allAvailableStats.filter(s => s.key !== 'date').map((stat) => {
                const isStatAdded = currentVariant === 'create' 
                  ? createdElements.includes(stat.key) 
                  : enabledStats.includes(stat.key);
                return (
                  <button
                    key={stat.key}
                    onClick={() => {
                      if (currentVariant === 'create') {
                        if (isStatAdded) removeCreateElement(stat.key);
                        else addCreateElement(stat.key);
                      } else {
                        toggleStat(stat.key);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isStatAdded 
                        ? 'bg-[#CCFF00]/20 border border-[#CCFF00]/50' 
                        : 'bg-zinc-800 border border-zinc-700 hover:border-[#CCFF00]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${isStatAdded ? 'text-white' : 'text-zinc-300'}`}>{stat.label}</span>
                    </div>
                    <span className={`text-sm ${isStatAdded ? 'text-[#CCFF00]' : 'text-zinc-500'}`}>
                      {isStatAdded ? 'Added' : stat.value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : showColorPicker ? (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              {/* Show title based on color picker mode */}
              {(colorPickerMode === 'statsOutline' || colorPickerMode === 'routeOutline') ? (
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                  {colorPickerMode === 'statsOutline' ? 'Stats Outline' : 'Route Outline'} Color
                </h3>
              ) : (
                /* Segmented toggle for Stats/Map color */
                <div className="flex items-center bg-zinc-800 rounded-full p-1">
                  <button 
                    onClick={() => setColorPickerMode('text')}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      colorPickerMode === 'text' 
                        ? 'bg-white text-black' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
                    </svg>
                    Stats
                  </button>
                  <button 
                    onClick={() => setColorPickerMode('route')}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      colorPickerMode === 'route' 
                        ? 'bg-white text-black' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/>
                    </svg>
                    Map
                  </button>
                </div>
              )}
              <button onClick={() => setShowColorPicker(false)} className="text-zinc-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <ColorSpectrum
              value={
                colorPickerMode === 'text' ? customColor :
                colorPickerMode === 'route' ? customRouteColor :
                colorPickerMode === 'statsOutline' ? statsSticker.color :
                routeSticker.color
              }
              onChange={(color) => {
                if (colorPickerMode === 'text') setCustomColor(color);
                else if (colorPickerMode === 'route') setCustomRouteColor(color);
                else if (colorPickerMode === 'statsOutline') setStatsSticker({ ...statsSticker, color });
                else setRouteSticker({ ...routeSticker, color });
              }}
              defaultColor={PACK_TAB_STYLES[currentPack]?.color || '#FFFFFF'}
            />
          </div>
        ) : showEffectsEditor ? (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              {/* Segmented toggle for Stats/Route effects */}
              <div className="flex items-center bg-zinc-800 rounded-full p-1">
                <button 
                  onClick={() => setEffectTarget('stats')}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    effectTarget === 'stats' 
                      ? 'bg-white text-black' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
                  </svg>
                  Stats
                </button>
                <button 
                  onClick={() => setEffectTarget('route')}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    effectTarget === 'route' 
                      ? 'bg-white text-black' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/>
                  </svg>
                  Route
                </button>
              </div>
              <button onClick={() => setShowEffectsEditor(false)} className="text-zinc-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            {/* Effect type grid - 4 columns to fit all options */}
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {EFFECT_OPTIONS.map((option) => {
                const currentEffect = effectTarget === 'stats' ? statsEffect : routeEffect;
                const isActive = currentEffect.type === option.type;
                return (
                  <button
                    key={option.type}
                    onClick={() => {
                      const newEffect = { type: option.type, intensity: currentEffect.intensity };
                      if (effectTarget === 'stats') {
                        setStatsEffect(newEffect);
                      } else {
                        setRouteEffect(newEffect);
                      }
                    }}
                    className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-[#CCFF00]/20 border border-[#CCFF00]/50' 
                        : 'bg-zinc-800 border border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <span className="text-base">{option.icon}</span>
                    <span className={`text-[9px] ${isActive ? 'text-white' : 'text-zinc-400'}`}>{option.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Intensity slider - only show if effect is not 'none' */}
            {(effectTarget === 'stats' ? statsEffect.type : routeEffect.type) !== 'none' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Intensity</span>
                  <span className="text-xs text-zinc-500">
                    {effectTarget === 'stats' ? statsEffect.intensity : routeEffect.intensity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={effectTarget === 'stats' ? statsEffect.intensity : routeEffect.intensity}
                  onChange={(e) => {
                    const newIntensity = parseInt(e.target.value);
                    if (effectTarget === 'stats') {
                      setStatsEffect(prev => ({ ...prev, intensity: newIntensity }));
                    } else {
                      setRouteEffect(prev => ({ ...prev, intensity: newIntensity }));
                    }
                  }}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]"
                />
              </div>
            )}
          </div>
        ) : (
          /* Default bottom bar - pack tabs only */
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-1 px-3 py-3 pb-8 min-w-max">
              {ACTIVE_PACKS.map((pack) => {
                const tabStyle = PACK_TAB_STYLES[pack];
                const isActive = currentPack === pack;
                return (
                  <button
                    key={pack}
                    onClick={() => {
                      setCurrentPack(pack);
                      setCustomColor(undefined);
                      setCustomRouteColor(undefined);
                    }}
                    className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                      isActive
                        ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-black'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                    style={{
                      fontFamily: tabStyle?.font,
                      color: isActive ? tabStyle?.color : '#888',
                      backgroundColor: isActive ? tabStyle?.bgColor : 'transparent',
                      textShadow: isActive ? tabStyle?.textShadow : 'none',
                      fontSize: '12px',
                    }}
                  >
                    {PACK_CONFIG[pack].label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

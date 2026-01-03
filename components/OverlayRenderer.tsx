import React, { memo } from 'react';
import { ActivityStats, OverlayPack, RouteStyle, ElementEffect, StickerOutline } from '../types';
import { RoutePolyline } from './RoutePolyline';
import type { OverlayVariant } from './OverlayGallery';
import { getStatsForActivityType } from '../utils/activityStats';
import { SAFE_DEFAULT_BACKGROUND } from '@/backgrounds';
import { EffectWrapper } from './EffectWrapper';
import { StickerWrapper } from './StickerWrapper';

// Helper to darken a hex color by a percentage (0-100)
const darkenColor = (color: string, percent: number = 40): string => {
  // Handle rgba format
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = Math.max(0, Math.round(parseInt(match[1]) * (1 - percent / 100)));
      const g = Math.max(0, Math.round(parseInt(match[2]) * (1 - percent / 100)));
      const b = Math.max(0, Math.round(parseInt(match[3]) * (1 - percent / 100)));
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  // Handle hex format (with or without alpha)
  let hex = color.replace('#', '');
  // Handle 8-char hex (with alpha)
  if (hex.length === 8) hex = hex.slice(0, 6);
  // Handle 3-char hex
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.round((num >> 16) * (1 - percent / 100)));
  const g = Math.max(0, Math.round(((num >> 8) & 0x00FF) * (1 - percent / 100)));
  const b = Math.max(0, Math.round((num & 0x0000FF) * (1 - percent / 100)));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Wobbly text component - each character has random rotation/offset
const WobblyText: React.FC<{ text: string; style: React.CSSProperties; className?: string }> = ({ text, style, className }) => {
  return (
    <span className={className} style={style}>
      {text.split('').map((char, i) => {
        // Seeded random for consistent wobble
        const seed = text.charCodeAt(i) + i;
        const rotation = ((seed % 20) - 10) * 0.8; // -8 to 8 degrees
        const yOffset = ((seed % 10) - 5) * 0.5; // -2.5 to 2.5px
        const xOffset = ((seed % 6) - 3) * 0.3; // -0.9 to 0.9px
        
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translate(${xOffset}px, ${yOffset}px) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </span>
  );
};

// Bubble text component for BUBBLE pack - irregular letter sizes that nestle together
const BubbleText: React.FC<{ text: string; style: React.CSSProperties; className?: string; baseSize?: number }> = ({ 
  text, 
  style, 
  className,
  baseSize = 1 
}) => {
  return (
    <span className={className} style={{ ...style, display: 'inline-flex', alignItems: 'baseline', letterSpacing: '-0.05em' }}>
      {text.split('').map((char, i) => {
        // Seeded random for consistent variations
        const seed = text.charCodeAt(Math.min(i, text.length - 1)) * (i + 1);
        
        // Size varies from 0.75 to 1.15 of base
        const sizeVariation = 0.75 + ((seed % 40) / 100); // 0.75 to 1.15
        
        // Slight rotation for organic feel (-8 to 8 degrees)
        const rotation = ((seed % 16) - 8) * 1.2;
        
        // Y offset to make letters nestle (-3 to 3px)
        const yOffset = ((seed % 14) - 7) * 0.5;
        
        // X offset for tighter/looser spacing (-2 to 1px - bias towards negative for tight fit)
        const xOffset = ((seed % 6) - 4) * 0.5;
        
        const fontSize = baseSize * sizeVariation;
        
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontSize: `${fontSize}em`,
              transform: `translate(${xOffset}px, ${yOffset}px) rotate(${rotation}deg)`,
              transformOrigin: 'center bottom',
              marginLeft: i === 0 ? 0 : '-0.02em',
            }}
          >
            {char === ' ' ? <span style={{ width: '0.3em', display: 'inline-block' }}>&nbsp;</span> : char}
          </span>
        );
      })}
    </span>
  );
};

interface OverlayRendererProps {
  activity: ActivityStats;
  pack: OverlayPack;
  variant: OverlayVariant;
  isPreview?: boolean;
  customColor?: string; // Override pack default color for text
  customRouteColor?: string; // Override pack default color for route
  customRouteStyle?: RouteStyle; // Override pack default route style
  showLabels?: boolean; // Toggle stat labels
  showRoute?: boolean; // Toggle route visibility
  enabledStats?: string[]; // Which stats to show
  isEditing?: boolean; // Enable direct manipulation
  onStatsTap?: (elementType?: string) => void; // Callback when stats are tapped (elementType is stat key in create mode)
  onRouteTap?: () => void; // Callback when route is tapped
  showTitle?: boolean; // Toggle title visibility
  activityTitle?: string; // Custom activity title
  onTitleTap?: () => void; // Callback when title is tapped
  showDate?: boolean; // Toggle date visibility
  activityDate?: string; // Activity date
  onDateTap?: () => void; // Callback when date is tapped
  // Create mode props
  createdElements?: string[]; // Elements added in create mode
  onRemoveElement?: (elementType: string) => void; // Remove element from create mode
  // Visual effects
  statsEffect?: ElementEffect; // Effect applied to stats text
  routeEffect?: ElementEffect; // Effect applied to route
  // Sticker outline
  statsSticker?: StickerOutline; // Sticker outline for stats
  routeSticker?: StickerOutline; // Sticker outline for route
}

// Per-pack scaling for horizontal layouts (route-stats variant)
// Lower = smaller text to fit wide fonts, Higher = larger text for narrow fonts
const PACK_HORIZONTAL_SCALE: Record<OverlayPack, number> = {
  [OverlayPack.DOODLE]: 0.99,
  [OverlayPack.GROOVY]: 0.99,
  [OverlayPack.RETRO]: 1.0,
  [OverlayPack.CYBER]: 0.95,     // VT323 is narrower than Press Start 2P
  [OverlayPack.GLASS]: 1.0,
  [OverlayPack.CHUNKY]: 0.99,
  [OverlayPack.CHILL]: 0.99,
  [OverlayPack.CHICLE]: 1.00,
  [OverlayPack.SLACKEY]: 0.99,
  [OverlayPack.ABRIL_FATFACE]: 1.0,
  [OverlayPack.LOBSTER]: 1.0,
  [OverlayPack.ROCK3D]: 0.7,  // Very wide 3D font
  [OverlayPack.MARKER]: 1.00,
  [OverlayPack.GLITCH]: 0.99,
  [OverlayPack.OUTLINE]: 1.00,
  [OverlayPack.BURNED]: 0.95,
  [OverlayPack.BUNGEE]: 0.99,
  [OverlayPack.JERSEY]: 1.00, 
  [OverlayPack.KABLAMMO]: 1.00,
  [OverlayPack.RIGHTEOUS]: 1.0,  // Clean proportional font
  [OverlayPack.RUBIK_DOODLE]: 0.95,
  [OverlayPack.FASCINATE]: 0.85,
  [OverlayPack.VINA_SANS]: 0.95,
  [OverlayPack.QAHIRI]: 0.9,
  [OverlayPack.BARRIO]: 0.9,
  [OverlayPack.DOKDO]: 1.0,
  [OverlayPack.RUBIK_MAZE]: 0.95,
  [OverlayPack.RUBIK_MAPS]: 0.95,
  [OverlayPack.MIXO]: 0.9,
  [OverlayPack.CHAUMONT]: 0.85,
  [OverlayPack.BACKOUT]: 0.9,
  [OverlayPack.GULAX]: 0.95,
  [OverlayPack.LITTLE_HOPE]: 1.0,
  [OverlayPack.JUMPS_WINTER]: 0.95,
  [OverlayPack.STRANGE_MARKS]: 1.0,
  [OverlayPack.PLAYFUL_BOXES]: 0.9,
  [OverlayPack.POSTBOOK]: 1.0,
  [OverlayPack.SUGGESTED]: 0.75,
  [OverlayPack.AMATIC]: 1.0,
  [OverlayPack.BLOX2]: 0.9,
  [OverlayPack.WEDGIE]: 0.95,
  [OverlayPack.CWISDOM]: 0.95,
  [OverlayPack.FACON]: 0.85,
  [OverlayPack.SEFA]: 0.9,
  [OverlayPack.ONICK]: 0.9,
  [OverlayPack.HELPME]: 0.9,
  [OverlayPack.GRIDLOCK]: 0.85,
  [OverlayPack.ACHTUNG_BRAVO]: 0.85,
  [OverlayPack.BOCALUPO]: 0.9,
  [OverlayPack.CAFE24_MOYAMOYA]: 0.85,
  [OverlayPack.KUBO]: 0.85,
  [OverlayPack.SPEED_FREAK]: 0.8,
  [OverlayPack.BEZMIAR]: 0.9,
  [OverlayPack.BLOCKY]: 0.85,
  [OverlayPack.FUNKWEST]: 0.9,
  [OverlayPack.GRITH]: 0.9,
  [OverlayPack.LT_RAILWAY]: 0.9,
  [OverlayPack.CDT_BIVAQUE]: 0.9,
  [OverlayPack.CHICOREE]: 0.85,
  [OverlayPack.PIXEL_AWAY]: 0.8,
  [OverlayPack.HYRAX]: 0.9,
  [OverlayPack.MIDNIGHT_LETTERS]: 0.9,
  [OverlayPack.NOSE_TRANSPORT]: 0.8,
  [OverlayPack.ORBIX]: 0.9,
  [OverlayPack.QUADRIANA]: 0.85,
  [OverlayPack.QUANTUM]: 0.7,
  [OverlayPack.RUNTTI]: 0.9,
  [OverlayPack.TACHYO]: 0.85,
  [OverlayPack.XANMONO]: 0.7,
  [OverlayPack.CAL_SANS]: 1.0,
  [OverlayPack.CHOCO_BLACK]: 0.9,
  [OverlayPack.MONTSERRAT_ITALIC]: 1.0,
  // Inactive packs (still need values for type safety)
  [OverlayPack.PAINT]: 1.0,
  [OverlayPack.CARTOON]: 1.0,
  [OverlayPack.SKETCH]: 1.0,
  [OverlayPack.POPPINS]: 1.0,
};

// Per-pack font size multiplier for SVG textPath (circular & wavy variants)
// Charted/decorative fonts need larger sizes to render properly on paths
const PACK_TEXTPATH_SCALE: Record<OverlayPack, number> = {
  [OverlayPack.DOODLE]: 1.0,
  [OverlayPack.GROOVY]: 1.0,
  [OverlayPack.RETRO]: 1.0,
  [OverlayPack.CYBER]: 1.0,      // VT323 works well at normal sizes
  [OverlayPack.GLASS]: 1.0,
  [OverlayPack.CHUNKY]: 1.0,
  [OverlayPack.CHILL]: 1.0,
  [OverlayPack.CHICLE]: 1.0,
  [OverlayPack.SLACKEY]: 1.0,
  [OverlayPack.ABRIL_FATFACE]: 1.0,
  [OverlayPack.LOBSTER]: 1.0,
  [OverlayPack.ROCK3D]: 1.0,
  [OverlayPack.MARKER]: 1.0,
  [OverlayPack.GLITCH]: 1.0,
  [OverlayPack.OUTLINE]: 1.3,    // Outline font needs larger
  [OverlayPack.BURNED]: 1.0,
  [OverlayPack.BUNGEE]: 1.3,     // Outline style needs larger
  [OverlayPack.JERSEY]: 2.0,     // Charted font needs much larger
  [OverlayPack.KABLAMMO]: 1.2,   // Decorative font
  [OverlayPack.RIGHTEOUS]: 1.0,
  [OverlayPack.RUBIK_DOODLE]: 1.1,
  [OverlayPack.FASCINATE]: 1.2,
  [OverlayPack.VINA_SANS]: 1.0,
  [OverlayPack.QAHIRI]: 1.1,
  [OverlayPack.BARRIO]: 1.1,
  [OverlayPack.DOKDO]: 1.0,
  [OverlayPack.RUBIK_MAZE]: 1.1,
  [OverlayPack.RUBIK_MAPS]: 1.1,
  [OverlayPack.MIXO]: 1.0,
  [OverlayPack.CHAUMONT]: 1.1,
  [OverlayPack.BACKOUT]: 1.0,
  [OverlayPack.GULAX]: 1.0,
  [OverlayPack.LITTLE_HOPE]: 1.0,
  [OverlayPack.JUMPS_WINTER]: 1.0,
  [OverlayPack.STRANGE_MARKS]: 1.1,
  [OverlayPack.PLAYFUL_BOXES]: 1.0,
  [OverlayPack.POSTBOOK]: 1.0,
  [OverlayPack.SUGGESTED]: 1.0,
  [OverlayPack.AMATIC]: 1.2,
  [OverlayPack.BLOX2]: 1.0,
  [OverlayPack.WEDGIE]: 1.1,
  [OverlayPack.CWISDOM]: 1.0,
  [OverlayPack.FACON]: 1.0,
  [OverlayPack.SEFA]: 1.0,
  [OverlayPack.ONICK]: 1.0,
  [OverlayPack.HELPME]: 1.0,
  [OverlayPack.GRIDLOCK]: 1.0,
  [OverlayPack.ACHTUNG_BRAVO]: 1.0,
  [OverlayPack.BOCALUPO]: 1.0,
  [OverlayPack.CAFE24_MOYAMOYA]: 1.0,
  [OverlayPack.KUBO]: 1.0,
  [OverlayPack.SPEED_FREAK]: 1.0,
  [OverlayPack.BEZMIAR]: 1.0,
  [OverlayPack.BLOCKY]: 1.0,
  [OverlayPack.FUNKWEST]: 1.0,
  [OverlayPack.GRITH]: 1.0,
  [OverlayPack.LT_RAILWAY]: 1.0,
  [OverlayPack.CDT_BIVAQUE]: 1.0,
  [OverlayPack.CHICOREE]: 1.0,
  [OverlayPack.PIXEL_AWAY]: 1.0,
  [OverlayPack.HYRAX]: 1.0,
  [OverlayPack.MIDNIGHT_LETTERS]: 1.0,
  [OverlayPack.NOSE_TRANSPORT]: 1.0,
  [OverlayPack.ORBIX]: 1.0,
  [OverlayPack.QUADRIANA]: 1.0,
  [OverlayPack.QUANTUM]: 1.0,
  [OverlayPack.RUNTTI]: 1.0,
  [OverlayPack.TACHYO]: 1.0,
  [OverlayPack.XANMONO]: 1.0,
  [OverlayPack.CAL_SANS]: 1.0,
  [OverlayPack.CHOCO_BLACK]: 1.0,
  [OverlayPack.MONTSERRAT_ITALIC]: 1.0,
  [OverlayPack.POPPINS]: 1.0,
  [OverlayPack.PAINT]: 1.0,
  [OverlayPack.CARTOON]: 1.0,
  [OverlayPack.SKETCH]: 1.0,
};

// Pack-specific styling
export const PACK_STYLES: Record<OverlayPack, {
  font: string;
  color: string;
  labelColor: string;
  getTextStyle: (customColor?: string) => React.CSSProperties;
  // Route styling
  routeColor: string;
  routeStrokeWidth: number;
  routeOutline: boolean;
  routeOutlineColor: string;
  routeOutlineWidth: number;
  routeStyle: 'smooth' | 'sharp' | 'striped' | 'dotted' | 'dashed';
  // Route shadow/background effect
  routeShadowOffset?: { x: number; y: number };
  routeShadowColor?: string;
  routeShadowOpacity?: number;
  routePixelated?: boolean;
  // Outline-only mode (no fill, just outline stroke)
  routeOutlineOnly?: boolean;
  // Sketchy irregular hand-drawn style
  routeSketchy?: boolean;
  // Gradient text packs (chrome, metallic effects)
  hasGradientText?: boolean;
}> = {
  [OverlayPack.DOODLE]: {
    font: '"Galindo", cursive',
    color: '#F5A5C8',
    labelColor: '#F5A5C8',
    getTextStyle: () => ({
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    }),
    // Thick pink route with black outline like the text
    routeColor: '#F5A5C8',
    routeStrokeWidth: 8,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.GROOVY]: {
    font: '"Modak", cursive',
    color: '#72ac43',
    labelColor: '#F5EBD8',
    getTextStyle: () => ({
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 1px 0 #000, 0 -1px 0 #000',
      fontWeight: '400',
    }),
    // Brighter, thicker route with offset shadow like stats
    routeColor: '#f8a91f',
    routeStrokeWidth: 9,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
    // Offset shadow to match the text style
    routeShadowOffset: { x: 4, y: 4 },
    routeShadowColor: 'rgba(0,0,0,0.5)',
    routeShadowOpacity: 1,
  },
  [OverlayPack.RETRO]: {
    font: '"Teko", sans-serif',
    color: '#ca6702',
    labelColor: '#F5F0E6',
    getTextStyle: () => ({
      textShadow: '1px 1px 0 rgba(0,0,0,0.6)',
      fontWeight: 'bold',
      letterSpacing: '0.05em',
    }),
    // Sharp bright route with offset shadow like stats
    routeColor: '#0a9396',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'sharp',
    // Offset shadow matching the text style
    routeShadowOffset: { x: 4, y: 4 },
    routeShadowColor: 'rgba(0,0,0,0.7)',
    routeShadowOpacity: 1,
  },
  // Fallbacks for other packs (not actively used)
  [OverlayPack.PAINT]: {
    font: '"Gaegu", cursive',
    color: '#FFFFFF',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      WebkitTextStroke: '2px #FFFFFF',
      WebkitTextFillColor: 'transparent',
    }),
    routeColor: '#FFFFFF',
    routeStrokeWidth: 3,
    routeOutline: false,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.CARTOON]: {
    font: '"Permanent Marker", cursive',
    color: '#CCFF00',
    labelColor: '#000000',
    getTextStyle: () => ({}),
    routeColor: '#CCFF00',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.SKETCH]: {
    font: '"Patrick Hand", cursive',
    color: '#4BA3C3',
    labelColor: '#4BA3C3',
    getTextStyle: () => ({
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
      letterSpacing: '0.02em',
    }),
    // Blue route with dark outline
    routeColor: '#4BA3C3',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.CYBER]: {
    font: '"VT323", monospace',
    color: '#54efea',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      letterSpacing: '0.05em',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    }),
    // Pixelated route with blocky shadow for retro game feel
    routeColor: '#EC00F0',
    routeStrokeWidth: 4,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'sharp',
    // Offset blocky shadow for pixel art vibe
    routeShadowOffset: { x: 3, y: 3 },
    routeShadowColor: '#333333',
    routeShadowOpacity: 0.8,
    routePixelated: true,
  },
  [OverlayPack.GLITCH]: {
    font: '"Rubik Glitch", system-ui',
    color: '#FFFFFF',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      textShadow: '-1px 0 #FF0000, 1px 0 #00FF00',
      fontWeight: '400',
      letterSpacing: '0.02em',
    }),
    // Glitchy route with RGB split
    routeColor: '#FFFFFF',
    routeStrokeWidth: 4,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'sharp',
    routeShadowOffset: { x: 3, y: 0 },
    routeShadowColor: '#00FF00',
    routeShadowOpacity: 0.7,
  },
  [OverlayPack.GLASS]: {
    font: '"Bebas Neue", sans-serif',
    color: 'rgba(255,255,255,0.4)',
    labelColor: 'rgba(255,255,255,0.3)',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.05em',
    }),
    // Glass route - subtle transparent stroke with soft glow
    routeColor: 'rgba(255,255,255,0.35)',
    routeStrokeWidth: 3,
    routeOutline: false,
    routeOutlineColor: 'transparent',
    routeOutlineWidth: 0,
    routeStyle: 'smooth',
  },
  [OverlayPack.CHUNKY]: {
    font: '"Erica One", cursive',
    color: '#e63a33',
    labelColor: '#EF4444',
    getTextStyle: () => ({
      textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 1px 0 #000, 0 -1px 0 #000',
      fontWeight: '400',
      letterSpacing: '-0.02em',
    }),
    // Chunky route with bold shadow
    routeColor: '#e63a33',
    routeStrokeWidth: 8,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
    routeShadowOffset: { x: 5, y: 5 },
    routeShadowColor: '#000000',
    routeShadowOpacity: 1,
  },
  [OverlayPack.CHILL]: {
    font: '"Archivo Black", sans-serif',
    color: '#93d3ae',
    labelColor: '#F5EED6',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    // Smooth cream-colored route with dark outline
    routeColor: '#F9a822',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.CHICLE]: {
    font: '"Chicle", cursive',
    color: '#FDE047',
    labelColor: '#FDE047',
    getTextStyle: () => ({
      textShadow: '1px 1px 0 #166534',
      fontWeight: '400',
    }),
    // Yellow route with black outline
    routeColor: '#FDE047',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.SLACKEY]: {
    font: '"Slackey", cursive',
    color: '#8cc850',
    labelColor: '#8cc850',
    getTextStyle: () => ({
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 1px 0 #000, 0 -1px 0 #000',
      fontWeight: '400',
    }),
    // Bright route with solid black outline matching text
    routeColor: '#8cc850',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.ABRIL_FATFACE]: {
    font: '"Abril Fatface", serif',
    color: '#FBB728',
    labelColor: '#FBB728',
    getTextStyle: () => ({
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
      fontWeight: '400',
    }),
    // Blue route with black outline
    routeColor: '#1570AC',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.LOBSTER]: {
    font: '"Lobster", cursive',
    color: '#efce7b',
    labelColor: '#efce7b',
    getTextStyle: () => ({
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
      fontWeight: '400',
    }),
    // Teal route with black outline
    routeColor: '#2bbaa5',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.OUTLINE]: {
    font: '"Londrina Outline", cursive',
    color: '#FFFFFF',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.03em',
    }),
    // Hollow route - uses mask to create outline-only effect matching the font
    routeColor: 'transparent',
    routeStrokeWidth: 4,      // Inner hollow width
    routeOutline: true,
    routeOutlineColor: '#FFFFFF',
    routeOutlineWidth: 2,     // Thickness of the outline stroke itself
    routeStyle: 'smooth',
    routeOutlineOnly: true,   // Special flag for hollow outline mode
  },
  [OverlayPack.ROCK3D]: {
    font: '"Rock 3D", cursive',
    color: '#FFFFFF',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
      fontWeight: '400',
    }),
    // Sketchy thin irregular lines - no fill, matching hand-drawn 3D font
    routeColor: '#FFFFFF',
    routeStrokeWidth: 2,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
    routeOutlineOnly: true,
    routeSketchy: true,  // Irregular hand-drawn effect
  },
  [OverlayPack.MARKER]: {
    font: '"Permanent Marker", cursive',
    color: '#FF0000',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
      fontWeight: '400',
      letterSpacing: '0.02em',
    }),
    // Thick sketchy marker-style route with edge
    routeColor: '#FFeB3b',
    routeStrokeWidth: 8,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.BURNED]: {
    font: '"Rubik Burned", system-ui',
    color: '#DC2F02',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    // Rough, charred-looking route with irregular edges
    routeColor: '#F48C06',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
    routeSketchy: true,  // Irregular burned edges
  },
  [OverlayPack.BUNGEE]: {
    font: '"Bungee Outline", system-ui',
    color: '#FFFFFF',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      fontWeight: '400',
    }),
    // Bold outline matching the block letter font
    routeColor: 'transparent',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#FFFFFF',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
    routeOutlineOnly: true,
  },
  [OverlayPack.JERSEY]: {
    font: '"Jersey 10 Charted", system-ui',
    color: '#35ff00',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      fontWeight: '400',
    }),
    // Dotted line like a sports field marking or jersey stitching
    routeColor: '#35ff00',
    routeStrokeWidth: 4,
    routeOutline: false,
    routeOutlineColor: 'transparent',
    routeOutlineWidth: 0,
    routeStyle: 'dotted',  // Dotted stitched line
  },
  [OverlayPack.KABLAMMO]: {
    font: '"Kablammo", system-ui',
    color: '#dda15e',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    // Bold comic-style route with thick outline
    routeColor: '#d3df37',
    routeStrokeWidth: 8,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.RIGHTEOUS]: {
    font: '"Righteous", cursive',
    color: '#e3dbcc',
    labelColor: '#C4B5FD',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
    }),
    // Clean smooth route with solid black outline
    routeColor: '#C4B5FD',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.RUBIK_DOODLE]: {
    font: '"Rubik Doodle Shadow", system-ui',
    color: '#EDE490',
    labelColor: '#EDE490',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
    }),
    // White sketchy route with dark edge
    routeColor: '#DFD550',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
    routeShadowOffset: { x: 3, y: 3 },
    routeShadowColor: 'rgba(0,0,0,0.5)',
    routeShadowOpacity: 1,
  },
  [OverlayPack.FASCINATE]: {
    font: '"Fascinate Inline", cursive',
    color: '#FFD700',
    labelColor: '#FFD700',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.05em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    // Gold decorative route
    routeColor: '#ffffffff',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.VINA_SANS]: {
    font: '"Vina Sans", cursive',
    color: '#FF6B6B',
    labelColor: '#FF6B6B',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 1px 0 #000, 0 -1px 0 #000',
    }),
    // Bold red route with shadow
    routeColor: '#e8d8c9',
    routeStrokeWidth: 7,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
    routeShadowOffset: { x: 3, y: 3 },
    routeShadowColor: 'rgba(0,0,0,0.5)',
    routeShadowOpacity: 1,
  },
  [OverlayPack.QAHIRI]: {
    font: '"Qahiri", sans-serif',
    color: '#ffffff',
    labelColor: '#4ECDC4',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.03em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    // Teal angular route
    routeColor: '#4ECDC4',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'sharp',
  },
  [OverlayPack.BARRIO]: {
    font: '"Barrio", cursive',
    color: '#ffffff',
    labelColor: '#ffffff',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
    }),
    // Playful orange route with sketchy feel
    routeColor: '#FF9F1C',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeShadowOffset: { x: 2, y: 10 },
    routeStyle: 'sharp',
    routeSketchy: true,
  },
  [OverlayPack.DOKDO]: {
    font: '"Dokdo", cursive',
    color: '#E8E8E8',
    labelColor: '#E8E8E8',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 1px 0 #000, 0 -1px 0 #000',
    }),
    // Rough brushstroke route
    routeColor: '#f3701e',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeShadowOffset: { x: 2, y: 2 },
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'sharp',
    routeSketchy: true,
  },
  [OverlayPack.RUBIK_MAZE]: {
    font: '"Rubik Maze", system-ui',
    color: '#ffffff',
    labelColor: '#ffffff',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    }),
    routeColor: '#A855F7',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeShadowOffset: { x: 2, y: 2 },
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'sharp',
  },
  [OverlayPack.RUBIK_MAPS]: {
    font: '"Rubik Maps", system-ui',
    color: '#ffffff',
    labelColor: '#22C55E',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
    }),
    routeColor: '#ff4777',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeSketchy:true,
    routeShadowOffset: { x: 2, y: 2 },
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.MIXO]: {
    font: '"Mixo", sans-serif',
    color: '#508A8C',
    labelColor: '#508A8C',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.05em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    routeColor: '#508A8C',
    routeStrokeWidth: 4,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'sharp',
  },
  [OverlayPack.CHAUMONT]: {
    font: '"Chaumont", sans-serif',
    color: '#F472B6',
    labelColor: '#F472B6',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.03em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    routeColor: '#F472B6',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.BACKOUT]: {
    font: '"Backout", sans-serif',
    color: '#F37C34',
    labelColor: '#F37C34',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    routeColor: '#F37C34',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.GULAX]: {
    font: '"Gulax", sans-serif',
    color: '#34D399',
    labelColor: '#34D399',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
    }),
    routeColor: '#34D399',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.LITTLE_HOPE]: {
    font: '"Little Hope", cursive',
    color: '#F08C21',
    labelColor: '#F08C21',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    routeColor: 'rgba(28, 238, 203, 1)',
    routeStrokeWidth: 10,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.JUMPS_WINTER]: {
    font: '"Jumps Winter", cursive',
    color: '#00FBEA',
    labelColor: '#00FBEA',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    routeColor: '#00FBEA',
    routeStrokeWidth: 10,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeShadowColor: '#000000',
    routeStyle: 'smooth',
  },
  [OverlayPack.CHOCO_BLACK]: {
    font: '"ChocoBlackG", sans-serif',
    color: '#EDE490',
    labelColor: '#EDE490',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '2px 2px 0 rgba(0,0,0,0.6)',
    }),
    routeColor: '#DFD550',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.STRANGE_MARKS]: {
    font: '"Strange Marks", cursive',
    color: '#41644A',
    labelColor: '#41644A',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.05em',
    }),
    routeColor: '#41644A',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
    routeSketchy: true,
  },
  [OverlayPack.PLAYFUL_BOXES]: {
    font: '"Playful Boxes", sans-serif',
    color: 'rgba(255, 255, 255, 1)',
    labelColor: '#ffffffff',
    getTextStyle: () => ({
      fontWeight: '400',
    }),
    routeColor: '#a8eb0bff',
    routeStrokeWidth: 10,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.POSTBOOK]: {
    font: '"Postbook", sans-serif',
    color: '#ED7758',
    labelColor: '#ED7758',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
    }),
    routeColor: '#ED7758',
    routeStrokeWidth: 8,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.SUGGESTED]: {
    font: '"Suggested", sans-serif',
    color: '#FF6B6B',
    labelColor: '#FF6B6B',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    routeColor: '#FF6B6B',
    routeStrokeWidth: 12,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.AMATIC]: {
    font: '"Amatic SC", cursive',
    color: '#9EFF00',
    labelColor: '#9EFF00',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.05em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
    }),
    routeColor: '#9EFF00',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.BLOX2]: {
    font: '"Blox2", sans-serif',
    color: 'hsla(0, 0%, 100%, 1.00)',
    labelColor: '#ffffffff',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
    }),
    routeColor: '#7bfc7bff',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'sharp',
  },
  [OverlayPack.WEDGIE]: {
    font: '"Wedgie", cursive',
    color: '#FFFFFF',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.03em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
    }),
    routeColor: '#FF6B35',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.CWISDOM]: {
    font: '"Cwisdom", sans-serif',
    color: '#EDE490',
    labelColor: '#EDE490',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    routeColor: '#DFD550',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.FACON]: {
    font: '"Facon", sans-serif',
    color: '#daff02',
    labelColor: '#daff02',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.05em',
      textShadow: '2px 2px 0 rgba(0,0,0,0.6)',
    }),
    routeColor: '#ff5930',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.SEFA]: {
    font: '"Sefa", sans-serif',
    color: '#F37C34',
    labelColor: '#F37C34',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    routeColor: '#F37C34',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.ONICK]: {
    font: '"Onick", sans-serif',
    color: '#41644A',
    labelColor: '#41644A',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    routeColor: '#41644A',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.HELPME]: {
    font: '"HelpMe", sans-serif',
    color: '#ED7758',
    labelColor: '#ED7758',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }),
    routeColor: '#ED7758',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.GRIDLOCK]: {
    font: '"Gridlock", sans-serif',
    color: '#FFFFFF',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    }),
    routeColor: '#C0C0C0',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.ACHTUNG_BRAVO]: {
    font: '"AchtungBravo", sans-serif',
    color: '#FF4136',
    labelColor: '#FF4136',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.05em',
      textShadow: '3px 3px 0 #000, -1px -1px 0 #000',
    }),
    routeColor: '#FF4136',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'sharp',
  },
  [OverlayPack.BOCALUPO]: {
    font: '"Bocalupo", cursive',
    color: '#ffffffff',
    labelColor: '#ffffffff',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
    }),
    routeColor: '#FEC700',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.CAFE24_MOYAMOYA]: {
    font: '"Cafe24Moyamoya", cursive',
    color: '#Bee0f2',
    labelColor: '#Bee0f2',
    getTextStyle: () => ({
      fontWeight: '400',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
    }),
    routeColor: '#FF69B4',
    routeStrokeWidth: 7,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.KUBO]: {
    font: '"KUBO", sans-serif',
    color: '#8f35ec',
    labelColor: '#8f35ec',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.05em',
      textShadow: '2px 2px 0 #000',
    }),
    routeColor: '#00D4FF',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'sharp',
  },
  [OverlayPack.SPEED_FREAK]: {
    font: '"SpeedFreak", sans-serif',
    color: '#CCFF00',
    labelColor: '#CCFF00',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '3px 3px 0 #000, -1px -1px 0 #000',
    }),
    routeColor: '#CCFF00',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
    routeShadowOffset: { x: 3, y: 3 },
    routeShadowColor: '#000000',
    routeShadowOpacity: 0.5,
  },
  [OverlayPack.BEZMIAR]: {
    font: '"Bezmiar", serif',
    color: '#E8D5B7',
    labelColor: '#E8D5B7',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.03em',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    }),
    routeColor: '#E8D5B7',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.BLOCKY]: {
    font: '"Wendy One", sans-serif',
    color: '#ffffffff',
    labelColor: '#FF6B35',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.05em',
      textShadow: '4px 4px 0 #000000',
    }),
    routeColor: '#FF6B35',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'sharp',
  },
  [OverlayPack.FUNKWEST]: {
    font: '"Funkwest", cursive',
    color: '#DAA520',
    labelColor: '#DAA520',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '2px 2px 0 #5C4033, 4px 4px 0 rgba(0,0,0,0.3)',
    }),
    routeColor: '#DAA520',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.GRITH]: {
    font: '"Monoton", sans-serif',
    color: '#ffffffff',
    labelColor: '#ffffffff',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.10em',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    }),
    routeColor: '#87CEEB',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.LT_RAILWAY]: {
    font: '"LTRailway", sans-serif',
    color: '#ffffffff',
    labelColor: '#ffffffff',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.03em',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    }),
    routeColor: '#CC3333',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.CDT_BIVAQUE]: {
    font: '"CDTBivaque", sans-serif',
    color: '#648c82',
    labelColor: '#648c82',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    }),
    routeColor: '#8B7355',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.CHICOREE]: {
    font: '"Chicoree", cursive',
    color: '#df8fffff',
    labelColor: '#df8fffff',
    getTextStyle: () => ({
      fontWeight: '700',
      letterSpacing: '0.03em',
      textShadow: '2px 2px 0 rgba(0,0,0,0.6)',
    }),
    routeColor: '#9B59B6',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.PIXEL_AWAY]: {
    font: '"PixelAway", monospace',
    color: '#fb8007',
    labelColor: '#fb8007',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.05em',
      textShadow: '2px 2px 0 #000000',
    }),
    routeColor: '#00FF00',
    routeStrokeWidth: 4,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'sharp',
  },
  [OverlayPack.HYRAX]: {
    font: '"Hyrax", sans-serif',
    color: '#ffffffff',
    labelColor: '#ffffffff',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.03em',
      textShadow: '2px 2px 0 #000000',
    }),
    routeColor: '#FF8C42',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.MIDNIGHT_LETTERS]: {
    font: '"MidnightLetters", serif',
    color: '#ccffbc',
    labelColor: '#ccffbc',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.04em',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    }),
    routeColor: '#74c365',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.NOSE_TRANSPORT]: {
    font: '"NoseTransport", sans-serif',
    color: '#f2ff00ff',
    labelColor: '#f2ff00ff',
    getTextStyle: () => ({
      fontWeight: '700',
      letterSpacing: '0.05em',
      textShadow: '2px 2px 0 #000000',
    }),
    routeColor: '#FFD700',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'sharp',
  },
  [OverlayPack.ORBIX]: {
    font: '"Caesar Dressing", cursive',
    color: '#e1e1e1ff',
    labelColor: '#e1e1e1ff',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.03em',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    }),
    routeColor: '#00CED1',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.QUADRIANA]: {
    font: '"Quadriana", sans-serif',
    color: '#3cd6e7ff',
    labelColor: '#E74C3C',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.04em',
      textShadow: '3px 3px 0 #000000  ',
    }),
    routeColor: '#E74C3C',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'sharp',
  },
  [OverlayPack.QUANTUM]: {
    font: '"Quantum", sans-serif',
    color: '#e1e1e1ff',
    labelColor: '#e1e1e1ff',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.05em',
      textShadow: '2px 2px 0 rgba(0,0,0,0.6)',
    }),
    routeColor: '#8E44AD',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.RUNTTI]: {
    font: '"Runtti", sans-serif',
    color: '#3498DB',
    labelColor: '#3498DB',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.03em',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    }),
    routeColor: '#3498DB',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  [OverlayPack.TACHYO]: {
    font: '"Tachyo", sans-serif',
    color: '#ffffffff',
    labelColor: '#ffffffff',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.02em',
      textShadow: '3px 3px 0 #000000',
    }),
    routeColor: '#F39C12',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 1.5,
    routeStyle: 'smooth',
  },
  [OverlayPack.XANMONO]: {
    font: '"Xanmono", monospace',
    color: '#1ABC9C',
    labelColor: '#1ABC9C',
    getTextStyle: () => ({
      fontWeight: '400',
      letterSpacing: '0.06em',
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    }),
    routeColor: '#1ABC9C',
    routeStrokeWidth: 4,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'sharp',
  },
  [OverlayPack.CAL_SANS]: {
    font: '"Cal Sans", sans-serif',
    color: '#FFFFFF',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({
      fontWeight: '600',
      letterSpacing: '-0.02em',
    }),
    // Simple white route, no outline
    routeColor: '#FFFFFF',
    routeStrokeWidth: 4,
    routeOutline: false,
    routeOutlineColor: 'transparent',
    routeOutlineWidth: 0,
    routeStyle: 'smooth',
  },
  [OverlayPack.MONTSERRAT_ITALIC]: {
    font: '"Montserrat Italic", sans-serif',
    color: '#508A8C',
    labelColor: '#508A8C',
    getTextStyle: () => ({
      fontWeight: '400',
      fontStyle: 'italic',
      letterSpacing: '0.01em',
      textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
    }),
    routeColor: '#508A8C',
    routeStrokeWidth: 5,
    routeOutline: true,
    routeOutlineColor: 'rgba(0,0,0,0.5)',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
  // Inactive packs (still need entries for type safety)
  [OverlayPack.POPPINS]: {
    font: 'Poppins, sans-serif',
    color: '#FFFFFF',
    labelColor: '#FFFFFF',
    getTextStyle: () => ({}),
    routeColor: '#FFFFFF',
    routeStrokeWidth: 6,
    routeOutline: true,
    routeOutlineColor: '#000000',
    routeOutlineWidth: 2,
    routeStyle: 'smooth',
  },
};

export const OverlayRenderer: React.FC<OverlayRendererProps> = memo(function OverlayRenderer({
  activity,
  pack,
  variant,
  isPreview = false,
  customColor,
  customRouteColor,
  customRouteStyle,
  showLabels = true,
  showRoute = true,
  enabledStats,
  isEditing = false,
  onStatsTap,
  onRouteTap,
  showTitle = false,
  activityTitle,
  onTitleTap,
  showDate = false,
  activityDate,
  onDateTap,
  createdElements = [],
  onRemoveElement,
  statsEffect,
  routeEffect,
  statsSticker,
  routeSticker,
}) {
  const style = PACK_STYLES[pack];
  const allStats = getStatsForActivityType(activity);
  
  // Filter stats based on enabledStats - exclude 'date' as it's now a separate element
  const prioritizedStats = enabledStats 
    ? allStats.filter(s => enabledStats.includes(s.key) && s.key !== 'date')
    : allStats.filter(s => s.key !== 'date');
  
  // For Glass pack, convert custom color to semi-transparent tint
  const getGlassTintColor = (hexColor: string | undefined) => {
    if (!hexColor) return style.color; // Use default pack color
    // If already rgba, return as-is
    if (hexColor.startsWith('rgba')) return hexColor;
    // Convert hex to rgba with 40% opacity for glass tint
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.4)`;
  };
  
  // Use custom color if provided, otherwise use pack default
  // Glass pack: apply custom color as a semi-transparent tint
  const activeColor = pack === OverlayPack.GLASS
    ? getGlassTintColor(customColor)
    : (customColor || style.color);

  // Scale factor for preview thumbnails
  const scale = isPreview ? 0.5 : 1;
  
  // Element transform states for direct manipulation
  const [elementTransforms, setElementTransforms] = React.useState<Record<string, {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }>>({});
  
  const [selectedElement, setSelectedElement] = React.useState<string | null>(null);

  // Helper to update transforms - updates both state and returns new value immediately
  const updateElementTransform = (elementId: string, newTransform: { x: number; y: number; scale: number; rotation: number }) => {
    setElementTransforms(prev => ({
      ...prev,
      [elementId]: newTransform,
    }));
  };

  // Get transform for an element
  const getElementTransform = (elementId: string) => {
    return elementTransforms[elementId] || { x: 0, y: 0, scale: 1, rotation: 0 };
  };

  // Transformable wrapper for direct manipulation
  const TransformableWrapper: React.FC<{
    elementId: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ elementId, children, className = '' }) => {
    const transform = getElementTransform(elementId);
    const isSelected = selectedElement === elementId;
    const elementRef = React.useRef<HTMLDivElement>(null);
    const isResizing = React.useRef(false);
    const isDragging = React.useRef(false);
    const startPos = React.useRef({ x: 0, y: 0 });
    const startTransform = React.useRef({ x: 0, y: 0, scale: 1, rotation: 0 });
    const currentTransformRef = React.useRef({ x: 0, y: 0, scale: 1, rotation: 0 });
    const pinchStart = React.useRef({ distance: 0, angle: 0 });

    // Helper to update transform directly on DOM for smooth movement
    const updateTransformDirect = (x: number, y: number, scale: number, rotation: number) => {
      currentTransformRef.current = { x, y, scale, rotation };
      if (elementRef.current) {
        elementRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`;
      }
    };

    // Resize handle handlers
    const handleResizeStart = (e: React.PointerEvent | React.TouchEvent, corner: string) => {
      e.stopPropagation();
      e.preventDefault();
      isResizing.current = true;
      
      // Get fresh transform value from state
      const current = elementTransforms[elementId] || { x: 0, y: 0, scale: 1, rotation: 0 };
      startTransform.current = { ...current };
      currentTransformRef.current = { ...current };
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      startPos.current = { x: clientX, y: clientY };
      
      const handleResizeMove = (moveEvent: PointerEvent | TouchEvent) => {
        moveEvent.preventDefault();
        const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
        const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
        
        // Calculate distance from center to determine scale
        const deltaX = moveX - startPos.current.x;
        const deltaY = moveY - startPos.current.y;
        
        // Use diagonal distance for scale factor
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const direction = (corner.includes('bottom') ? deltaY : -deltaY) + (corner.includes('right') ? deltaX : -deltaX);
        const scaleChange = 1 + (direction > 0 ? distance : -distance) / 150;
        
        const newScale = Math.max(0.3, Math.min(3, startTransform.current.scale * scaleChange));
        updateTransformDirect(startTransform.current.x, startTransform.current.y, newScale, startTransform.current.rotation);
      };
      
      const handleResizeEnd = () => {
        isResizing.current = false;
        window.removeEventListener('pointermove', handleResizeMove);
        window.removeEventListener('pointerup', handleResizeEnd);
        window.removeEventListener('touchmove', handleResizeMove);
        window.removeEventListener('touchend', handleResizeEnd);
        
        // Sync to state from our tracked ref
        updateElementTransform(elementId, { ...currentTransformRef.current });
      };
      
      window.addEventListener('pointermove', handleResizeMove);
      window.addEventListener('pointerup', handleResizeEnd);
      window.addEventListener('touchmove', handleResizeMove, { passive: false });
      window.addEventListener('touchend', handleResizeEnd);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedElement(elementId);
      
      // Get fresh transform value from state
      const current = elementTransforms[elementId] || { x: 0, y: 0, scale: 1, rotation: 0 };
      startTransform.current = { ...current };
      currentTransformRef.current = { ...current };
      isDragging.current = true;
      
      if (e.touches.length === 1) {
        startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        pinchStart.current = {
          distance: Math.sqrt(dx * dx + dy * dy),
          angle: Math.atan2(dy, dx) * (180 / Math.PI)
        };
      }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      e.preventDefault();
      
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - startPos.current.x;
        const deltaY = e.touches[0].clientY - startPos.current.y;
        const newX = startTransform.current.x + deltaX;
        const newY = startTransform.current.y + deltaY;
        // Direct DOM update for smooth movement
        updateTransformDirect(newX, newY, startTransform.current.scale, startTransform.current.rotation);
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        const scaleChange = currentDistance / pinchStart.current.distance;
        const angleChange = currentAngle - pinchStart.current.angle;
        const newScale = Math.max(0.3, Math.min(3, startTransform.current.scale * scaleChange));
        const newRotation = startTransform.current.rotation + angleChange;
        // Direct DOM update for smooth pinch/rotate
        updateTransformDirect(startTransform.current.x, startTransform.current.y, newScale, newRotation);
      }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      
      // Sync final position to state from our tracked ref
      updateElementTransform(elementId, { ...currentTransformRef.current });
    };

    const handlePointerDown = (e: React.PointerEvent) => {
      if (e.pointerType === 'touch') return;
      e.stopPropagation();
      setSelectedElement(elementId);
      
      // Get fresh transform value from state
      const current = elementTransforms[elementId] || { x: 0, y: 0, scale: 1, rotation: 0 };
      startTransform.current = { ...current };
      currentTransformRef.current = { ...current };
      startPos.current = { x: e.clientX, y: e.clientY };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - startPos.current.x;
        const deltaY = moveEvent.clientY - startPos.current.y;
        const newX = startTransform.current.x + deltaX;
        const newY = startTransform.current.y + deltaY;
        // Direct DOM update for smooth movement
        updateTransformDirect(newX, newY, startTransform.current.scale, startTransform.current.rotation);
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        
        // Sync final position to state from our tracked ref
        updateElementTransform(elementId, { ...currentTransformRef.current });
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    };

    return (
      <div
        ref={elementRef}
        className={`touch-none select-none cursor-move ${className}`}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
          transformOrigin: 'center center',
          position: 'relative',
          willChange: 'transform',
          // Prevent layout shifts from selection handles
          isolation: 'isolate',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
      >
        {children}
        {isSelected && (
          <div 
            className="absolute rounded-lg pointer-events-none"
            style={{
              // Use fixed inset values to prevent any layout impact
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              boxShadow: 'inset 0 0 0 2px #CCFF00',
            }}
          >
            {/* Interactive resize handles - positioned absolutely so they don't affect layout */}
            <div 
              className="absolute w-4 h-4 bg-[#CCFF00] rounded-full pointer-events-auto cursor-nw-resize touch-none"
              style={{ top: -8, left: -8 }}
              onPointerDown={(e) => handleResizeStart(e, 'top-left')}
              onTouchStart={(e) => handleResizeStart(e, 'top-left')}
            />
            <div 
              className="absolute w-4 h-4 bg-[#CCFF00] rounded-full pointer-events-auto cursor-ne-resize touch-none"
              style={{ top: -8, right: -8 }}
              onPointerDown={(e) => handleResizeStart(e, 'top-right')}
              onTouchStart={(e) => handleResizeStart(e, 'top-right')}
            />
            <div 
              className="absolute w-4 h-4 bg-[#CCFF00] rounded-full pointer-events-auto cursor-sw-resize touch-none"
              style={{ bottom: -8, left: -8 }}
              onPointerDown={(e) => handleResizeStart(e, 'bottom-left')}
              onTouchStart={(e) => handleResizeStart(e, 'bottom-left')}
            />
            <div 
              className="absolute w-4 h-4 bg-[#CCFF00] rounded-full pointer-events-auto cursor-se-resize touch-none"
              style={{ bottom: -8, right: -8 }}
              onPointerDown={(e) => handleResizeStart(e, 'bottom-right')}
              onTouchStart={(e) => handleResizeStart(e, 'bottom-right')}
            />
          </div>
        )}
      </div>
    );
  };

  // Base outline shadow that ensures visibility on any background
  const baseOutlineShadow = '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 1px 0 #000, 0 -1px 0 #000';
  
  // Packs that should NOT have forced outline (clean minimal look or gradient text)
  const noOutlinePacks = [OverlayPack.CAL_SANS, OverlayPack.GLASS];
  const hasGradientText = style.hasGradientText === true;
  const skipOutline = noOutlinePacks.includes(pack) || hasGradientText;
  
  // Get pack's text style - pass custom color for gradient packs
  const packTextStyle = style.getTextStyle(customColor);
  
  // Common text style with custom color support
  // Most packs get forced outline for visibility, but gradient/minimal packs skip it
  const textStyle: React.CSSProperties = hasGradientText
    ? {
        // For gradient packs: use the pack's styling directly (includes gradient background)
        fontFamily: style.font,
        ...packTextStyle,
      }
    : {
        fontFamily: style.font,
        color: activeColor,
        ...packTextStyle,
        // For outline packs: ensure strong outline. For no-outline packs: use pack's shadow or none
        textShadow: skipOutline 
          ? (packTextStyle.textShadow || 'none')
          : (packTextStyle.textShadow 
              ? `${packTextStyle.textShadow}, ${baseOutlineShadow}`
              : baseOutlineShadow),
        // Add webkit stroke for mobile canvas capture compatibility (skip for minimal packs)
        WebkitTextStroke: skipOutline ? 'none' : (packTextStyle.WebkitTextStroke || '1.5px #000'),
        paintOrder: 'stroke fill',
      };
  
  // Label style - similar but thinner stroke for smaller text
  const labelOutlineStyle: React.CSSProperties = skipOutline 
    ? {} 
    : {
        textShadow: baseOutlineShadow,
        WebkitTextStroke: '1px #000',
        paintOrder: 'stroke fill',
      };
  
  // Route color: use custom route color if provided, otherwise use pack default
  // Route color is independent from text color - only changes when explicitly set
  // For Glass, apply the tint to route color too
  const routeColor = pack === OverlayPack.GLASS
    ? getGlassTintColor(customRouteColor || style.routeColor)
    : (customRouteColor || style.routeColor);

  // Helper function to get CSS filter styles for effects
  const getEffectFilter = (effect?: ElementEffect): React.CSSProperties => {
    if (!effect || effect.type === 'none') return {};
    
    const intensity = effect.intensity / 100;
    
    switch (effect.type) {
      case 'blur':
        return { filter: `blur(${intensity * 5}px)` };
      case 'grain':
      case 'glitch':
        // These require SVG filters - will be handled by EffectWrapper
        return {};
      default:
        return {};
    }
  };
  
  // Check if we need SVG-based effects (more complex effects)
  const needsSvgEffect = (effect?: ElementEffect) => {
    if (!effect || effect.type === 'none') return false;
    return ['grain', 'glitch'].includes(effect.type);
  };

  // Check if we need sticker outline
  const needsSticker = (sticker?: StickerOutline) => {
    return sticker && sticker.enabled;
  };

  // Helper component that conditionally wraps content with EffectWrapper and/or StickerWrapper
  const MaybeEffect: React.FC<{ 
    effect?: ElementEffect; 
    sticker?: StickerOutline;
    children: React.ReactNode 
  }> = ({ effect, sticker, children }) => {
    let content = <>{children}</>;
    
    // Apply sticker first (inner layer)
    if (needsSticker(sticker)) {
      content = <StickerWrapper sticker={sticker}>{content}</StickerWrapper>;
    }
    
    // Apply effect second (outer layer)
    if (needsSvgEffect(effect)) {
      content = <EffectWrapper effect={effect}>{content}</EffectWrapper>;
    }
    
    return content;
  };

  // Get pack-specific horizontal scale factor
  const horizontalScale = PACK_HORIZONTAL_SCALE[pack] || 1.0;
  const needsScaling = horizontalScale < 1.0;
  
  // Text size classes based on preview mode - scaled packs need smaller sizes
  const isCyber = pack === OverlayPack.CYBER;
  const textSizes = {
    xlarge: isPreview 
      ? (needsScaling ? 'text-xs' : 'text-lg') 
      : (needsScaling ? 'text-xl' : 'text-4xl'),
    large: isPreview 
      ? (needsScaling ? 'text-[10px]' : 'text-base') 
      : (needsScaling ? 'text-lg' : 'text-3xl'),
    medium: isPreview 
      ? (needsScaling ? 'text-[8px]' : 'text-sm') 
      : (needsScaling ? 'text-base' : 'text-2xl'),
    small: isPreview 
      ? (needsScaling ? 'text-[6px]' : 'text-xs') 
      : (needsScaling ? 'text-xs' : 'text-sm'),
    tiny: isPreview 
      ? (needsScaling ? 'text-[4px]' : 'text-[6px]') 
      : (needsScaling ? 'text-[8px]' : 'text-[10px]'),
  };

  // Title element component
  const TitleElement = () => {
    if (!showTitle || !activityTitle) return null;
    return (
      <div 
        onClick={(e) => { if (onTitleTap && isEditing) { e.stopPropagation(); onTitleTap(); } }}
        style={{ cursor: isEditing ? 'pointer' : 'default' }}
      >
        <TransformableWrapper elementId="title" className={isPreview ? 'mb-2' : 'mb-4'}>
          <div 
            className={`text-center ${isPreview ? 'text-xs' : 'text-lg'} font-medium`}
            style={textStyle}
          >
            {activityTitle}
          </div>
        </TransformableWrapper>
      </div>
    );
  };

  // Date element component - similar to title but positioned at bottom
  const DateElement = () => {
    if (!showDate || !activityDate) return null;
    return (
      <div 
        onClick={(e) => { if (onDateTap && isEditing) { e.stopPropagation(); onDateTap(); } }}
        style={{ cursor: isEditing ? 'pointer' : 'default' }}
      >
        <TransformableWrapper elementId="date" className={isPreview ? 'mt-2' : 'mt-4'}>
          <div 
            className={`text-center ${isPreview ? 'text-[8px]' : 'text-sm'} opacity-80`}
            style={textStyle}
          >
            {activityDate}
          </div>
        </TransformableWrapper>
      </div>
    );
  };

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'stats-only':
        // Stats on top, route below - grouped together
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Title */}
            <TitleElement />
            
            {/* Stats */}
            <div 
              onClick={(e) => { if (onStatsTap && isEditing) { e.stopPropagation(); onStatsTap(); } }}
              style={{ cursor: isEditing ? 'pointer' : 'default', ...getEffectFilter(statsEffect) }}
            >
              <MaybeEffect effect={statsEffect} sticker={statsSticker}>
                <TransformableWrapper elementId="stats" className={`${isPreview ? 'px-2' : 'px-6'}`}>
                  <div className={`text-center ${isPreview ? 'space-y-1' : 'space-y-2'}`}>
                    {(isPreview ? prioritizedStats.slice(0, 3) : prioritizedStats).map((stat, i) => (
                      <div key={i} className="whitespace-nowrap">
                        {showLabels && (
                          <span 
                            className={`${isPreview ? 'text-[6px]' : 'text-xs'} uppercase tracking-wider block`}
                            style={{ fontFamily: style.font, color: activeColor, ...labelOutlineStyle }}
                          >
                            {stat.label}
                          </span>
                        )}
                        <span 
                          className={`${textSizes.xlarge} font-bold block leading-none`}
                          style={textStyle}
                        >
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </TransformableWrapper>
              </MaybeEffect>
            </div>
            
            {/* Route - right below stats with fixed size */}
            {showRoute && activity.polyline && (
              <div 
                onClick={(e) => { if (onRouteTap && isEditing) { e.stopPropagation(); onRouteTap(); } }}
                style={{ cursor: isEditing ? 'pointer' : 'default', ...getEffectFilter(routeEffect) }}
              >
                <MaybeEffect effect={routeEffect} sticker={routeSticker}>
                  <TransformableWrapper elementId="route" className={`${isPreview ? 'mt-3 w-24 h-16' : 'mt-4 w-48 h-32'}`}>
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <RoutePolyline
                        polylineEncoded={activity.polyline}
                        x={0}
                        y={0}
                        scale={isPreview ? 0.4 : 0.55}
                        maxHeight={isPreview ? 150 : 300}
                        maxWidth={isPreview ? 224 : 450}
                        opacity={1}
                        strokeWidth={isPreview ? style.routeStrokeWidth * 0.6 : style.routeStrokeWidth}
                        strokeColor={routeColor}
                        style={customRouteStyle || style.routeStyle}
                        outline={style.routeOutline}
                        outlineColor={style.routeOutlineColor}
                        outlineWidth={isPreview ? style.routeOutlineWidth * 0.6 : style.routeOutlineWidth}
                        outlineOnly={style.routeOutlineOnly}
                        sketchy={style.routeSketchy}
                        shadowOffset={style.routeShadowOffset}
                        shadowColor={style.routeShadowColor}
                        shadowOpacity={style.routeShadowOpacity}
                        pixelated={style.routePixelated}
                        isEditing={false}
                        isSelected={false}
                      />
                    </div>
                  </TransformableWrapper>
                </MaybeEffect>
              </div>
            )}
            
            {/* Date */}
            <DateElement />
          </div>
        );

      case 'route-only':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Title */}
            <TitleElement />
            
            <div 
              className={`flex items-center justify-center ${isPreview ? 'p-2' : 'p-6'}`}
              onClick={(e) => { if (onRouteTap && isEditing) { e.stopPropagation(); onRouteTap(); } }}
              style={{ cursor: isEditing ? 'pointer' : 'default' }}
            >
              <TransformableWrapper elementId="route">
                {showRoute && activity.polyline ? (
                  <RoutePolyline
                    polylineEncoded={activity.polyline}
                    x={0}
                    y={0}
                    scale={isPreview ? 0.6 : 0.9}
                    opacity={1}
                    strokeWidth={isPreview ? style.routeStrokeWidth * 0.6 : style.routeStrokeWidth}
                    strokeColor={routeColor}
                    style={customRouteStyle || style.routeStyle}
                    outline={style.routeOutline}
                    outlineColor={style.routeOutlineColor}
                    outlineWidth={isPreview ? style.routeOutlineWidth * 0.6 : style.routeOutlineWidth}
                    outlineOnly={style.routeOutlineOnly}
                    sketchy={style.routeSketchy}
                    shadowOffset={style.routeShadowOffset}
                    shadowColor={style.routeShadowColor}
                    shadowOpacity={style.routeShadowOpacity}
                    pixelated={style.routePixelated}
                    isEditing={false}
                    isSelected={false}
                  />
                ) : (
                  <div 
                    className="text-center"
                    style={{ fontFamily: style.font, color: activeColor }}
                  >
                    <span className={textSizes.small}>No route data</span>
                  </div>
                )}
              </TransformableWrapper>
            </div>
            
            {/* Date */}
            <DateElement />
          </div>
        );

      case 'route-stats':
        // For horizontal stats, use compact text to prevent overflow
        // Stats wrap to rows of 3 max
        const statsCount = prioritizedStats.length;
        const routeStatsTextSize = isPreview 
          ? 'text-[8px]'  // Very small for preview thumbnails
          : (
            horizontalScale < 0.7 ? 'text-xs' :        // Very wide fonts - smallest
            horizontalScale < 0.85 ? 'text-sm' :       // Wide fonts
            horizontalScale < 0.96 ? 'text-base' :     // Medium-wide fonts
            statsCount > 3 ? 'text-base' :             // Many stats
            'text-lg'                                  // Normal fonts, few stats
          );
        
        // Split stats into rows of 3 for display
        const displayStats = isPreview ? prioritizedStats.slice(0, 3) : prioritizedStats;
        const firstRowStats = displayStats.slice(0, 3);
        const secondRowStats = displayStats.slice(3, 6);
        
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-3 overflow-hidden">
            {/* Title */}
            <TitleElement />
            
            {/* Route - with fixed size and margin to separate from stats */}
            {showRoute && activity.polyline && (
              <div 
                onClick={(e) => { if (onRouteTap && isEditing) { e.stopPropagation(); onRouteTap(); } }}
                style={{ cursor: isEditing ? 'pointer' : 'default', ...getEffectFilter(routeEffect) }}
                className={isPreview ? 'mb-2' : 'mb-4'}
              >
                <MaybeEffect effect={routeEffect} sticker={routeSticker}>
                  <TransformableWrapper elementId="route" className={`${isPreview ? 'w-28 h-16' : 'w-72 h-44'}`}>
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <RoutePolyline
                        polylineEncoded={activity.polyline}
                        x={0}
                        y={0}
                        scale={isPreview ? 0.5 : 0.6}
                        maxHeight={isPreview ? 64 : 176}
                        maxWidth={isPreview ? 112 : 288}
                        opacity={1}
                        strokeWidth={isPreview ? style.routeStrokeWidth * 0.6 : style.routeStrokeWidth}
                        strokeColor={routeColor}
                        style={customRouteStyle || style.routeStyle}
                        outline={style.routeOutline}
                        outlineColor={style.routeOutlineColor}
                        outlineWidth={isPreview ? style.routeOutlineWidth * 0.6 : style.routeOutlineWidth}
                        outlineOnly={style.routeOutlineOnly}
                        sketchy={style.routeSketchy}
                        shadowOffset={style.routeShadowOffset}
                        shadowColor={style.routeShadowColor}
                        shadowOpacity={style.routeShadowOpacity}
                        pixelated={style.routePixelated}
                        isEditing={false}
                        isSelected={false}
                      />
                    </div>
                  </TransformableWrapper>
                </MaybeEffect>
              </div>
            )}
            
            {/* Stats - rows of 3 max */}
            <div 
              onClick={(e) => { if (onStatsTap && isEditing) { e.stopPropagation(); onStatsTap(); } }}
              style={{ cursor: isEditing ? 'pointer' : 'default', ...getEffectFilter(statsEffect) }}
            >
              <MaybeEffect effect={statsEffect} sticker={statsSticker}>
                <TransformableWrapper elementId="stats" className={`${isPreview ? 'mt-1' : 'mt-3'}`}>
                  <div className="flex flex-col items-center gap-1">
                    {/* First row - up to 3 stats */}
                    <div className={`flex items-center justify-center ${isPreview ? 'gap-1' : 'gap-x-3'}`}>
                      {firstRowStats.map((stat, i) => (
                        <div key={i} className="text-center whitespace-nowrap">
                          <span 
                            className={`${routeStatsTextSize} font-bold`}
                            style={textStyle}
                          >
                            {stat.value}
                          </span>
                          {showLabels && !isPreview && (
                            <span 
                              className="text-[9px] uppercase tracking-widest block mt-0.5"
                              style={{ fontFamily: style.font, color: activeColor, ...labelOutlineStyle }}
                            >
                              {stat.label}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Second row - stats 4-6 if present */}
                    {secondRowStats.length > 0 && !isPreview && (
                      <div className={`flex items-center justify-center ${isPreview ? 'gap-1' : 'gap-x-3'}`}>
                        {secondRowStats.map((stat, i) => (
                          <div key={i + 3} className="text-center whitespace-nowrap">
                            <span 
                              className={`${routeStatsTextSize} font-bold`}
                              style={textStyle}
                            >
                              {stat.value}
                            </span>
                            {showLabels && (
                              <span 
                                className="text-[9px] uppercase tracking-widest block mt-0.5"
                                style={{ fontFamily: style.font, color: activeColor, ...labelOutlineStyle }}
                              >
                                {stat.label}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TransformableWrapper>
              </MaybeEffect>
            </div>
          </div>
        );

      case 'full-data':
        return (
          <div className="absolute inset-0 flex flex-col">
            {/* Title at top */}
            {showTitle && activityTitle && (
              <div 
                className={`flex justify-center ${isPreview ? 'pt-3' : 'pt-6'}`}
                onClick={(e) => { if (onTitleTap && isEditing) { e.stopPropagation(); onTitleTap(); } }}
                style={{ cursor: isEditing ? 'pointer' : 'default' }}
              >
                <TransformableWrapper elementId="title">
                  <div 
                    className={`text-center ${isPreview ? 'text-xs' : 'text-lg'} font-medium`}
                    style={textStyle}
                  >
                    {activityTitle}
                  </div>
                </TransformableWrapper>
              </div>
            )}
            
            {/* Stats at bottom */}
            <div 
              className={`flex-1 flex items-end justify-center ${isPreview ? 'pb-4 px-2' : 'pb-10 px-6'}`}
              onClick={(e) => { if (onStatsTap && isEditing) { e.stopPropagation(); onStatsTap(); } }}
              style={{ cursor: isEditing ? 'pointer' : 'default' }}
            >
              <TransformableWrapper elementId="stats">
                <div className={`${isPreview ? 'space-y-0' : 'space-y-1'} text-center`}>
                  {prioritizedStats.map((stat, i) => (
                    <div key={i} className={`flex items-baseline justify-center ${isPreview ? 'gap-1' : 'gap-2'}`}>
                      <span 
                        className={`${textSizes.large} font-bold`}
                        style={textStyle}
                      >
                        {stat.value}
                      </span>
                      {showLabels && !isPreview && (
                        <span 
                          className="text-[10px] uppercase tracking-widest"
                          style={{ fontFamily: style.font, color: activeColor, ...labelOutlineStyle }}
                        >
                          {stat.label}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </TransformableWrapper>
            </div>
            
            {/* Date */}
            <DateElement />
          </div>
        );

      case 'title-only':
        const titleText = isPreview && activity.title.length > 12 ? activity.title.slice(0, 12) + '...' : activity.title;
        return (
          <div className={`absolute inset-0 flex items-center justify-center ${isPreview ? 'px-2' : 'px-6'}`}>
            <TransformableWrapper elementId="title">
              <span 
                className={`${textSizes.xlarge} font-bold text-center leading-tight`}
                style={textStyle}
              >
                {titleText}
              </span>
            </TransformableWrapper>
          </div>
        );

      case 'scattered':
        // Scattered layout - stats positioned around the route (all 4 corners + sides)
        const scatteredPositions = [
          { top: '6%', left: '6%' },
          { top: '6%', right: '6%' },
          { bottom: '8%', left: '6%' },
          { bottom: '8%', right: '6%' },
          { top: '30%', left: '4%' },
          { top: '30%', right: '4%' },
          { bottom: '28%', left: '4%' },
          { bottom: '28%', right: '4%' },
        ];
        
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Title at top center */}
            {showTitle && activityTitle && (
              <div 
                className={`absolute left-0 right-0 ${isPreview ? 'top-2' : 'top-4'} flex justify-center`}
                onClick={(e) => { if (onTitleTap && isEditing) { e.stopPropagation(); onTitleTap(); } }}
                style={{ cursor: isEditing ? 'pointer' : 'default' }}
              >
                <TransformableWrapper elementId="title">
                  <div 
                    className={`text-center ${isPreview ? 'text-xs' : 'text-lg'} font-medium`}
                    style={textStyle}
                  >
                    {activityTitle}
                  </div>
                </TransformableWrapper>
              </div>
            )}
            
            {/* Route in center */}
            {showRoute && activity.polyline && (
              <div 
                className="absolute inset-0 flex items-center justify-center"
                onClick={(e) => { if (onRouteTap && isEditing) { e.stopPropagation(); onRouteTap(); } }}
                style={{ cursor: isEditing ? 'pointer' : 'default' }}
              >
                <RoutePolyline
                  polylineEncoded={activity.polyline}
                  x={0}
                  y={0}
                  scale={isPreview ? 0.5 : 0.7}
                  maxHeight={isPreview ? 194 : 480}
                  maxWidth={isPreview ? 194 : 480}
                  opacity={1}
                  strokeWidth={isPreview ? style.routeStrokeWidth * 0.6 : style.routeStrokeWidth}
                  strokeColor={routeColor}
                  style={customRouteStyle || style.routeStyle}
                  outline={style.routeOutline}
                  outlineColor={style.routeOutlineColor}
                  outlineWidth={isPreview ? style.routeOutlineWidth * 0.6 : style.routeOutlineWidth}
                  outlineOnly={style.routeOutlineOnly}
                  sketchy={style.routeSketchy}
                  shadowOffset={style.routeShadowOffset}
                  shadowColor={style.routeShadowColor}
                  shadowOpacity={style.routeShadowOpacity}
                  pixelated={style.routePixelated}
                  isEditing={false}
                  isSelected={false}
                />
              </div>
            )}
            
            {/* Scattered stats - show all enabled stats */}
            {(isPreview ? prioritizedStats.slice(0, 5) : prioritizedStats).map((stat, i) => {
              const pos = scatteredPositions[i % scatteredPositions.length];
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{ 
                    ...pos,
                    cursor: isEditing ? 'pointer' : 'default',
                  }}
                  onClick={(e) => { if (onStatsTap && isEditing) { e.stopPropagation(); onStatsTap(); } }}
                >
                  <TransformableWrapper elementId={`stat-${i}`}>
                    <div className="text-center whitespace-nowrap">
                      {showLabels && (
                        <span 
                          className={`${isPreview ? 'text-[5px]' : 'text-[10px]'} uppercase tracking-wider block`}
                          style={{ fontFamily: style.font, color: activeColor, ...labelOutlineStyle }}
                        >
                          {stat.label}
                        </span>
                      )}
                      <span 
                        className={`${isPreview ? 'text-xs' : 'text-xl'} font-bold block leading-none`}
                        style={textStyle}
                      >
                        {stat.value}
                      </span>
                    </div>
                  </TransformableWrapper>
                </div>
              );
            })}
            
            {/* Date at bottom center */}
            {showDate && activityDate && (
              <div 
                className={`absolute left-0 right-0 ${isPreview ? 'bottom-2' : 'bottom-4'} flex justify-center`}
                onClick={(e) => { if (onDateTap && isEditing) { e.stopPropagation(); onDateTap(); } }}
                style={{ cursor: isEditing ? 'pointer' : 'default' }}
              >
                <TransformableWrapper elementId="date">
                  <div 
                    className={`text-center ${isPreview ? 'text-[8px]' : 'text-sm'} opacity-80`}
                    style={textStyle}
                  >
                    {activityDate}
                  </div>
                </TransformableWrapper>
              </div>
            )}
          </div>
        );

      case 'hero-stat':
        // Route on top, large hero stat, then all supporting stats below
        const heroStat = prioritizedStats[0];
        const supportingStats = prioritizedStats.slice(1); // Show ALL remaining stats
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Title at very top */}
            <TitleElement />
            
            {/* Route on top */}
            {showRoute && activity.polyline && (
              <div 
                onClick={(e) => { if (onRouteTap && isEditing) { e.stopPropagation(); onRouteTap(); } }}
                style={{ cursor: isEditing ? 'pointer' : 'default', ...getEffectFilter(routeEffect) }}
                className={isPreview ? 'mb-2' : 'mb-4'}
              >
                <MaybeEffect effect={routeEffect} sticker={routeSticker}>
                  <TransformableWrapper elementId="route" className={`${isPreview ? 'w-20 h-12' : 'w-40 h-28'}`}>
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <RoutePolyline
                        polylineEncoded={activity.polyline}
                        x={0}
                        y={0}
                        scale={isPreview ? 0.35 : 0.5}
                        maxHeight={isPreview ? 114 : 270}
                        maxWidth={isPreview ? 180 : 374}
                        opacity={1}
                        strokeWidth={isPreview ? style.routeStrokeWidth * 0.5 : style.routeStrokeWidth * 0.8}
                        strokeColor={routeColor}
                        style={customRouteStyle || style.routeStyle}
                        outline={style.routeOutline}
                        outlineColor={style.routeOutlineColor}
                        outlineWidth={isPreview ? style.routeOutlineWidth * 0.5 : style.routeOutlineWidth * 0.8}
                        outlineOnly={style.routeOutlineOnly}
                        sketchy={style.routeSketchy}
                        shadowOffset={style.routeShadowOffset}
                        shadowColor={style.routeShadowColor}
                        shadowOpacity={style.routeShadowOpacity}
                        pixelated={style.routePixelated}
                        isEditing={false}
                        isSelected={false}
                      />
                    </div>
                  </TransformableWrapper>
                </MaybeEffect>
              </div>
            )}
            
            {/* All stats grouped together - hero + supporting move/resize as one */}
            <div 
              onClick={(e) => { if (onStatsTap && isEditing) { e.stopPropagation(); onStatsTap(); } }}
              style={{ cursor: isEditing ? 'pointer' : 'default', ...getEffectFilter(statsEffect) }}
            >
              <MaybeEffect effect={statsEffect} sticker={statsSticker}>
                <TransformableWrapper elementId="hero-stat" className="flex flex-col items-center">
                  {/* Hero stat - large and prominent */}
                  {heroStat && (
                    <div className="text-center">
                      {showLabels && (
                        <span 
                          className={`${isPreview ? 'text-[5px]' : 'text-xs'} uppercase tracking-wider block mb-0.5`}
                          style={{ fontFamily: style.font, color: activeColor, ...labelOutlineStyle }}
                        >
                          {heroStat.label}
                        </span>
                      )}
                      <span 
                        className={`${isPreview ? 'text-2xl' : 'text-5xl'} font-black block leading-none`}
                        style={textStyle}
                      >
                        {heroStat.value}
                      </span>
                    </div>
                  )}
                  
                  {/* Supporting stats - smaller, in rows - show ALL */}
                  {supportingStats.length > 0 && (
                    <div className={`flex flex-wrap justify-center ${isPreview ? 'gap-2 mt-1 max-w-[90%]' : 'gap-4 mt-4 max-w-[85%]'}`}>
                      {(isPreview ? supportingStats.slice(0, 4) : supportingStats).map((stat, i) => (
                        <div key={i} className="text-center">
                          {showLabels && (
                            <span 
                              className={`${isPreview ? 'text-[4px]' : 'text-[8px]'} uppercase tracking-wider block`}
                              style={{ fontFamily: style.font, color: activeColor, ...labelOutlineStyle }}
                            >
                              {stat.label}
                            </span>
                          )}
                          <span 
                            className={`${isPreview ? 'text-[7px]' : 'text-sm'} font-bold block leading-tight`}
                            style={textStyle}
                          >
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </TransformableWrapper>
              </MaybeEffect>
            </div>
            
            {/* Date */}
            <DateElement />
          </div>
        );

      case 'circular':
        // Text arranged in a circle using SVG textPath
        const circleStats = prioritizedStats; // Use ALL stats
        // Get textPath scale for this pack - larger fonts need larger circles
        const circleScale = PACK_TEXTPATH_SCALE[pack];
        // Use consistent sizing - scale circle for larger fonts
        const circleRadius = (isPreview ? 55 : 110) * Math.max(1, circleScale * 0.7);
        const circlePadding = (isPreview ? 15 : 30) * Math.max(1, circleScale * 0.7);
        const circleSize = (circleRadius + circlePadding) * 2;
        // Build the circular text string with bullets between stats
        const circularText = circleStats.map(s => `${s.value}`).join(' • ');
        // Repeat the text enough times to fill the circle
        const repeatedText = `${circularText} • `.repeat(4);
        
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Title at top */}
            {showTitle && activityTitle && (
              <div 
                className={`absolute left-0 right-0 ${isPreview ? 'top-2' : 'top-4'} flex justify-center`}
                onClick={(e) => { if (onTitleTap && isEditing) { e.stopPropagation(); onTitleTap(); } }}
                style={{ cursor: isEditing ? 'pointer' : 'default' }}
              >
                <TransformableWrapper elementId="title">
                  <div 
                    className={`text-center ${isPreview ? 'text-xs' : 'text-lg'} font-medium`}
                    style={textStyle}
                  >
                    {activityTitle}
                  </div>
                </TransformableWrapper>
              </div>
            )}
            
            {/* Route in center (behind circular text) - hidden in preview */}
            {showRoute && activity.polyline && !isPreview && (
              <div 
                className="absolute"
                onClick={(e) => { if (onRouteTap && isEditing) { e.stopPropagation(); onRouteTap(); } }}
                style={{ cursor: isEditing ? 'pointer' : 'default', ...getEffectFilter(routeEffect) }}
              >
                <MaybeEffect effect={routeEffect} sticker={routeSticker}>
                  <RoutePolyline
                    polylineEncoded={activity.polyline}
                    x={0}
                    y={0}
                    scale={isPreview ? 0.35 : 0.5}
                    maxHeight={isPreview ? 150 : 374}
                    maxWidth={isPreview ? 150 : 374}
                    opacity={1}
                    strokeWidth={isPreview ? style.routeStrokeWidth * 0.5 : style.routeStrokeWidth * 0.7}
                    strokeColor={routeColor}
                    style={customRouteStyle || style.routeStyle}
                    outline={style.routeOutline}
                    outlineColor={style.routeOutlineColor}
                    outlineWidth={isPreview ? style.routeOutlineWidth * 0.5 : style.routeOutlineWidth * 0.7}
                    outlineOnly={style.routeOutlineOnly}
                    sketchy={style.routeSketchy}
                    shadowOffset={style.routeShadowOffset}
                    shadowColor={style.routeShadowColor}
                    shadowOpacity={style.routeShadowOpacity}
                    pixelated={style.routePixelated}
                    isEditing={false}
                    isSelected={false}
                  />
                </MaybeEffect>
              </div>
            )}
            
            {/* Circular text using SVG */}
            <div 
              onClick={(e) => { if (onStatsTap && isEditing) { e.stopPropagation(); onStatsTap(); } }}
              style={{ cursor: isEditing ? 'pointer' : 'default', ...getEffectFilter(statsEffect) }}
            >
              <MaybeEffect effect={statsEffect} sticker={statsSticker}>
                <TransformableWrapper elementId="circular-stats">
                  <svg 
                    width={circleSize} 
                    height={circleSize} 
                    viewBox={`0 0 ${circleSize} ${circleSize}`}
                    style={{ overflow: 'visible' }}
                  >
                    <defs>
                      <path
                        id={`circlePath-${isPreview ? 'p' : 'c'}`}
                        d={`M ${circleSize/2}, ${circleSize/2} m -${circleRadius}, 0 a ${circleRadius},${circleRadius} 0 1,1 ${circleRadius*2},0 a ${circleRadius},${circleRadius} 0 1,1 -${circleRadius*2},0`}
                        fill="none"
                      />
                    </defs>
                    {/* Stroke outline for better visibility */}
                    <text
                      style={{
                        fontFamily: style.font,
                        fontSize: `${(isPreview ? 9 : 16) * PACK_TEXTPATH_SCALE[pack]}px`,
                        fontWeight: 'bold',
                        fill: 'none',
                        stroke: '#000',
                        strokeWidth: isPreview ? 2 : 3.5,
                        strokeLinejoin: 'round',
                        letterSpacing: isPreview ? '1px' : '2px',
                      }}
                    >
                      <textPath href={`#circlePath-${isPreview ? 'p' : 'c'}`} startOffset="0%">
                        {repeatedText}
                      </textPath>
                    </text>
                    {/* Main fill text on top */}
                    <text
                      style={{
                        fontFamily: style.font,
                        fontSize: `${(isPreview ? 9 : 16) * PACK_TEXTPATH_SCALE[pack]}px`,
                        fontWeight: 'bold',
                        fill: activeColor,
                        letterSpacing: isPreview ? '1px' : '2px',
                      }}
                    >
                      <textPath href={`#circlePath-${isPreview ? 'p' : 'c'}`} startOffset="0%">
                        {repeatedText}
                      </textPath>
                  </text>
                </svg>
              </TransformableWrapper>
              </MaybeEffect>
            </div>
          </div>
        );

      case 'wavy':
        // Text on a sine wave path using SVG - show all enabled stats
        const wavyStats = prioritizedStats;
        // Build the wavy text string with all stats first to calculate needed width
        const wavyText = wavyStats.map(s => `${s.value}`).join(' • ');
        
        // Get textPath scale for this pack
        const wavyScale = PACK_TEXTPATH_SCALE[pack];
        
        // Dynamic width based on text length - use tighter character width estimate
        const charWidth = (isPreview ? 4 : 7) * wavyScale;
        const baseWidth = isPreview ? 80 : 150;
        const calculatedWidth = Math.max(baseWidth, wavyText.length * charWidth);
        const wavyWidth = calculatedWidth;
        // Scale height and amplitude for larger fonts
        const wavyHeight = (isPreview ? 35 : 60) * Math.max(1, wavyScale * 0.8);
        const waveAmplitude = (isPreview ? 6 : 12) * Math.max(1, wavyScale * 0.7);
        // More wave cycles for longer text
        const waveCount = Math.max(2, Math.ceil(wavyWidth / (isPreview ? 60 : 120)));
        
        // Build sine wave path
        const buildWavePath = () => {
          const points: string[] = [];
          const steps = 60;
          for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * wavyWidth;
            const y = (wavyHeight / 2) + Math.sin((i / steps) * Math.PI * 2 * waveCount) * waveAmplitude;
            points.push(i === 0 ? `M ${x},${y}` : `L ${x},${y}`);
          }
          return points.join(' ');
        };
        
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Title at top */}
            <TitleElement />
            
            {/* Route behind wavy text - hidden in preview */}
            {showRoute && activity.polyline && !isPreview && (
              <div 
                className="absolute"
                onClick={(e) => { if (onRouteTap && isEditing) { e.stopPropagation(); onRouteTap(); } }}
                style={{ cursor: isEditing ? 'pointer' : 'default', ...getEffectFilter(routeEffect) }}
              >
                <MaybeEffect effect={routeEffect} sticker={routeSticker}>
                  <RoutePolyline
                    polylineEncoded={activity.polyline}
                    x={0}
                    y={0}
                    scale={isPreview ? 0.4 : 0.55}
                    maxHeight={isPreview ? 164 : 420}
                    maxWidth={isPreview ? 240 : 494}
                    opacity={1}
                    strokeWidth={isPreview ? style.routeStrokeWidth * 0.5 : style.routeStrokeWidth * 0.7}
                    strokeColor={routeColor}
                    style={customRouteStyle || style.routeStyle}
                    outline={style.routeOutline}
                    outlineColor={style.routeOutlineColor}
                    outlineWidth={isPreview ? style.routeOutlineWidth * 0.5 : style.routeOutlineWidth * 0.7}
                    outlineOnly={style.routeOutlineOnly}
                    sketchy={style.routeSketchy}
                    shadowOffset={style.routeShadowOffset}
                    shadowColor={style.routeShadowColor}
                    shadowOpacity={style.routeShadowOpacity}
                    pixelated={style.routePixelated}
                    isEditing={false}
                    isSelected={false}
                  />
                </MaybeEffect>
              </div>
            )}
            
            {/* Wavy sine wave text using SVG */}
            <div 
              onClick={(e) => { if (onStatsTap && isEditing) { e.stopPropagation(); onStatsTap(); } }}
              style={{ cursor: isEditing ? 'pointer' : 'default', ...getEffectFilter(statsEffect) }}
            >
              <MaybeEffect effect={statsEffect} sticker={statsSticker}>
                <TransformableWrapper elementId="wavy-stats">
                  <svg 
                    width={wavyWidth} 
                    height={wavyHeight} 
                    viewBox={`0 0 ${wavyWidth} ${wavyHeight}`}
                    style={{ overflow: 'visible' }}
                  >
                    <defs>
                      <path
                        id={`wavyPath-${isPreview ? 'p' : 'c'}`}
                        d={buildWavePath()}
                        fill="none"
                      />
                    </defs>
                    {/* Stroke outline for better visibility */}
                    <text
                      style={{
                        fontFamily: style.font,
                        fontSize: `${(isPreview ? 8 : 14) * PACK_TEXTPATH_SCALE[pack]}px`,
                        fontWeight: 'bold',
                        fill: 'none',
                        stroke: '#000',
                        strokeWidth: isPreview ? 1.5 : 3,
                        strokeLinejoin: 'round',
                        letterSpacing: isPreview ? '0.3px' : '0.5px',
                      }}
                    >
                      <textPath href={`#wavyPath-${isPreview ? 'p' : 'c'}`} startOffset="0%">
                        {wavyText}
                      </textPath>
                    </text>
                    {/* Main fill text on top */}
                    <text
                      style={{
                        fontFamily: style.font,
                        fontSize: `${(isPreview ? 8 : 14) * PACK_TEXTPATH_SCALE[pack]}px`,
                        fontWeight: 'bold',
                        fill: activeColor,
                        letterSpacing: isPreview ? '0.3px' : '0.5px',
                      }}
                    >
                      <textPath href={`#wavyPath-${isPreview ? 'p' : 'c'}`} startOffset="0%">
                        {wavyText}
                      </textPath>
                    </text>
                  </svg>
                </TransformableWrapper>
              </MaybeEffect>
            </div>
          </div>
        );

      case 'create':
        // Create mode - blank canvas, elements added individually
        if (isPreview) {
          // Show "+ CREATE" in pack font for thumbnail - scale for decorative fonts
          const createScale = PACK_TEXTPATH_SCALE[pack];
          return (
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="text-center"
                style={{ 
                  fontFamily: style.font, 
                  color: activeColor,
                  textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                }}
              >
                <div style={{ fontSize: `${2.25 * createScale}rem`, fontWeight: 'bold' }}>+</div>
                <div style={{ fontSize: `${0.875 * createScale}rem`, letterSpacing: '0.05em', marginTop: '0.25rem' }}>CREATE</div>
              </div>
            </div>
          );
        }
        
        // Full create mode - show added elements
        // Each element is absolutely positioned so they don't shift when new elements are added
        return (
          <div className="absolute inset-0">
            {/* Title element - starts at top center */}
            {createdElements.includes('title') && activityTitle && (
              <div 
                className="absolute"
                style={{ top: '10%', left: '50%', transform: 'translateX(-50%)', cursor: isEditing ? 'pointer' : 'default' }}
                onClick={(e) => { if (onTitleTap && isEditing) { e.stopPropagation(); onTitleTap(); } }}
              >
                <TransformableWrapper elementId="create-title">
                  <div 
                    className="text-lg font-medium whitespace-nowrap"
                    style={textStyle}
                  >
                    {activityTitle}
                  </div>
                </TransformableWrapper>
              </div>
            )}
            
            {/* Route element - starts at center */}
            {createdElements.includes('route') && activity.polyline && (
              <div 
                className="absolute"
                style={{ top: '35%', left: '50%', transform: 'translateX(-50%)', cursor: isEditing ? 'pointer' : 'default', ...getEffectFilter(routeEffect) }}
                onClick={(e) => { if (onRouteTap && isEditing) { e.stopPropagation(); onRouteTap(); } }}
              >
                <MaybeEffect effect={routeEffect} sticker={routeSticker}>
                  <TransformableWrapper elementId="create-route">
                    <div className="w-40 h-32 flex items-center justify-center overflow-hidden">
                      <RoutePolyline
                        polylineEncoded={activity.polyline}
                        x={0}
                        y={0}
                        scale={0.5}
                        maxHeight={300}
                        maxWidth={374}
                        opacity={1}
                        strokeWidth={style.routeStrokeWidth}
                        strokeColor={routeColor}
                        style={customRouteStyle || style.routeStyle}
                        outline={style.routeOutline}
                        outlineColor={style.routeOutlineColor}
                        outlineWidth={style.routeOutlineWidth}
                        outlineOnly={style.routeOutlineOnly}
                        sketchy={style.routeSketchy}
                        shadowOffset={style.routeShadowOffset}
                        shadowColor={style.routeShadowColor}
                        shadowOpacity={style.routeShadowOpacity}
                        pixelated={style.routePixelated}
                        isEditing={false}
                        isSelected={false}
                      />
                    </div>
                  </TransformableWrapper>
                </MaybeEffect>
              </div>
            )}
            
            {/* Individual stat elements - each starts at a staggered position */}
            {allStats.map((stat, index) => {
              if (!createdElements.includes(stat.key)) return null;
              // Calculate initial position based on order added (stagger down the center)
              const addedIndex = createdElements.indexOf(stat.key);
              const startTop = 60 + (addedIndex * 12); // Start at 60%, stagger by 12%
              return (
                <div 
                  key={stat.key}
                  className="absolute"
                  style={{ top: `${Math.min(startTop, 85)}%`, left: '50%', transform: 'translateX(-50%)', cursor: isEditing ? 'pointer' : 'default', ...getEffectFilter(statsEffect) }}
                  onClick={(e) => { if (onStatsTap && isEditing) { e.stopPropagation(); onStatsTap(stat.key); } }}
                >
                  <MaybeEffect effect={statsEffect} sticker={statsSticker}>
                    <TransformableWrapper elementId={`create-${stat.key}`}>
                      <div className="text-center whitespace-nowrap">
                        {showLabels && (
                          <span 
                            className="text-[10px] uppercase tracking-wider block"
                            style={{ fontFamily: style.font, color: activeColor, ...labelOutlineStyle }}
                          >
                            {stat.label}
                          </span>
                        )}
                        <span 
                          className="text-xl font-bold block leading-none"
                          style={textStyle}
                        >
                          {stat.value}
                        </span>
                      </div>
                    </TransformableWrapper>
                  </MaybeEffect>
                </div>
              );
            })}
            
            {/* Empty state message */}
            {createdElements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="text-center"
                  style={{ fontFamily: style.font, color: activeColor }}
                >
                  <div className="text-3xl mb-2">+</div>
                  <div className="text-sm">Tap + to add elements</div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      onClick={() => setSelectedElement(null)}
    >
      {renderContent()}
    </div>
  );
});

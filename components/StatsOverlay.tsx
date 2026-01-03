import React, { useEffect, useState } from 'react';
import { ActivityContext, RouteConfig, ImageAdjustments, OverlayPack, LayoutType, getLayoutType, getPackFromLayout } from '../types';
import { RoutePolyline } from './RoutePolyline';
import { SAFE_DEFAULT_BACKGROUND } from '../backgrounds';

interface StatsOverlayProps {
  context: ActivityContext;
  onPositionChange?: (id: string, x: number, y: number) => void;
  onElementSelect?: (id: string | null) => void;
  onScaleChange?: (id: string, scale: number) => void;
  isEditing?: boolean;
  isExporting?: boolean;
  showRoute?: boolean;
  routeConfig?: RouteConfig;
  onRoutePositionChange?: (x: number, y: number) => void;
  onRouteScaleChange?: (scale: number) => void;
  onRouteSelect?: () => void;
  isRouteSelected?: boolean;
}

// =============================================================================
// PACK STYLING - Each pack has its own typography and color treatment
// =============================================================================

interface PackStyle {
  font: string;
  defaultColor: string;
  getTextStyle: (color: string, strokeWidth?: number) => React.CSSProperties;
  labelStyle: React.CSSProperties;
}

const PACK_STYLES: Record<OverlayPack, PackStyle> = {
  [OverlayPack.PAINT]: {
    font: '"Gaegu", cursive',
    defaultColor: '#FFFFFF',
    getTextStyle: (color: string, strokeWidth: number = 2) => ({
      WebkitTextStroke: `${strokeWidth}px ${color}`,
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      fontWeight: '700',
      letterSpacing: '0.05em',
    }),
    labelStyle: {
      textTransform: 'uppercase' as const,
      letterSpacing: '0.15em',
      fontSize: '0.75rem',
      fontWeight: '700',
    },
  },
  [OverlayPack.DOODLE]: {
    font: '"Patrick Hand", cursive',
    defaultColor: '#F5A5C8',
    getTextStyle: (color: string, strokeWidth: number = 3) => ({
      color,
      textShadow: `
        ${strokeWidth}px 0 0 #000, -${strokeWidth}px 0 0 #000, 0 ${strokeWidth}px 0 #000, 0 -${strokeWidth}px 0 #000,
        ${strokeWidth}px ${strokeWidth}px 0 #000, -${strokeWidth}px ${strokeWidth}px 0 #000, ${strokeWidth}px -${strokeWidth}px 0 #000, -${strokeWidth}px -${strokeWidth}px 0 #000,
        ${strokeWidth + 1}px ${strokeWidth + 1}px 0 #000
      `,
    }),
    labelStyle: {
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.6rem',
      textShadow: '2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000',
    },
  },
  [OverlayPack.RETRO]: {
    font: '"Teko", sans-serif',
    defaultColor: '#F5F0E6',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '4px 4px 0 rgba(0,0,0,0.4)',
      fontWeight: 'bold',
    }),
    labelStyle: {
      textTransform: 'uppercase' as const,
      letterSpacing: '0.15em',
      fontSize: '0.65rem',
      opacity: 0.8,
    },
  },
  [OverlayPack.GROOVY]: {
    font: '"Modak", cursive',
    defaultColor: '#F5EBD8',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
      fontWeight: 'normal',
    }),
    labelStyle: {
      fontFamily: '"Poppins", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.2em',
      fontSize: '0.6rem',
      opacity: 0.75,
    },
  },
  [OverlayPack.CARTOON]: {
    font: '"Permanent Marker", cursive',
    defaultColor: '#CCFF00',
    getTextStyle: (color: string) => ({
      color: '#000',
      fontWeight: 'normal',
    }),
    labelStyle: {
      fontFamily: '"Permanent Marker", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.6rem',
      color: '#000',
    },
  },
  [OverlayPack.SKETCH]: {
    font: '"Patrick Hand", cursive',
    defaultColor: '#4BA3C3',
    getTextStyle: (color: string, strokeWidth: number = 2) => ({
      color,
      textShadow: `
        ${strokeWidth}px 0 0 #2C2C2C, -${strokeWidth}px 0 0 #2C2C2C, 
        0 ${strokeWidth}px 0 #2C2C2C, 0 -${strokeWidth}px 0 #2C2C2C,
        ${strokeWidth}px ${strokeWidth}px 0 #2C2C2C
      `,
      fontWeight: '400',
    }),
    labelStyle: {
      fontFamily: '"Patrick Hand", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      fontSize: '0.65rem',
    },
  },
  [OverlayPack.CYBER]: {
    font: '"Press Start 2P", monospace',
    defaultColor: '#FFFFFF',
    getTextStyle: (color: string) => ({
      color,
      letterSpacing: '0.05em',
    }),
    labelStyle: {
      fontFamily: '"Press Start 2P", monospace',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.5rem',
    },
  },
  [OverlayPack.GLITCH]: {
    font: '"Rubik Glitch", cursive',
    defaultColor: '#FFFFFF',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '-2px 0 #FF0000, 2px 0 #00FF00',
      letterSpacing: '0.05em',
    }),
    labelStyle: {
      fontFamily: '"Rubik Glitch", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.6rem',
    },
  },
  [OverlayPack.OUTLINE]: {
    font: '"Londrina Outline", cursive',
    defaultColor: '#FFFFFF',
    getTextStyle: (color: string) => ({
      color,
      letterSpacing: '0.05em',
    }),
    labelStyle: {
      fontFamily: '"Londrina Outline", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.6rem',
    },
  },
  [OverlayPack.BURNED]: {
    font: '"Rubik Burned", system-ui',
    defaultColor: '#FFFFFF',
    getTextStyle: (color: string) => ({
      color,
    }),
    labelStyle: {
      fontFamily: '"Rubik Burned", system-ui',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.6rem',
    },
  },
  [OverlayPack.BUNGEE]: {
    font: '"Bungee Outline", system-ui',
    defaultColor: '#FFFFFF',
    getTextStyle: (color: string) => ({
      color,
    }),
    labelStyle: {
      fontFamily: '"Bungee Outline", system-ui',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.6rem',
    },
  },
  [OverlayPack.JERSEY]: {
    font: '"Jersey 10 Charted", system-ui',
    defaultColor: '#FFFFFF',
    getTextStyle: (color: string) => ({
      color,
    }),
    labelStyle: {
      fontFamily: '"Jersey 10 Charted", system-ui',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.6rem',
    },
  },
  [OverlayPack.KABLAMMO]: {
    font: '"Kablammo", system-ui',
    defaultColor: '#FFFFFF',
    getTextStyle: (color: string) => ({
      color,
    }),
    labelStyle: {
      fontFamily: '"Kablammo", system-ui',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.6rem',
    },
  },
  [OverlayPack.RIGHTEOUS]: {
    font: '"Righteous", cursive',
    defaultColor: '#C4B5FD',
    getTextStyle: (color: string) => ({
      color,
    }),
    labelStyle: {
      fontFamily: '"Righteous", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.6rem',
    },
  },
  [OverlayPack.GLASS]: {
    font: '"Bebas Neue", sans-serif',
    defaultColor: 'rgba(255,255,255,0.7)',
    getTextStyle: (color: string) => ({
      color: 'transparent',
      textShadow: '-1px -1px 1px rgba(255,255,255,0.3), 1px 1px 2px rgba(0,0,0,0.4), 0 0 4px rgba(255,255,255,0.1)',
      WebkitTextFillColor: 'rgba(255,255,255,0.08)',
      fontWeight: '400',
      letterSpacing: '0.05em',
    }),
    labelStyle: {
      fontFamily: '"Bebas Neue", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      fontSize: '0.6rem',
      color: 'rgba(255,255,255,0.4)',
    },
  },
  [OverlayPack.CHUNKY]: {
    font: '"Erica One", cursive',
    defaultColor: '#EF4444',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '4px 4px 0 #000, 5px 5px 0 #000',
      fontWeight: '400',
      letterSpacing: '-0.02em',
    }),
    labelStyle: {
      fontFamily: '"Erica One", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.CHILL]: {
    font: '"Archivo Black", sans-serif',
    defaultColor: '#F5EED6',
    getTextStyle: (color: string) => ({
      color,
      fontWeight: '400',
      letterSpacing: '0.02em',
    }),
    labelStyle: {
      fontFamily: '"Archivo Black", sans-serif',
      textTransform: 'lowercase' as const,
      letterSpacing: '0.02em',
      fontSize: '0.55rem',
      opacity: 0.7,
    },
  },
  [OverlayPack.CHICLE]: {
    font: '"Chicle", cursive',
    defaultColor: '#FDE047',
    getTextStyle: (color: string) => ({
      color,
      textShadow: `
        2px 0 0 #166534, -2px 0 0 #166534, 0 2px 0 #166534, 0 -2px 0 #166534,
        2px 2px 0 #166534, -2px 2px 0 #166534, 2px -2px 0 #166534, -2px -2px 0 #166534
      `,
      fontWeight: '400',
    }),
    labelStyle: {
      fontFamily: '"Chicle", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.6rem',
    },
  },
  [OverlayPack.SLACKEY]: {
    font: '"Slackey", cursive',
    defaultColor: '#FFFFFF',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.15)',
      fontWeight: '400',
    }),
    labelStyle: {
      fontFamily: '"Slackey", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.ROCK3D]: {
    font: '"Rock 3D", cursive',
    defaultColor: '#FFFFFF',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 0 rgba(0,0,0,0.4), 3px 3px 0 rgba(0,0,0,0.3)',
      fontWeight: '400',
    }),
    labelStyle: {
      fontFamily: '"Rock 3D", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.5rem',
    },
  },
  [OverlayPack.MARKER]: {
    font: '"Permanent Marker", cursive',
    defaultColor: '#FFFFFF',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
      fontWeight: '400',
      letterSpacing: '0.02em',
    }),
    labelStyle: {
      fontFamily: '"Permanent Marker", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.GRIDLOCK]: {
    font: '"Gridlock", sans-serif',
    defaultColor: '#C0C0C0',
    getTextStyle: (color: string) => ({
      background: 'linear-gradient(180deg, #FFFFFF 0%, #E8E8E8 20%, #A8A8A8 40%, #888888 50%, #B8B8B8 60%, #E0E0E0 80%, #FFFFFF 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.5))',
      fontWeight: '400',
      letterSpacing: '0.02em',
    }),
    labelStyle: {
      fontFamily: '"Gridlock", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.55rem',
      background: 'linear-gradient(180deg, #FFFFFF 0%, #A8A8A8 50%, #FFFFFF 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  },
  [OverlayPack.ACHTUNG_BRAVO]: {
    font: '"AchtungBravo", sans-serif',
    defaultColor: '#FF4136',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '3px 3px 0 #000, -1px -1px 0 #000',
      fontWeight: '400',
      letterSpacing: '0.05em',
    }),
    labelStyle: {
      fontFamily: '"AchtungBravo", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.BOCALUPO]: {
    font: '"Bocalupo", cursive',
    defaultColor: '#FFD93D',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
      fontWeight: '400',
      letterSpacing: '0.02em',
    }),
    labelStyle: {
      fontFamily: '"Bocalupo", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.CAFE24_MOYAMOYA]: {
    font: '"Cafe24Moyamoya", cursive',
    defaultColor: '#FF69B4',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
      fontWeight: '400',
    }),
    labelStyle: {
      fontFamily: '"Cafe24Moyamoya", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.03em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.KUBO]: {
    font: '"KUBO", sans-serif',
    defaultColor: '#00D4FF',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 0 #000',
      fontWeight: '400',
      letterSpacing: '0.05em',
    }),
    labelStyle: {
      fontFamily: '"KUBO", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.SPEED_FREAK]: {
    font: '"SpeedFreak", sans-serif',
    defaultColor: '#CCFF00',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '3px 3px 0 #000, -1px -1px 0 #000',
      fontWeight: '400',
      letterSpacing: '0.02em',
    }),
    labelStyle: {
      fontFamily: '"SpeedFreak", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.BEZMIAR]: {
    font: '"Bezmiar", serif',
    defaultColor: '#E8D5B7',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      fontWeight: '400',
      letterSpacing: '0.03em',
    }),
    labelStyle: {
      fontFamily: '"Bezmiar", serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.BLOCKY]: {
    font: '"Blocky", sans-serif',
    defaultColor: '#FF6B35',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '4px 4px 0 #000',
      fontWeight: '400',
      letterSpacing: '0.05em',
    }),
    labelStyle: {
      fontFamily: '"Blocky", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.FUNKWEST]: {
    font: '"Funkwest", cursive',
    defaultColor: '#DAA520',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 0 #5C4033, 4px 4px 0 rgba(0,0,0,0.3)',
      fontWeight: '400',
      letterSpacing: '0.02em',
    }),
    labelStyle: {
      fontFamily: '"Funkwest", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.GRITH]: {
    font: '"Grith", sans-serif',
    defaultColor: '#87CEEB',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
      fontWeight: '400',
      letterSpacing: '0.04em',
    }),
    labelStyle: {
      fontFamily: '"Grith", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.LT_RAILWAY]: {
    font: '"LTRailway", sans-serif',
    defaultColor: '#CC3333',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 0 #1C2951',
      fontWeight: '400',
      letterSpacing: '0.03em',
    }),
    labelStyle: {
      fontFamily: '"LTRailway", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.CDT_BIVAQUE]: {
    font: '"CDTBivaque", sans-serif',
    defaultColor: '#8B7355',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
      fontWeight: '400',
      letterSpacing: '0.02em',
    }),
    labelStyle: {
      fontFamily: '"CDTBivaque", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.CHICOREE]: {
    font: '"Chicoree", cursive',
    defaultColor: '#9B59B6',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '3px 3px 0 #2C1A4A',
      fontWeight: '700',
      letterSpacing: '0.03em',
    }),
    labelStyle: {
      fontFamily: '"Chicoree", cursive',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.PIXEL_AWAY]: {
    font: '"PixelAway", monospace',
    defaultColor: '#00FF00',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 0 #003300',
      fontWeight: '400',
      letterSpacing: '0.05em',
    }),
    labelStyle: {
      fontFamily: '"PixelAway", monospace',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.HYRAX]: {
    font: '"Hyrax", sans-serif',
    defaultColor: '#FF8C42',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 0 #7A3F1A',
      fontWeight: '400',
      letterSpacing: '0.03em',
    }),
    labelStyle: {
      fontFamily: '"Hyrax", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.MIDNIGHT_LETTERS]: {
    font: '"MidnightLetters", serif',
    defaultColor: '#4A5568',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
      fontWeight: '400',
      letterSpacing: '0.04em',
    }),
    labelStyle: {
      fontFamily: '"MidnightLetters", serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.NOSE_TRANSPORT]: {
    font: '"NoseTransport", sans-serif',
    defaultColor: '#FFD700',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 0 #B8860B',
      fontWeight: '700',
      letterSpacing: '0.05em',
    }),
    labelStyle: {
      fontFamily: '"NoseTransport", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.ORBIX]: {
    font: '"Orbix", sans-serif',
    defaultColor: '#00CED1',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      fontWeight: '400',
      letterSpacing: '0.03em',
    }),
    labelStyle: {
      fontFamily: '"Orbix", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.QUADRIANA]: {
    font: '"Quadriana", sans-serif',
    defaultColor: '#E74C3C',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '3px 3px 0 #7B241C',
      fontWeight: '400',
      letterSpacing: '0.04em',
    }),
    labelStyle: {
      fontFamily: '"Quadriana", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.QUANTUM]: {
    font: '"Quantum", sans-serif',
    defaultColor: '#8E44AD',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '2px 2px 0 #4A235A, 0 0 10px rgba(142,68,173,0.5)',
      fontWeight: '400',
      letterSpacing: '0.05em',
    }),
    labelStyle: {
      fontFamily: '"Quantum", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.RUNTTI]: {
    font: '"Runtti", sans-serif',
    defaultColor: '#3498DB',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
      fontWeight: '400',
      letterSpacing: '0.03em',
    }),
    labelStyle: {
      fontFamily: '"Runtti", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.TACHYO]: {
    font: '"Tachyo", sans-serif',
    defaultColor: '#F39C12',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '3px 3px 0 #7D5A0B',
      fontWeight: '400',
      letterSpacing: '0.02em',
    }),
    labelStyle: {
      fontFamily: '"Tachyo", sans-serif',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      fontSize: '0.55rem',
    },
  },
  [OverlayPack.XANMONO]: {
    font: '"Xanmono", monospace',
    defaultColor: '#1ABC9C',
    getTextStyle: (color: string) => ({
      color,
      textShadow: '1px 1px 0 #0E6655',
      fontWeight: '400',
      letterSpacing: '0.06em',
    }),
    labelStyle: {
      fontFamily: '"Xanmono", monospace',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      fontSize: '0.55rem',
    },
  },
};

// Block text component for CHILL pack - each character in its own dark block
const BlockText: React.FC<{
  text: string;
  color: string;
  fontSize?: string;
  className?: string;
}> = ({ text, color, fontSize = '1.5rem', className = '' }) => {
  return (
    <div className={`flex flex-wrap justify-center gap-[2px] ${className}`}>
      {text.split('').map((char, i) => (
        char === ' ' ? (
          <div key={i} style={{ width: '0.4em', fontSize }} />
        ) : (
          <div
            key={i}
            style={{
              backgroundColor: '#1a1a1a',
              color,
              fontFamily: '"Archivo Black", sans-serif',
              fontSize,
              fontWeight: '400',
              padding: '0.08em 0.12em',
              borderRadius: '0.08em',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '0.7em',
              textTransform: 'lowercase',
            }}
          >
            {char.toLowerCase()}
          </div>
        )
      ))}
    </div>
  );
};

// Helper to check if pack uses block text styling
const isBlockTextPack = (pack: OverlayPack): boolean => pack === OverlayPack.CHILL;

// Helper to check if pack uses card/box styling
const isCardPack = (pack: OverlayPack): boolean => pack === OverlayPack.CARTOON;

// Card wrapper component for CARTOON pack
const CartoonCard: React.FC<{ 
  children: React.ReactNode; 
  color: string; 
  rotate?: number;
  size?: 'small' | 'medium' | 'large';
}> = ({ children, color, rotate = 0, size = 'medium' }) => {
  const padding = size === 'large' ? 'px-6 py-3' : size === 'small' ? 'px-2 py-1' : 'px-4 py-2';
  return (
    <div 
      className={`inline-block ${padding} rounded-md`}
      style={{
        backgroundColor: color,
        border: '3px solid #000',
        boxShadow: '4px 4px 0 #000',
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </div>
  );
};

// =============================================================================
// DRAGGABLE ITEM COMPONENT
// =============================================================================

const DraggableItem: React.FC<{
  id: string;
  x: number;
  y: number;
  scale: number;
  opacity?: number;
  width?: number;
  isEditing: boolean;
  isSelected: boolean;
  position?: 'absolute' | 'relative' | 'fixed';
  onPositionChange?: (id: string, x: number, y: number) => void;
  onScaleChange?: (id: string, scale: number) => void;
  onSelect?: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ id, x, y, scale, opacity = 1, width, isEditing, isSelected, position = 'absolute', onPositionChange, onScaleChange, onSelect, children, className, style }) => {
  
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isEditing) return;
    
    if (onSelect) {
      e.stopPropagation();
      onSelect(id);
    }

    if (!onPositionChange) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = x;
    const initialY = y;
    
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      onPositionChange(id, initialX + deltaX, initialY + deltaY);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleResizePointerDown = (e: React.PointerEvent, corner: string) => {
    if (!isEditing || !onScaleChange) return;
    
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialScale = scale;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let scaleDelta = 0;
      if (corner === 'se' || corner === 'ne') {
        scaleDelta = (deltaX + (corner === 'se' ? deltaY : -deltaY)) / 150;
      } else {
        scaleDelta = (-deltaX + (corner === 'sw' ? deltaY : -deltaY)) / 150;
      }
      
      const newScale = Math.max(0.3, Math.min(3, initialScale + scaleDelta));
      onScaleChange(id, newScale);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`${position} origin-center ${isEditing ? 'cursor-move touch-none' : ''} ${className || ''} ${isSelected && isEditing ? 'z-50' : ''}`}
      style={{
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        opacity,
        maxWidth: width ? `${width}%` : undefined,
        width: width ? '100%' : 'fit-content',
        ...style
      }}
    >
      <div className="relative">
        {children}
        {isSelected && isEditing && onScaleChange && (
          <>
            {['nw', 'ne', 'sw', 'se'].map((corner) => (
              <div
                key={corner}
                onPointerDown={(e) => handleResizePointerDown(e, corner)}
                className="absolute w-2.5 h-2.5 bg-[#CCFF00] rounded-full z-50 hover:scale-125 transition-transform"
                style={{
                  top: corner.includes('n') ? -5 : 'auto',
                  bottom: corner.includes('s') ? -5 : 'auto',
                  left: corner.includes('w') ? -5 : 'auto',
                  right: corner.includes('e') ? -5 : 'auto',
                  cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize',
                }}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatDuration = (timeStr: string): string => {
  // If already in h m s format, return as is
  if (timeStr.includes('h') || timeStr.includes('m') || timeStr.includes('s')) {
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

const appendCacheBuster = (url: string): string => {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  try {
    const base = typeof window !== 'undefined' ? window.location.href : 'http://localhost';
    const parsed = new URL(url, base);
    parsed.searchParams.set('t', Date.now().toString());
    return parsed.toString();
  } catch {
    return `${url}${separator}t=${Date.now()}`;
  }
};

const readBlobAsDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('Failed to read blob as data URL'));
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unexpected FileReader result'));
      }
    };
    reader.readAsDataURL(blob);
  });

// Generate grain texture
const generateGrainTexture = (size: number = 256): string => {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 255;
    data[i] = noise;
    data[i + 1] = noise;
    data[i + 2] = noise;
    data[i + 3] = 255;
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
};

let grainTextureCache: { [key: string]: string } = {};
const getGrainTexture = (size: number): string => {
  const key = `grain_${size}`;
  if (!grainTextureCache[key]) {
    grainTextureCache[key] = generateGrainTexture(size);
  }
  return grainTextureCache[key];
};

// =============================================================================
// STAT ITEM INTERFACE
// =============================================================================

interface StatData {
  key: string;
  label: string;
  value: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const StatsOverlay: React.FC<StatsOverlayProps> = ({ 
  context, 
  onPositionChange, 
  onElementSelect,
  onScaleChange,
  isEditing = false, 
  isExporting = false,
  showRoute = false, 
  routeConfig = { x: 0, y: 0, scale: 1, opacity: 0.8, strokeWidth: 2, color: '#FFFFFF', style: 'smooth' as const, outline: false, outlineWidth: 2, outlineColor: '#000000' },
  onRoutePositionChange,
  onRouteScaleChange,
  onRouteSelect,
  isRouteSelected = false
}) => {
  const { 
    stats, 
    backgroundImage, 
    bgConfig, 
    layout, 
    customColor, 
    visibleStats, 
    elementPositions, 
    selectedElementId, 
    showLabels,
    imageAdjustments 
  } = context;

  // Get pack and layout type
  const pack = getPackFromLayout(layout);
  const layoutType = getLayoutType(layout);
  const packStyle = PACK_STYLES[pack];

  // Apply custom overrides or use pack defaults
  const activeColor = customColor || packStyle.defaultColor;
  const activeFont = packStyle.font;

  // Full stats with formatting
  const fullStats = {
    ...stats,
    title: stats.title.toUpperCase(),
    time: formatDuration(stats.time),
    pace: stats.pace || '5:30 /km',
    calories: stats.calories || '450 kcal',
    heartRate: stats.heartRate || '145 bpm',
    date: stats.date || 'Today',
  };

  // Build array of ALL visible stats (no caps!)
  // Title is handled separately for most layouts
  const getVisibleStats = (includeTitle: boolean = false): StatData[] => {
    const items: StatData[] = [];
    if (includeTitle && visibleStats.title) items.push({ key: 'title', label: 'Title', value: fullStats.title });
    if (visibleStats.distance) items.push({ key: 'distance', label: 'Distance', value: fullStats.distance });
    if (visibleStats.time) items.push({ key: 'time', label: 'Time', value: fullStats.time });
    if (visibleStats.elevation) items.push({ key: 'elevation', label: 'Elevation', value: fullStats.elevation });
    if (visibleStats.pace) items.push({ key: 'pace', label: 'Pace', value: fullStats.pace });
    if (visibleStats.calories) items.push({ key: 'calories', label: 'Calories', value: fullStats.calories });
    if (visibleStats.heartRate) items.push({ key: 'heartRate', label: 'Heart Rate', value: fullStats.heartRate });
    if (visibleStats.date) items.push({ key: 'date', label: 'Date', value: fullStats.date });
    return items;
  };

  // Stats without title (for layouts where title is separate)
  const visibleStatsArray = getVisibleStats(false);
  
  // Stats with title included (for wavy/circular)
  const visibleStatsWithTitle = getVisibleStats(true);
  
  // Is title visible?
  const showTitle = visibleStats.title;

  // Background handling
  const sourceBgUrl = backgroundImage || SAFE_DEFAULT_BACKGROUND;
  const [displayBgUrl, setDisplayBgUrl] = useState<string>(sourceBgUrl);

  useEffect(() => {
    let isMounted = true;

    const isRemoteHttp = /^https?:/i.test(sourceBgUrl);
    const shouldUseSafeBg = (isEditing || isExporting) && isRemoteHttp;

    if (!shouldUseSafeBg) {
      setDisplayBgUrl(sourceBgUrl);
      return () => { isMounted = false; };
    }

    const makeSafeBackground = async () => {
      try {
        const cacheSafeUrl = appendCacheBuster(sourceBgUrl);
        const response = await fetch(cacheSafeUrl, { mode: 'cors', cache: 'no-store', credentials: 'omit' });
        if (!response.ok) throw new Error(`Failed to fetch background: ${response.status}`);
        const blob = await response.blob();
        const dataUrl = await readBlobAsDataUrl(blob);
        if (!isMounted) return;
        setDisplayBgUrl(dataUrl);
      } catch (error) {
        console.warn('StatsOverlay: falling back to raw background URL', error);
        if (isMounted) setDisplayBgUrl(sourceBgUrl);
      }
    };

    makeSafeBackground();
    return () => { isMounted = false; };
  }, [sourceBgUrl, isEditing, isExporting]);

  // Helper to get position
  const getPos = (id: string) => elementPositions[id] || { x: 0, y: 0, scale: 1, opacity: 1 };

  // Wrapper class
  const wrapperClass = `relative w-full h-full overflow-hidden shadow-2xl select-none transition-colors duration-300 ${bgConfig.transparent ? '' : 'bg-black'}`;

  // =============================================================================
  // INTERACTIVE BACKGROUND
  // =============================================================================
  const InteractiveBackground = () => {
    if (bgConfig.transparent) return null;

    const adjustments = imageAdjustments || { noise: 0, saturation: 0, contrast: 0, brightness: 0, warmth: 0 };
    const filters: string[] = [];
    
    if (adjustments.saturation !== 0) {
      const satValue = 1 + (adjustments.saturation / 100);
      filters.push(`saturate(${satValue})`);
    }
    if (adjustments.contrast !== 0) {
      const contrastValue = 1 + (adjustments.contrast / 200);
      filters.push(`contrast(${contrastValue})`);
    }
    if (adjustments.brightness !== 0) {
      const brightnessValue = 1 + (adjustments.brightness / 200);
      filters.push(`brightness(${brightnessValue})`);
    }
    if (adjustments.warmth > 0) {
      filters.push(`sepia(${adjustments.warmth / 200})`);
    } else if (adjustments.warmth < 0) {
      filters.push(`hue-rotate(${Math.abs(adjustments.warmth) * 0.2}deg)`);
    }

    const imgStyle: React.CSSProperties = filters.length > 0 ? { filter: filters.join(' ') } : {};
    const grainIntensity = adjustments.noise > 0 ? adjustments.noise / 100 : 0;

    return (
      <div className="absolute inset-0">
        <DraggableItem
          id="bg-image-layer"
          x={bgConfig.x}
          y={bgConfig.y}
          scale={bgConfig.scale}
          opacity={bgConfig.opacity}
          isEditing={isEditing}
          isSelected={false}
          onPositionChange={onPositionChange}
          onSelect={() => onElementSelect && onElementSelect(null)}
          className="w-full h-full"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={displayBgUrl}
              alt="Background"
              className="w-full h-full object-contain pointer-events-none"
              style={imgStyle}
              draggable={false}
              crossOrigin="anonymous"
            />
            {grainIntensity > 0 && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${getGrainTexture(256)})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '256px 256px',
                    opacity: grainIntensity * 0.7,
                    mixBlendMode: 'overlay',
                    filter: 'contrast(1.8)'
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${getGrainTexture(128)})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '128px 128px',
                    backgroundPosition: '64px 64px',
                    opacity: grainIntensity * 0.5,
                    mixBlendMode: 'hard-light',
                    filter: 'contrast(2.2)'
                  }}
                />
              </>
            )}
          </div>
        </DraggableItem>
      </div>
    );
  };

  // =============================================================================
  // ROUTE OVERLAY
  // =============================================================================
  const RouteOverlay = () => showRoute && stats.polyline ? (
    <div className="absolute inset-0 z-20">
      <RoutePolyline 
        polylineEncoded={stats.polyline} 
        x={routeConfig.x} 
        y={routeConfig.y} 
        scale={routeConfig.scale} 
        opacity={routeConfig.opacity} 
        strokeWidth={routeConfig.strokeWidth} 
        strokeColor={routeConfig.color}
        style={routeConfig.style}
        outline={routeConfig.outline}
        outlineWidth={routeConfig.outlineWidth}
        outlineColor={routeConfig.outlineColor}
        isEditing={isEditing} 
        isSelected={isRouteSelected} 
        onPositionChange={onRoutePositionChange}
        onScaleChange={onRouteScaleChange}
        onSelect={onRouteSelect} 
      />
    </div>
  ) : null;

  // =============================================================================
  // LAYOUT RENDERERS
  // =============================================================================

  // Check if we're using the CARTOON pack for special card rendering
  const useCards = isCardPack(pack);
  // Check if we're using the CHILL pack for block text rendering
  const useBlockText = isBlockTextPack(pack);

  // CLASSIC: Large distance on top, other stats below, title separate at top
  const renderClassic = () => {
    const distance = visibleStatsArray.find(s => s.key === 'distance');
    const otherStats = visibleStatsArray.filter(s => s.key !== 'distance');

    // Random rotations for cartoon cards
    const getRotation = (index: number) => {
      const rotations = [-3, 2, -1, 3, -2, 1, -4, 2];
      return rotations[index % rotations.length];
    };

    return (
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end items-center pb-[10%]">
        {/* Separate title at top */}
        {showTitle && (
          <DraggableItem
            id="classic-title"
            x={getPos('classic-title').x}
            y={getPos('classic-title').y}
            scale={getPos('classic-title').scale}
            opacity={getPos('classic-title').opacity}
            position="absolute"
            isEditing={isEditing}
            isSelected={selectedElementId === 'classic-title'}
            onPositionChange={onPositionChange}
            onScaleChange={onScaleChange}
            onSelect={onElementSelect}
            className="pointer-events-auto top-[8%] left-1/2 -translate-x-1/2 text-center"
          >
            {useBlockText ? (
              <BlockText text={fullStats.title} color={activeColor} fontSize="1.5rem" />
            ) : useCards ? (
              <CartoonCard color={activeColor} rotate={-2} size="medium">
                <span className="text-2xl" style={{ fontFamily: activeFont, color: '#000' }}>
                  {fullStats.title}
                </span>
              </CartoonCard>
            ) : (
              <div 
                className="text-2xl font-bold tracking-widest"
                style={{ fontFamily: activeFont, ...packStyle.getTextStyle(activeColor, 2) }}
              >
                {fullStats.title}
              </div>
            )}
          </DraggableItem>
        )}

        <DraggableItem
          id="classic-stats"
          x={getPos('classic-stats').x}
          y={getPos('classic-stats').y}
          scale={getPos('classic-stats').scale}
          opacity={getPos('classic-stats').opacity}
          position="relative"
          isEditing={isEditing}
          isSelected={selectedElementId === 'classic-stats'}
          onPositionChange={onPositionChange}
          onScaleChange={onScaleChange}
          onSelect={onElementSelect}
          className="pointer-events-auto text-center"
        >
          <div style={{ fontFamily: activeFont }}>
            {/* Hero distance */}
            {distance && (
              useCards ? (
                <div className="mb-4">
                  <CartoonCard color={activeColor} rotate={1} size="large">
                    <span className="text-7xl" style={{ fontFamily: activeFont, color: '#000' }}>
                      {distance.value}
                    </span>
                  </CartoonCard>
                </div>
              ) : (
                <div 
                  className="text-8xl font-bold tracking-wide mb-4"
                  style={packStyle.getTextStyle(activeColor, 4)}
                >
                  {distance.value}
                </div>
              )
            )}
            {/* Other stats in a row */}
            {otherStats.length > 0 && (
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-3">
                {otherStats.map((stat, index) => (
                  <div key={stat.key} className="flex flex-col items-center">
                    {useCards ? (
                      <CartoonCard color={activeColor} rotate={getRotation(index)} size="small">
                        <span className="text-xl" style={{ fontFamily: activeFont, color: '#000' }}>
                          {stat.value}
                        </span>
                      </CartoonCard>
                    ) : (
                      <span 
                        className="text-2xl font-bold"
                        style={packStyle.getTextStyle(activeColor, 2)}
                      >
                        {stat.value}
                      </span>
                    )}
                    {showLabels && (
                      <span style={{ ...packStyle.labelStyle, color: useCards ? '#fff' : activeColor, marginTop: useCards ? '4px' : undefined }}>
                        {stat.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DraggableItem>
      </div>
    );
  };

  // COLUMN: Stats stacked vertically, title separate at top
  const renderColumn = () => {
    const getRotation = (index: number) => {
      const rotations = [-2, 3, -1, 2, -3, 1];
      return rotations[index % rotations.length];
    };

    return (
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        {/* Separate title at top */}
        {showTitle && (
          <DraggableItem
            id="column-title"
            x={getPos('column-title').x}
            y={getPos('column-title').y}
            scale={getPos('column-title').scale}
            opacity={getPos('column-title').opacity}
            position="absolute"
            isEditing={isEditing}
            isSelected={selectedElementId === 'column-title'}
            onPositionChange={onPositionChange}
            onScaleChange={onScaleChange}
            onSelect={onElementSelect}
            className="pointer-events-auto top-[8%] left-1/2 -translate-x-1/2 text-center"
          >
            {useBlockText ? (
              <BlockText text={fullStats.title} color={activeColor} fontSize="1.5rem" />
            ) : useCards ? (
              <CartoonCard color={activeColor} rotate={-2} size="medium">
                <span className="text-2xl" style={{ fontFamily: activeFont, color: '#000' }}>
                  {fullStats.title}
                </span>
              </CartoonCard>
            ) : (
              <div 
                className="text-2xl font-bold tracking-widest"
                style={{ fontFamily: activeFont, ...packStyle.getTextStyle(activeColor, 2) }}
              >
                {fullStats.title}
              </div>
            )}
          </DraggableItem>
        )}

        <DraggableItem
          id="column-stats"
          x={getPos('column-stats').x}
          y={getPos('column-stats').y}
          scale={getPos('column-stats').scale}
          opacity={getPos('column-stats').opacity}
          position="relative"
          isEditing={isEditing}
          isSelected={selectedElementId === 'column-stats'}
          onPositionChange={onPositionChange}
          onScaleChange={onScaleChange}
          onSelect={onElementSelect}
          className="pointer-events-auto text-center"
        >
          <div className={`flex flex-col items-center ${useCards ? 'gap-3' : 'gap-2'}`} style={{ fontFamily: activeFont }}>
            {visibleStatsArray.map((stat, index) => (
              <div key={stat.key} className="flex flex-col items-center">
                {useCards ? (
                  <CartoonCard color={activeColor} rotate={getRotation(index)} size={index === 0 ? 'large' : 'medium'}>
                    <span className={index === 0 ? 'text-4xl' : 'text-2xl'} style={{ fontFamily: activeFont, color: '#000' }}>
                      {stat.value}
                    </span>
                  </CartoonCard>
                ) : (
                  <span 
                    className={`font-bold ${index === 0 ? 'text-5xl' : 'text-3xl'}`}
                    style={packStyle.getTextStyle(activeColor, index === 0 ? 3 : 2)}
                  >
                    {stat.value}
                  </span>
                )}
                {showLabels && (
                  <span style={{ ...packStyle.labelStyle, color: useCards ? '#fff' : activeColor, marginTop: useCards ? '4px' : undefined }}>
                    {stat.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </DraggableItem>
      </div>
    );
  };

  // GRID: 3x3 grid of stats, title separate at top
  const renderGrid = () => {
    return (
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end pb-[8%]">
        {/* Separate title at top */}
        {showTitle && (
          <DraggableItem
            id="grid-title"
            x={getPos('grid-title').x}
            y={getPos('grid-title').y}
            scale={getPos('grid-title').scale}
            opacity={getPos('grid-title').opacity}
            position="absolute"
            isEditing={isEditing}
            isSelected={selectedElementId === 'grid-title'}
            onPositionChange={onPositionChange}
            onScaleChange={onScaleChange}
            onSelect={onElementSelect}
            className="pointer-events-auto top-[8%] left-1/2 -translate-x-1/2 text-center"
          >
            {useBlockText ? (
              <BlockText text={fullStats.title} color={activeColor} fontSize="1.5rem" />
            ) : useCards ? (
              <CartoonCard color={activeColor} rotate={-1} size="medium">
                <span className="text-2xl" style={{ fontFamily: activeFont, color: '#000' }}>
                  {fullStats.title}
                </span>
              </CartoonCard>
            ) : (
              <div 
                className="text-2xl font-bold tracking-widest"
                style={{ fontFamily: activeFont, ...packStyle.getTextStyle(activeColor, 2) }}
              >
                {fullStats.title}
              </div>
            )}
          </DraggableItem>
        )}

        <DraggableItem
          id="grid-stats"
          x={getPos('grid-stats').x}
          y={getPos('grid-stats').y}
          scale={getPos('grid-stats').scale}
          opacity={getPos('grid-stats').opacity}
          position="relative"
          isEditing={isEditing}
          isSelected={selectedElementId === 'grid-stats'}
          onPositionChange={onPositionChange}
          onScaleChange={onScaleChange}
          onSelect={onElementSelect}
          className="pointer-events-auto w-full px-4"
        >
          <div 
            className={`grid grid-cols-3 gap-x-4 ${useCards ? 'gap-y-4' : 'gap-y-3'} text-center`}
            style={{ fontFamily: activeFont }}
          >
            {visibleStatsArray.map((stat, index) => {
              const rotations = [-2, 3, -1, 2, -3, 1, -2, 3];
              return (
                <div key={stat.key} className="flex flex-col items-center">
                  {useCards ? (
                    <CartoonCard color={activeColor} rotate={rotations[index % rotations.length]} size="small">
                      <span className="text-lg" style={{ fontFamily: activeFont, color: '#000' }}>
                        {stat.value}
                      </span>
                    </CartoonCard>
                  ) : (
                    <span 
                      className="text-2xl font-bold"
                      style={packStyle.getTextStyle(activeColor, 1.5)}
                    >
                      {stat.value}
                    </span>
                  )}
                  {showLabels && (
                    <span style={{ ...packStyle.labelStyle, color: useCards ? '#fff' : activeColor, marginTop: useCards ? '4px' : undefined }}>
                      {stat.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </DraggableItem>
      </div>
    );
  };

  // WAVY: Stats in a wave pattern (repeats for length) - title included in flow
  const renderWavy = () => {
    // Create text for wave - repeat stats to fill the wave (includes title)
    const statsText = visibleStatsWithTitle.map(s => s.value).join('  /  ');
    const repeatedText = statsText + '  /  ' + statsText + '  /  ' + statsText + '  /  ' + statsText;

    return (
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        <DraggableItem
          id="wavy-stats"
          x={getPos('wavy-stats').x}
          y={getPos('wavy-stats').y}
          scale={getPos('wavy-stats').scale}
          opacity={getPos('wavy-stats').opacity}
          position="relative"
          isEditing={isEditing}
          isSelected={selectedElementId === 'wavy-stats'}
          onPositionChange={onPositionChange}
          onScaleChange={onScaleChange}
          onSelect={onElementSelect}
          className="pointer-events-auto"
        >
          <svg viewBox="0 0 800 300" className="w-[320px] h-[120px]" style={{ overflow: 'visible' }}>
            <defs>
              <path 
                id="wavyPath" 
                d="M 0 150 Q 100 50 200 150 T 400 150 T 600 150 T 800 150" 
                fill="none" 
              />
            </defs>
            <text 
              style={{ 
                fontFamily: activeFont, 
                fontSize: '28px', 
                fontWeight: 'bold',
                fill: pack === OverlayPack.PAINT ? 'transparent' : activeColor,
                stroke: pack === OverlayPack.PAINT ? activeColor : (pack === OverlayPack.DOODLE ? '#000' : 'none'),
                strokeWidth: pack === OverlayPack.PAINT ? '1.5px' : (pack === OverlayPack.DOODLE ? '4px' : '0'),
                paintOrder: pack === OverlayPack.DOODLE ? 'stroke fill' : 'fill stroke',
                letterSpacing: '0.1em',
              }}
            >
              <textPath href="#wavyPath" startOffset="0%">
                {repeatedText}
              </textPath>
            </text>
          </svg>
        </DraggableItem>
      </div>
    );
  };

  // CIRCULAR: Stats arranged in a circle (repeats to close) - title included in flow
  const renderCircular = () => {
    const statsText = visibleStatsWithTitle.map(s => s.value).join('  /  ');
    const circleText = statsText + '  /  ' + statsText + '  /  ' + statsText + '  /  ';

    return (
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        <DraggableItem
          id="circular-stats"
          x={getPos('circular-stats').x}
          y={getPos('circular-stats').y}
          scale={getPos('circular-stats').scale}
          opacity={getPos('circular-stats').opacity}
          position="relative"
          isEditing={isEditing}
          isSelected={selectedElementId === 'circular-stats'}
          onPositionChange={onPositionChange}
          onScaleChange={onScaleChange}
          onSelect={onElementSelect}
          className="pointer-events-auto"
        >
          <svg viewBox="0 0 400 400" className="w-80 h-80">
            <defs>
              <path 
                id="circlePath" 
                d="M 200 200 m -160 0 a 160 160 0 1 1 320 0 a 160 160 0 1 1 -320 0" 
                fill="none" 
              />
            </defs>
            <text 
              style={{ 
                fontFamily: activeFont, 
                fontSize: '16px', 
                fontWeight: 'bold',
                fill: pack === OverlayPack.PAINT ? 'transparent' : activeColor,
                stroke: pack === OverlayPack.PAINT ? activeColor : (pack === OverlayPack.DOODLE ? '#000' : 'none'),
                strokeWidth: pack === OverlayPack.PAINT ? '1.5px' : (pack === OverlayPack.DOODLE ? '3px' : '0'),
                paintOrder: pack === OverlayPack.DOODLE ? 'stroke fill' : 'fill stroke',
                letterSpacing: '0.2em',
              }}
            >
              <textPath href="#circlePath" startOffset="0%">
                {circleText}
              </textPath>
            </text>
          </svg>
        </DraggableItem>
      </div>
    );
  };

  // SCATTER: Each stat is individually draggable, title is separate and larger
  const renderScatter = () => {
    // Default positions for scattered stats
    const scatterPositions: Record<string, { top: string; left: string; rotation: number }> = {
      distance: { top: '25%', left: '60%', rotation: 2 },
      time: { top: '45%', left: '15%', rotation: -1 },
      elevation: { top: '40%', left: '70%', rotation: 3 },
      pace: { top: '65%', left: '25%', rotation: -2 },
      calories: { top: '70%', left: '65%', rotation: 1 },
      heartRate: { top: '55%', left: '45%', rotation: -1.5 },
      date: { top: '85%', left: '40%', rotation: 2 },
    };

    return (
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Separate title element */}
        {showTitle && (
          <DraggableItem
            id="scatter-title"
            x={getPos('scatter-title').x}
            y={getPos('scatter-title').y}
            scale={getPos('scatter-title').scale}
            opacity={getPos('scatter-title').opacity}
            position="absolute"
            isEditing={isEditing}
            isSelected={selectedElementId === 'scatter-title'}
            onPositionChange={onPositionChange}
            onScaleChange={onScaleChange}
            onSelect={onElementSelect}
            className="pointer-events-auto"
            style={{ 
              top: '8%', 
              left: '10%', 
              transform: `translate(${getPos('scatter-title').x}px, ${getPos('scatter-title').y}px) scale(${getPos('scatter-title').scale}) rotate(-3deg)` 
            }}
          >
            {useBlockText ? (
              <BlockText text={fullStats.title} color={activeColor} fontSize="1.5rem" />
            ) : useCards ? (
              <CartoonCard color={activeColor} rotate={-3} size="medium">
                <span className="text-2xl" style={{ fontFamily: activeFont, color: '#000' }}>
                  {fullStats.title}
                </span>
              </CartoonCard>
            ) : (
              <div 
                className="text-2xl font-bold tracking-widest"
                style={{ fontFamily: activeFont, ...packStyle.getTextStyle(activeColor, 2) }}
              >
                {fullStats.title}
              </div>
            )}
          </DraggableItem>
        )}

        {visibleStatsArray.map(stat => {
          const pos = scatterPositions[stat.key] || { top: '50%', left: '50%', rotation: 0 };
          const elementId = `scatter-${stat.key}`;
          
          return (
            <DraggableItem
              key={stat.key}
              id={elementId}
              x={getPos(elementId).x}
              y={getPos(elementId).y}
              scale={getPos(elementId).scale}
              opacity={getPos(elementId).opacity}
              position="absolute"
              isEditing={isEditing}
              isSelected={selectedElementId === elementId}
              onPositionChange={onPositionChange}
              onScaleChange={onScaleChange}
              onSelect={onElementSelect}
              className="pointer-events-auto"
              style={{ 
                top: pos.top, 
                left: pos.left, 
                transform: `translate(${getPos(elementId).x}px, ${getPos(elementId).y}px) scale(${getPos(elementId).scale}) rotate(${pos.rotation}deg)` 
              }}
            >
              <div 
                className="flex flex-col items-center text-center"
                style={{ fontFamily: activeFont }}
              >
                {useCards ? (
                  <CartoonCard color={activeColor} rotate={pos.rotation} size="medium">
                    <span className="text-2xl" style={{ fontFamily: activeFont, color: '#000' }}>
                      {stat.value}
                    </span>
                  </CartoonCard>
                ) : (
                  <span 
                    className="text-3xl font-bold"
                    style={packStyle.getTextStyle(activeColor, 2)}
                  >
                    {stat.value}
                  </span>
                )}
                {showLabels && (
                  <span style={{ ...packStyle.labelStyle, color: useCards ? '#fff' : activeColor, marginTop: useCards ? '4px' : undefined }}>
                    {stat.label}
                  </span>
                )}
              </div>
            </DraggableItem>
          );
        })}
      </div>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const renderLayout = () => {
    switch (layoutType) {
      case 'CLASSIC': return renderClassic();
      case 'COLUMN': return renderColumn();
      case 'GRID': return renderGrid();
      case 'WAVY': return renderWavy();
      case 'CIRCULAR': return renderCircular();
      case 'SCATTER': return renderScatter();
      default: return renderClassic();
    }
  };

  return (
    <div className={wrapperClass}>
      <InteractiveBackground />
      <RouteOverlay />
      {renderLayout()}
    </div>
  );
};

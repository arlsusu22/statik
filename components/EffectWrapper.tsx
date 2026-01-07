import React from 'react';
import { ElementEffect, ElementEffectType } from '../types';

interface EffectWrapperProps {
  effect?: ElementEffect;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  color?: string; // Base color for gradient effects
}

// Main effect wrapper component
export const EffectWrapper: React.FC<EffectWrapperProps> = ({ 
  effect, 
  children, 
  className,
  style,
  color = '#FFFFFF'
}) => {
  // If no effect or none type, just render children
  if (!effect || effect.type === 'none') {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  
  const intensity = effect.intensity / 100;
  
  // Handle shiny effect - use brightness/contrast + glow for a shine look
  if (effect.type === 'shiny') {
    const brightness = 1 + intensity * 0.4;
    const contrast = 1 + intensity * 0.15;
    const glowSize = 3 + intensity * 8;
    const glowOpacity = 0.4 + intensity * 0.5;
    return (
      <div 
        className={className} 
        style={{ 
          ...style,
          filter: `brightness(${brightness}) contrast(${contrast}) drop-shadow(0 0 ${glowSize}px rgba(255,255,255,${glowOpacity}))`,
        }}
      >
        {children}
      </div>
    );
  }
  
  // Handle glitch effect - RGB chromatic aberration using layered elements
  if (effect.type === 'glitch') {
    const offset = 2 + intensity * 4;
    return (
      <div 
        className={className} 
        style={{ 
          ...style,
          position: 'relative',
        }}
      >
        {/* Red channel - shifted right */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: `translateX(${offset}px)`,
            filter: 'url(#glitch-red-channel)',
            opacity: 0.8,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        >
          {children}
        </div>
        {/* Blue channel - shifted left */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: `translateX(${-offset}px)`,
            filter: 'url(#glitch-blue-channel)',
            opacity: 0.8,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        >
          {children}
        </div>
        {/* Original layer on top */}
        <div style={{ position: 'relative' }}>
          {children}
        </div>
        {/* SVG filters for isolating color channels */}
        <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
          <defs>
            <filter id="glitch-red-channel" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
            </filter>
            <filter id="glitch-blue-channel" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
            </filter>
          </defs>
        </svg>
      </div>
    );
  }
  
  // Handle retro effect - sepia + desaturation for vintage look
  if (effect.type === 'retro') {
    const sepia = 0.3 + intensity * 0.5;
    const saturate = 0.9 - intensity * 0.4;
    const contrast = 1 + intensity * 0.2;
    return (
      <div 
        className={className} 
        style={{ 
          ...style,
          filter: `sepia(${sepia}) saturate(${saturate}) contrast(${contrast})`,
        }}
      >
        {children}
      </div>
    );
  }
  
  // Default fallback
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

// Inline styles generator for simpler use cases
export const getEffectStyle = (effect?: ElementEffect): React.CSSProperties => {
  if (!effect || effect.type === 'none') return {};
  return {};
};

// Effect type options for UI
export const EFFECT_OPTIONS: { 
  type: ElementEffectType; 
  label: string; 
  icon: string;
}[] = [
  { type: 'none', label: 'Solid', icon: '○' },
  { type: 'shiny', label: 'Shiny', icon: '✦' },
  { type: 'retro', label: 'Retro', icon: '▒' },
  { type: 'glitch', label: 'Glitch', icon: '⚡' },
];

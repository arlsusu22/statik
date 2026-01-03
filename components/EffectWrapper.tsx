import React, { useMemo } from 'react';
import { ElementEffect, ElementEffectType } from '../types';

interface EffectWrapperProps {
  effect?: ElementEffect;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Unique ID generator for SVG filters
let filterId = 0;
const getFilterId = () => `effect-filter-${++filterId}`;

// SVG filter definitions component
const EffectSvgDefs: React.FC<{ effect: ElementEffect; filterId: string }> = ({ effect, filterId }) => {
  const intensity = effect.intensity / 100;
  
  const filterContent = useMemo(() => {
    switch (effect.type) {
      case 'grain':
        return (
          <>
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.8" 
              numOctaves="4" 
              result="noise" 
            />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale={intensity * 12} 
              xChannelSelector="R" 
              yChannelSelector="G" 
              result="displaced"
            />
            <feComposite in="displaced" in2="SourceGraphic" operator="in" />
          </>
        );
        
      case 'glitch':
        const offset = intensity * 4;
        return (
          <>
            <feOffset in="SourceGraphic" dx={offset} dy={0} result="red" />
            <feOffset in="SourceGraphic" dx={-offset} dy={0} result="blue" />
            <feColorMatrix 
              in="red" 
              type="matrix" 
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" 
              result="redOnly" 
            />
            <feColorMatrix 
              in="blue" 
              type="matrix" 
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" 
              result="blueOnly" 
            />
            <feColorMatrix 
              in="SourceGraphic" 
              type="matrix" 
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" 
              result="greenOnly" 
            />
            <feBlend in="redOnly" in2="greenOnly" mode="screen" result="rg" />
            <feBlend in="rg" in2="blueOnly" mode="screen" />
          </>
        );
        
      default:
        return null;
    }
  }, [effect.type, intensity]);
  
  if (!filterContent) return null;
  
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter 
          id={filterId} 
          x="-50%" 
          y="-50%" 
          width="200%" 
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          {filterContent}
        </filter>
      </defs>
    </svg>
  );
};

// Main effect wrapper component
export const EffectWrapper: React.FC<EffectWrapperProps> = ({ 
  effect, 
  children, 
  className,
  style 
}) => {
  const uniqueFilterId = useMemo(() => getFilterId(), []);
  
  // If no effect or none type, just render children
  if (!effect || effect.type === 'none') {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  
  const intensity = effect.intensity / 100;
  
  // CSS-based effects (blur, glow)
  const cssEffectStyles: React.CSSProperties = {};
  let needsSvgFilter = false;
  
  switch (effect.type) {
    case 'blur':
      cssEffectStyles.filter = `blur(${intensity * 5}px)`;
      break;
      
    case 'grain':
    case 'glitch':
      needsSvgFilter = true;
      cssEffectStyles.filter = `url(#${uniqueFilterId})`;
      break;
  }
  
  return (
    <>
      {needsSvgFilter && <EffectSvgDefs effect={effect} filterId={uniqueFilterId} />}
      <div 
        className={className} 
        style={{ 
          ...style, 
          ...cssEffectStyles,
        }}
      >
        {children}
      </div>
    </>
  );
};

// Inline styles generator for simpler use cases
export const getEffectStyle = (effect?: ElementEffect): React.CSSProperties => {
  if (!effect || effect.type === 'none') return {};
  
  const intensity = effect.intensity / 100;
  
  switch (effect.type) {
    case 'blur':
      return { filter: `blur(${intensity * 5}px)` };
      
    default:
      return {};
  }
};

// Effect type options for UI
export const EFFECT_OPTIONS: { 
  type: ElementEffectType; 
  label: string; 
  icon: string;
}[] = [
  { type: 'none', label: 'None', icon: '○' },
  { type: 'blur', label: 'Blur', icon: '◐' },
  { type: 'grain', label: 'Grain', icon: '▒' },
  { type: 'glitch', label: 'Glitch', icon: '⚡' },
];

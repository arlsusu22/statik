import React, { useMemo } from 'react';
import { StickerOutline, StickerStyle } from '../types';

interface StickerWrapperProps {
  sticker?: StickerOutline;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Unique ID generator for SVG filters
let filterId = 0;
const getFilterId = () => `sticker-filter-${++filterId}`;

// SVG filter for sticker outline effect
const StickerSvgDefs: React.FC<{ sticker: StickerOutline; filterId: string }> = ({ sticker, filterId }) => {
  const thickness = sticker.thickness;
  
  const filterContent = useMemo(() => {
    // Smooth rounded outline using morphology dilate
    return (
      <>
        <feMorphology in="SourceAlpha" operator="dilate" radius={thickness} result="dilated" />
        <feFlood floodColor={sticker.color} result="color" />
        <feComposite in="color" in2="dilated" operator="in" result="outline" />
        <feMerge>
          <feMergeNode in="outline" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </>
    );
  }, [sticker.color, thickness]);
  
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

// Main sticker wrapper component
export const StickerWrapper: React.FC<StickerWrapperProps> = ({ 
  sticker, 
  children, 
  className,
  style 
}) => {
  const uniqueFilterId = useMemo(() => getFilterId(), []);
  
  // If no sticker or not enabled, just render children
  if (!sticker || !sticker.enabled) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  
  return (
    <>
      <StickerSvgDefs sticker={sticker} filterId={uniqueFilterId} />
      <div 
        className={className} 
        style={{ 
          ...style, 
          filter: `url(#${uniqueFilterId})`,
        }}
      >
        {children}
      </div>
    </>
  );
};

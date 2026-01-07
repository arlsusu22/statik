import React, { useMemo } from 'react';
import { StickerOutline } from '../types';

interface StickerWrapperProps {
  sticker?: StickerOutline;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Generate sticker outline using multiple layers of drop-shadows for a solid outline
const generateStickerShadow = (color: string, thickness: number): string => {
  const shadows: string[] = [];
  
  // Create multiple layers for a solid sticker effect
  // Layer 1: 8 cardinal + diagonal directions at full thickness
  const t = thickness;
  shadows.push(
    `drop-shadow(${t}px 0 0 ${color})`,
    `drop-shadow(-${t}px 0 0 ${color})`,
    `drop-shadow(0 ${t}px 0 ${color})`,
    `drop-shadow(0 -${t}px 0 ${color})`,
    `drop-shadow(${t}px ${t}px 0 ${color})`,
    `drop-shadow(-${t}px ${t}px 0 ${color})`,
    `drop-shadow(${t}px -${t}px 0 ${color})`,
    `drop-shadow(-${t}px -${t}px 0 ${color})`
  );
  
  // Layer 2: additional passes at same thickness for more solid fill
  shadows.push(
    `drop-shadow(${t}px 0 0 ${color})`,
    `drop-shadow(-${t}px 0 0 ${color})`,
    `drop-shadow(0 ${t}px 0 ${color})`,
    `drop-shadow(0 -${t}px 0 ${color})`
  );
  
  return shadows.join(' ');
};

// Main sticker wrapper component
export const StickerWrapper: React.FC<StickerWrapperProps> = ({ 
  sticker, 
  children, 
  className,
  style 
}) => {
  // If no sticker or not enabled, just render children directly without wrapper
  if (!sticker || !sticker.enabled) {
    return <>{children}</>;
  }
  
  const stickerFilter = useMemo(() => {
    return generateStickerShadow(sticker.color, sticker.thickness);
  }, [sticker.color, sticker.thickness]);
  
  return (
    <div 
      className={className} 
      style={{ 
        ...style, 
        // Use both prefixed and unprefixed for iOS compatibility
        WebkitFilter: stickerFilter,
        filter: stickerFilter,
        // Force GPU acceleration on iOS
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        // Ensure proper stacking context
        isolation: 'isolate',
        willChange: 'filter',
      }}
    >
      {children}
    </div>
  );
};

export default StickerWrapper;

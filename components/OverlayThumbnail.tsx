import React, { memo } from 'react';
import { ActivityStats, OverlayPack } from '../types';
import type { OverlayVariant } from './OverlayGallery';
import { OverlayRenderer } from './OverlayRenderer';

interface OverlayThumbnailProps {
  activity: ActivityStats;
  pack: OverlayPack;
  variant: OverlayVariant;
  label: string;
  backgroundImage?: string | null;
  imageAspectRatio?: number | null;
  onTap: () => void;
}

export const OverlayThumbnail: React.FC<OverlayThumbnailProps> = memo(function OverlayThumbnail({
  activity,
  pack,
  variant,
  label,
  backgroundImage,
  imageAspectRatio,
  onTap,
}) {
  return (
    <button
      onClick={onTap}
      className="group relative w-full h-full transition-all active:scale-[0.98] rounded-2xl bg-black/30 border border-white/10 overflow-hidden"
    >
      {/* Background image if provided */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {/* Overlay content */}
      <div className="absolute inset-0 pointer-events-none">
        <OverlayRenderer
          activity={activity}
          pack={pack}
          variant={variant}
          isPreview={true}
        />
      </div>

      {/* Hover/active state - brighter border */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none border-2 border-[#CCFF00]/50"
      />
    </button>
  );
});
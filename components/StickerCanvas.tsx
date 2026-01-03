import React, { useState, useRef } from 'react';
import { DroppedSticker, Sticker } from './StickerPanel';
import { OverlayPack, ActivityStats, BackgroundConfig } from '../types';
import { RoutePolyline } from './RoutePolyline';
import { WavyText } from './WavyText';

// Pack-specific sticker styles
const PACK_STICKER_STYLES: Record<OverlayPack, {
  font: string;
  color: string;
  bg: string;
  borderColor: string;
  shadow: string;
}> = {
  [OverlayPack.PAINT]: {
    font: '"Caveat", cursive',
    color: '#D4A84B',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  [OverlayPack.DOODLE]: {
    font: '"Lilita One", cursive',
    color: '#F5A5C8',
    bg: 'rgba(255,255,255,0.9)',
    borderColor: '#000',
    shadow: '3px 3px 0 #000',
  },
  [OverlayPack.RETRO]: {
    font: '"Teko", sans-serif',
    color: '#EDE7D9',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: '2px 2px 0 rgba(0,0,0,0.8)',
  },
  [OverlayPack.GROOVY]: {
    font: '"Modak", cursive',
    color: '#F5EBD8',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: '3px 3px 0 rgba(0,0,0,0.3)',
  },
  [OverlayPack.CARTOON]: {
    font: '"Permanent Marker", cursive',
    color: '#000000',
    bg: '#CCFF00',
    borderColor: '#000',
    shadow: '4px 4px 0 #000',
  },
  [OverlayPack.SKETCH]: {
    font: '"Patrick Hand", cursive',
    color: '#4BA3C3',
    bg: 'transparent',
    borderColor: '#2C2C2C',
    shadow: 'none',
  },
  [OverlayPack.CYBER]: {
    font: '"Press Start 2P", monospace',
    color: '#FFFFFF',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: 'none',
  },
  [OverlayPack.GLITCH]: {
    font: '"Rubik Glitch", cursive',
    color: '#FFFFFF',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: '-2px 0 #FF0000, 2px 0 #00FF00',
  },
  [OverlayPack.OUTLINE]: {
    font: '"Londrina Outline", cursive',
    color: '#FFFFFF',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: 'none',
  },
  [OverlayPack.BURNED]: {
    font: '"Rubik Burned", system-ui',
    color: '#FFFFFF',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: 'none',
  },
  [OverlayPack.BUNGEE]: {
    font: '"Bungee Outline", system-ui',
    color: '#FFFFFF',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: 'none',
  },
  [OverlayPack.JERSEY]: {
    font: '"Jersey 10 Charted", system-ui',
    color: '#FFFFFF',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: 'none',
  },
  [OverlayPack.KABLAMMO]: {
    font: '"Kablammo", system-ui',
    color: '#FFFFFF',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: 'none',
  },
  [OverlayPack.RIGHTEOUS]: {
    font: '"Righteous", cursive',
    color: '#C4B5FD',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: 'none',
  },
  [OverlayPack.GLASS]: {
    font: '"Bebas Neue", sans-serif',
    color: 'rgba(255,255,255,0.7)',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: '-1px -1px 1px rgba(255,255,255,0.3), 1px 1px 2px rgba(0,0,0,0.4)',
  },
  [OverlayPack.CHUNKY]: {
    font: '"Erica One", cursive',
    color: '#EF4444',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: '4px 4px 0 #000, 5px 5px 0 #000',
  },
  [OverlayPack.CHILL]: {
    font: '"Archivo Black", sans-serif',
    color: '#F5EED6',
    bg: '#1a1a1a',
    borderColor: 'transparent',
    shadow: 'none',
  },
  [OverlayPack.CHICLE]: {
    font: '"Chicle", cursive',
    color: '#FDE047',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: '2px 0 0 #166534, -2px 0 0 #166534, 0 2px 0 #166534, 0 -2px 0 #166534, 2px 2px 0 #166534',
  },
  [OverlayPack.SLACKEY]: {
    font: '"Slackey", cursive',
    color: '#FFFFFF',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: '2px 2px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.15)',
  },
  [OverlayPack.ROCK3D]: {
    font: '"Rock 3D", cursive',
    color: '#FFFFFF',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: '2px 2px 0 rgba(0,0,0,0.4), 3px 3px 0 rgba(0,0,0,0.3)',
  },
  [OverlayPack.MARKER]: {
    font: '"Permanent Marker", cursive',
    color: '#FFFFFF',
    bg: 'transparent',
    borderColor: 'transparent',
    shadow: '1px 1px 0 rgba(0,0,0,0.3)',
  },
};

interface StickerCanvasProps {
  backgroundImage: string | null;
  bgConfig: BackgroundConfig;
  stats: ActivityStats;
  droppedStickers: DroppedSticker[];
  onStickerDrop: (sticker: Sticker, x: number, y: number) => void;
  onStickerMove: (stickerId: string, x: number, y: number) => void;
  onStickerRemove: (stickerId: string) => void;
  onBackgroundMove: (x: number, y: number) => void;
  selectedStickerId: string | null;
  onStickerSelect: (id: string | null) => void;
  isEditing: boolean;
}

// Individual dropped sticker renderer
const DroppedStickerItem: React.FC<{
  sticker: DroppedSticker;
  stats: ActivityStats;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onRemove: () => void;
}> = ({ sticker, stats, isSelected, isEditing, onSelect, onMove, onRemove }) => {
  const style = PACK_STICKER_STYLES[sticker.pack];
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isEditing) return;
    e.stopPropagation();
    onSelect();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = sticker.x;
    const initialY = sticker.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      onMove(initialX + deltaX, initialY + deltaY);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Get display content based on sticker type
  const renderContent = () => {
    switch (sticker.type) {
      case 'title':
        return (
          <span 
            className="text-3xl font-bold whitespace-nowrap"
            style={{ 
              fontFamily: style.font, 
              color: style.color,
              textShadow: style.shadow,
            }}
          >
            {sticker.label}
          </span>
        );

      case 'map':
        return stats.polyline ? (
          <div className="w-32 h-32">
            <RoutePolyline
              polylineEncoded={stats.polyline}
              x={0}
              y={0}
              scale={0.5}
              opacity={1}
              strokeWidth={3}
              strokeColor={style.color}
              style="smooth"
              isEditing={false}
              isSelected={false}
            />
          </div>
        ) : (
          <div 
            className="w-24 h-24 border-2 border-dashed flex items-center justify-center rounded-lg"
            style={{ borderColor: style.color, color: style.color }}
          >
            <span className="text-xs opacity-60">No route</span>
          </div>
        );

      case 'stat-single':
        return (
          <div className="flex flex-col items-center" style={{ fontFamily: style.font }}>
            <span 
              className="text-2xl font-bold"
              style={{ color: style.color, textShadow: style.shadow }}
            >
              {sticker.statKey && stats[sticker.statKey] ? String(stats[sticker.statKey]) : '--'}
            </span>
            <span 
              className="text-xs uppercase tracking-wider opacity-70"
              style={{ color: style.color }}
            >
              {sticker.label}
            </span>
          </div>
        );

      case 'stat-bundle':
        return (
          <div 
            className="flex gap-4"
            style={{ fontFamily: style.font }}
          >
            {sticker.bundleKeys?.map(key => (
              <div key={key} className="flex flex-col items-center">
                <span 
                  className="text-xl font-bold"
                  style={{ color: style.color, textShadow: style.shadow }}
                >
                  {stats[key] ? String(stats[key]) : '--'}
                </span>
                <span 
                  className="text-[10px] uppercase tracking-wider opacity-70"
                  style={{ color: style.color }}
                >
                  {key}
                </span>
              </div>
            ))}
          </div>
        );

      case 'wavy-text':
        return (
          <WavyText
            text={sticker.label}
            color={sticker.wavyColor || '#E63946'}
            fontSize={36}
            waveIntensity={6}
          />
        );

      default:
        return <span>{sticker.label}</span>;
    }
  };

  // Determine if sticker should have a visible background (DOODLE style)
  const hasBackground = sticker.pack === OverlayPack.DOODLE;

  return (
    <div
      ref={ref}
      onPointerDown={handlePointerDown}
      className={`
        absolute cursor-move touch-none select-none
        ${isSelected ? 'z-50' : 'z-10'}
        ${isEditing ? 'hover:ring-2 hover:ring-[#CCFF00]/50' : ''}
        ${isSelected && isEditing ? 'ring-2 ring-[#CCFF00]' : ''}
      `}
      style={{
        transform: `translate(${sticker.x}px, ${sticker.y}px) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      <div 
        className={`
          px-3 py-2 rounded-lg
          ${hasBackground ? 'border-2' : ''}
        `}
        style={{
          backgroundColor: hasBackground ? style.bg : 'transparent',
          borderColor: hasBackground ? style.borderColor : 'transparent',
        }}
      >
        {renderContent()}
      </div>

      {/* Delete button when selected */}
      {isSelected && isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
};

export const StickerCanvas: React.FC<StickerCanvasProps> = ({
  backgroundImage,
  bgConfig,
  stats,
  droppedStickers,
  onStickerDrop,
  onStickerMove,
  onStickerRemove,
  onBackgroundMove,
  selectedStickerId,
  onStickerSelect,
  isEditing,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const stickerData = e.dataTransfer.getData('sticker');
    if (!stickerData) return;

    try {
      const sticker: Sticker = JSON.parse(stickerData);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        // Calculate drop position relative to canvas center
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        onStickerDrop(sticker, x, y);
      }
    } catch (err) {
      console.error('Failed to parse sticker data:', err);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect when clicking empty canvas area
    if (e.target === canvasRef.current || e.target === canvasRef.current?.firstChild) {
      onStickerSelect(null);
    }
  };

  // Background drag handling
  const handleBgPointerDown = (e: React.PointerEvent) => {
    if (!isEditing) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = bgConfig.x;
    const initialY = bgConfig.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      onBackgroundMove(initialX + deltaX, initialY + deltaY);
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
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
      className={`
        relative w-full h-full overflow-hidden
        ${bgConfig.transparent ? '' : 'bg-black'}
        ${isDragOver ? 'ring-2 ring-[#CCFF00] ring-inset' : ''}
        transition-all duration-150
      `}
    >
      {/* Background Image Layer */}
      {backgroundImage && !bgConfig.transparent && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-move"
          onPointerDown={handleBgPointerDown}
          style={{
            transform: `translate(${bgConfig.x}px, ${bgConfig.y}px) scale(${bgConfig.scale})`,
            opacity: bgConfig.opacity,
          }}
        >
          <img
            src={backgroundImage}
            alt="Background"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        </div>
      )}

      {/* Transparent mode indicator */}
      {bgConfig.transparent && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #333 25%, transparent 25%),
              linear-gradient(-45deg, #333 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #333 75%),
              linear-gradient(-45deg, transparent 75%, #333 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            opacity: 0.3,
          }}
        />
      )}

      {/* Dropped Stickers Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative pointer-events-auto" style={{ width: '100%', height: '100%' }}>
          {droppedStickers.map(sticker => (
            <DroppedStickerItem
              key={sticker.id}
              sticker={sticker}
              stats={stats}
              isSelected={selectedStickerId === sticker.id}
              isEditing={isEditing}
              onSelect={() => onStickerSelect(sticker.id)}
              onMove={(x, y) => onStickerMove(sticker.id, x, y)}
              onRemove={() => onStickerRemove(sticker.id)}
            />
          ))}
        </div>
      </div>

      {/* Drop zone indicator */}
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#CCFF00]/10 pointer-events-none">
          <div className="text-[#CCFF00] text-lg font-medium">
            Drop sticker here
          </div>
        </div>
      )}
    </div>
  );
};

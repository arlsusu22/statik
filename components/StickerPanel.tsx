import React, { useState } from 'react';
import { OverlayPack, ActivityStats } from '../types';
import { WAVY_TEXT_PRESETS } from './WavyText';

// Sticker types
export type StickerType = 'title' | 'map' | 'stat-single' | 'stat-bundle' | 'stat-all' | 'decoration' | 'wavy-text';

export interface Sticker {
  id: string;
  type: StickerType;
  pack: OverlayPack;
  label: string;
  statKey?: keyof ActivityStats; // For single stats
  bundleKeys?: (keyof ActivityStats)[]; // For bundles like [distance, time]
  previewStyle?: 'landscape' | 'portrait' | 'square'; // For decorative stickers
  wavyColor?: string; // For wavy text stickers
}

interface StickerPanelProps {
  activePack: OverlayPack;
  stats: ActivityStats;
  onStickerDragStart: (sticker: Sticker) => void;
  onStickerDrop: (sticker: Sticker, x: number, y: number) => void;
  droppedStickers: DroppedSticker[];
  onPackChange: (pack: OverlayPack) => void;
}

export interface DroppedSticker extends Sticker {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

// Pack-specific configurations
const PACK_TITLES: Record<OverlayPack, string[]> = {
  [OverlayPack.PAINT]: ['Running Club', 'Slow Pace', 'Easy Run', 'Trail Gang', 'Run Crew'],
  [OverlayPack.DOODLE]: ['Let\'s Go!', 'Fun Run', 'Best Day', 'Running!', 'Zoom!'],
  [OverlayPack.RETRO]: ['Championship', 'Track Day', 'Personal Best', 'Race Day', 'Training'],
  [OverlayPack.GROOVY]: ['Good Vibes', 'Keep Moving', 'Far Out', 'Groovy Run', 'Peace Run'],
  [OverlayPack.CARTOON]: ['POW!', 'BOOM!', 'WOW!', 'RUN!', 'GO!'],
  [OverlayPack.SKETCH]: ['Let\'s Explore!', 'Adventure', 'On The Road', 'Journey', 'Wandering'],
  [OverlayPack.CYBER]: ['SYSTEM', 'DATA', 'LOAD', 'RUN', 'EXEC'],
  [OverlayPack.GLITCH]: ['GLITCH', 'ERROR', 'BREAK', 'CRASH', 'BUG'],
  [OverlayPack.OUTLINE]: ['Outline', 'Trace', 'Edge', 'Line', 'Draw'],
  [OverlayPack.GLASS]: ['Clarity', 'Crystal', 'Pure', 'Reflect', 'Clear'],
  [OverlayPack.CHUNKY]: ['BOLD!', 'BIG!', 'HEAVY!', 'THICK!', 'POWER!'],
  [OverlayPack.CHILL]: ['chill', 'easy', 'relax', 'calm', 'slow'],
  [OverlayPack.CHICLE]: ['Sweet!', 'Yay!', 'Fun!', 'Play!', 'Joy!'],
  [OverlayPack.SLACKEY]: ['Easy!', 'Cool!', 'Nice!', 'Rad!', 'Yo!'],
  [OverlayPack.ROCK3D]: ['ROCK!', 'YEAH!', 'LOUD!', 'EPIC!', 'BOOM!'],
  [OverlayPack.MARKER]: ['Draw!', 'Sketch', 'Scrawl', 'Write', 'Mark!'],
  [OverlayPack.BURNED]: ['FIRE!', 'BURN!', 'HOT!', 'BLAZE!', 'HEAT!'],
  [OverlayPack.BUNGEE]: ['JUMP!', 'LEAP!', 'BOLD!', 'BIG!', 'WOW!'],
  [OverlayPack.JERSEY]: ['CHAMP', 'MVP', 'PRO', 'ACE', 'STAR'],
  [OverlayPack.KABLAMMO]: ['POW!', 'BAM!', 'WHAM!', 'BOOM!', 'ZAP!'],
  [OverlayPack.RIGHTEOUS]: ['RETRO', 'VIBES', 'COOL', 'SMOOTH', 'NICE'],
  [OverlayPack.POPPINS]: ['CLEAN', 'MODERN', 'SHARP', 'FRESH', 'SLEEK'],
  [OverlayPack.RUBIK_DOODLE]: ['DOODLE', 'SKETCH', 'DRAW', 'PLAY', 'FUN'],
  [OverlayPack.FASCINATE]: ['DECO', 'GLAM', 'SHINE', 'LUXE', 'GOLD'],
  [OverlayPack.VINA_SANS]: ['BOLD', 'STRONG', 'POWER', 'FORCE', 'PUSH'],
  [OverlayPack.QAHIRI]: ['SHARP', 'EDGE', 'ANGLE', 'CUT', 'POINT'],
  [OverlayPack.BARRIO]: ['STREET', 'URBAN', 'VIBE', 'FLOW', 'MOVE'],
  [OverlayPack.DOKDO]: ['BRUSH', 'INK', 'STROKE', 'FLOW', 'ZEN'],
  [OverlayPack.RUBIK_MAZE]: ['MAZE', 'PATH', 'TWIST', 'TURN', 'SOLVE'],
  [OverlayPack.RUBIK_MAPS]: ['MAP', 'ROUTE', 'TRAIL', 'PATH', 'EXPLORE'],
  [OverlayPack.MIXO]: ['STENCIL', 'FORM', 'SHAPE', 'CUT', 'BLOCK'],
  [OverlayPack.CHAUMONT]: ['ART', 'AVANT', 'DESIGN', 'FORM', 'TYPE'],
  [OverlayPack.BACKOUT]: ['OUT', 'BOLD', 'BLOCK', 'BACK', 'BIG'],
  [OverlayPack.GULAX]: ['QUIRK', 'BLOB', 'BUBBLE', 'FUN', 'PLAY'],
  [OverlayPack.LITTLE_HOPE]: ['HOPE', 'DREAM', 'WISH', 'LOVE', 'JOY'],
  [OverlayPack.JUMPS_WINTER]: ['JUMP', 'SNOW', 'CHILL', 'FROST', 'COLD'],
  [OverlayPack.STRANGE_MARKS]: ['DRAW', 'SKETCH', 'SCRIBBLE', 'MARK', 'DOODLE'],
  [OverlayPack.PLAYFUL_BOXES]: ['PLAY', 'BOX', 'FUN', 'BLOCK', 'GAME'],
  [OverlayPack.POSTBOOK]: ['POST', 'SHARE', 'SNAP', 'STORY', 'FEED'],
  [OverlayPack.SUGGESTED]: ['3D', 'BOLD', 'BLOCK', 'DEEP', 'POP'],
  [OverlayPack.AMATIC]: ['HAND', 'DRAWN', 'TALL', 'THIN', 'FREE'],
  [OverlayPack.BLOX2]: ['BLOCK', 'BOX', 'GEO', 'GRID', 'CUBE'],
  [OverlayPack.WEDGIE]: ['WEDGE', 'SLICE', 'ANGLE', 'SHARP', 'TILT'],
};

// Pack visual styles for sticker appearance
const PACK_STYLES: Record<OverlayPack, {
  font: string;
  color: string;
  labelColor: string;
  accentBg: string;
  accentBorder: string;
}> = {
  [OverlayPack.PAINT]: {
    font: '"Caveat", cursive',
    color: '#D4A84B',
    labelColor: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/30',
  },
  [OverlayPack.DOODLE]: {
    font: '"Noot", cursive',
    color: '#F5A5C8',
    labelColor: 'text-pink-400',
    accentBg: 'bg-pink-500/10',
    accentBorder: 'border-pink-500/30',
  },
  [OverlayPack.RETRO]: {
    font: '"Teko", sans-serif',
    color: '#EDE7D9',
    labelColor: 'text-stone-300',
    accentBg: 'bg-stone-500/10',
    accentBorder: 'border-stone-500/30',
  },
  [OverlayPack.GROOVY]: {
    font: '"Modak", cursive',
    color: '#F5EBD8',
    labelColor: 'text-amber-200',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/30',
  },
  [OverlayPack.CARTOON]: {
    font: '"Permanent Marker", cursive',
    color: '#000000',
    labelColor: 'text-lime-400',
    accentBg: 'bg-lime-500/10',
    accentBorder: 'border-lime-500/30',
  },
  [OverlayPack.SKETCH]: {
    font: '"Patrick Hand", cursive',
    color: '#4BA3C3',
    labelColor: 'text-sky-400',
    accentBg: 'bg-sky-500/10',
    accentBorder: 'border-sky-500/30',
  },
  [OverlayPack.CYBER]: {
    font: '"Press Start 2P", monospace',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-white/10',
    accentBorder: 'border-white/30',
  },
  [OverlayPack.GLITCH]: {
    font: '"Rubik Glitch", cursive',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-white/10',
    accentBorder: 'border-white/30',
  },
  [OverlayPack.OUTLINE]: {
    font: '"Londrina Outline", cursive',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-white/10',
    accentBorder: 'border-white/30',
  },
  [OverlayPack.BURNED]: {
    font: '"Rubik Burned", system-ui',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-white/10',
    accentBorder: 'border-white/30',
  },
  [OverlayPack.BUNGEE]: {
    font: '"Bungee Outline", system-ui',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-white/10',
    accentBorder: 'border-white/30',
  },
  [OverlayPack.JERSEY]: {
    font: '"Jersey 10 Charted", system-ui',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-white/10',
    accentBorder: 'border-white/30',
  },
  [OverlayPack.KABLAMMO]: {
    font: '"Kablammo", system-ui',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-white/10',
    accentBorder: 'border-white/30',
  },
  [OverlayPack.RIGHTEOUS]: {
    font: '"Righteous", cursive',
    color: '#C4B5FD',
    labelColor: 'text-purple-300',
    accentBg: 'bg-purple-500/10',
    accentBorder: 'border-purple-500/30',
  },
  [OverlayPack.GLASS]: {
    font: '"Bebas Neue", sans-serif',
    color: 'rgba(255,255,255,0.7)',
    labelColor: 'text-white/60',
    accentBg: 'bg-white/5',
    accentBorder: 'border-white/20',
  },
  [OverlayPack.CHUNKY]: {
    font: '"Erica One", cursive',
    color: '#EF4444',
    labelColor: 'text-red-400',
    accentBg: 'bg-red-500/10',
    accentBorder: 'border-red-500/30',
  },
  [OverlayPack.CHILL]: {
    font: '"Archivo Black", sans-serif',
    color: '#F5EED6',
    labelColor: 'text-amber-100',
    accentBg: 'bg-zinc-800',
    accentBorder: 'border-zinc-600',
  },
  [OverlayPack.CHICLE]: {
    font: '"Chicle", cursive',
    color: '#FEF9C3',
    labelColor: 'text-yellow-200',
    accentBg: 'bg-green-500/10',
    accentBorder: 'border-green-400/30',
  },
  [OverlayPack.SLACKEY]: {
    font: '"Slackey", cursive',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-zinc-700',
    accentBorder: 'border-zinc-500',
  },
  [OverlayPack.ROCK3D]: {
    font: '"Rock 3D", cursive',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-zinc-700',
    accentBorder: 'border-zinc-500',
  },
  [OverlayPack.MARKER]: {
    font: '"Permanent Marker", cursive',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-zinc-700',
    accentBorder: 'border-zinc-500',
  },
  [OverlayPack.POPPINS]: {
    font: '"Poppins", sans-serif',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-zinc-700',
    accentBorder: 'border-zinc-500',
  },
  [OverlayPack.RUBIK_DOODLE]: {
    font: '"Rubik Doodle Shadow", system-ui',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-zinc-700',
    accentBorder: 'border-zinc-500',
  },
  [OverlayPack.FASCINATE]: {
    font: '"Fascinate Inline", cursive',
    color: '#FFD700',
    labelColor: 'text-yellow-400',
    accentBg: 'bg-yellow-500/10',
    accentBorder: 'border-yellow-500/30',
  },
  [OverlayPack.VINA_SANS]: {
    font: '"Vina Sans", cursive',
    color: '#FF6B6B',
    labelColor: 'text-red-400',
    accentBg: 'bg-red-500/10',
    accentBorder: 'border-red-500/30',
  },
  [OverlayPack.QAHIRI]: {
    font: '"Qahiri", sans-serif',
    color: '#4ECDC4',
    labelColor: 'text-teal-400',
    accentBg: 'bg-teal-500/10',
    accentBorder: 'border-teal-500/30',
  },
  [OverlayPack.BARRIO]: {
    font: '"Barrio", cursive',
    color: '#FF9F1C',
    labelColor: 'text-orange-400',
    accentBg: 'bg-orange-500/10',
    accentBorder: 'border-orange-500/30',
  },
  [OverlayPack.DOKDO]: {
    font: '"Dokdo", cursive',
    color: '#E8E8E8',
    labelColor: 'text-gray-200',
    accentBg: 'bg-zinc-700',
    accentBorder: 'border-zinc-500',
  },
  [OverlayPack.RUBIK_MAZE]: {
    font: '"Rubik Maze", system-ui',
    color: '#A855F7',
    labelColor: 'text-purple-400',
    accentBg: 'bg-purple-500/10',
    accentBorder: 'border-purple-500/30',
  },
  [OverlayPack.RUBIK_MAPS]: {
    font: '"Rubik Maps", system-ui',
    color: '#22C55E',
    labelColor: 'text-green-400',
    accentBg: 'bg-green-500/10',
    accentBorder: 'border-green-500/30',
  },
  [OverlayPack.MIXO]: {
    font: '"Mixo", sans-serif',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-zinc-700',
    accentBorder: 'border-zinc-500',
  },
  [OverlayPack.CHAUMONT]: {
    font: '"Chaumont", sans-serif',
    color: '#F472B6',
    labelColor: 'text-pink-400',
    accentBg: 'bg-pink-500/10',
    accentBorder: 'border-pink-500/30',
  },
  [OverlayPack.BACKOUT]: {
    font: '"Backout", sans-serif',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-zinc-700',
    accentBorder: 'border-zinc-500',
  },
  [OverlayPack.GULAX]: {
    font: '"Gulax", sans-serif',
    color: '#34D399',
    labelColor: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/30',
  },
  [OverlayPack.LITTLE_HOPE]: {
    font: '"Little Hope", cursive',
    color: '#F08C21',
    labelColor: 'text-orange-400',
    accentBg: 'bg-orange-500/10',
    accentBorder: 'border-orange-500/30',
  },
  [OverlayPack.JUMPS_WINTER]: {
    font: '"Jumps Winter", cursive',
    color: '#B0A6DF',
    labelColor: 'text-purple-300',
    accentBg: 'bg-purple-500/10',
    accentBorder: 'border-purple-500/30',
  },
  [OverlayPack.STRANGE_MARKS]: {
    font: '"Strange Marks", cursive',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-white/10',
    accentBorder: 'border-white/30',
  },
  [OverlayPack.PLAYFUL_BOXES]: {
    font: '"Playful Boxes", sans-serif',
    color: '#FFD93D',
    labelColor: 'text-yellow-400',
    accentBg: 'bg-yellow-500/10',
    accentBorder: 'border-yellow-500/30',
  },
  [OverlayPack.POSTBOOK]: {
    font: '"Postbook", sans-serif',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-white/10',
    accentBorder: 'border-white/30',
  },
  [OverlayPack.SUGGESTED]: {
    font: '"Suggested", sans-serif',
    color: '#FF6B6B',
    labelColor: 'text-red-400',
    accentBg: 'bg-red-500/10',
    accentBorder: 'border-red-500/30',
  },
  [OverlayPack.AMATIC]: {
    font: '"Amatic SC", cursive',
    color: '#FFFFFF',
    labelColor: 'text-white',
    accentBg: 'bg-white/10',
    accentBorder: 'border-white/30',
  },
  [OverlayPack.BLOX2]: {
    font: '"Blox2", sans-serif',
    color: '#00FF00',
    labelColor: 'text-green-400',
    accentBg: 'bg-green-500/10',
    accentBorder: 'border-green-500/30',
  },
  [OverlayPack.WEDGIE]: {
    font: '"Wedgie", cursive',
    color: '#FF6B35',
    labelColor: 'text-orange-400',
    accentBg: 'bg-orange-500/10',
    accentBorder: 'border-orange-500/30',
  },
};

// Draggable sticker item - looks like a graphic element
const StickerTile: React.FC<{
  sticker: Sticker;
  packStyle: typeof PACK_STYLES[OverlayPack];
  onDragStart: (sticker: Sticker) => void;
  displayValue?: string;
  isWide?: boolean;
}> = ({ sticker, packStyle, onDragStart, displayValue, isWide = false }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('sticker', JSON.stringify(sticker));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(sticker);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        ${isWide ? 'col-span-2' : ''}
        aspect-[4/3] rounded-lg cursor-grab active:cursor-grabbing
        bg-zinc-800/80 hover:bg-zinc-700/80
        border border-zinc-700/50 hover:border-zinc-600
        flex items-center justify-center p-2
        transition-all duration-150 hover:scale-[1.02]
        select-none overflow-hidden group
      `}
    >
      <span 
        className="text-center leading-tight truncate"
        style={{ 
          fontFamily: packStyle.font, 
          color: packStyle.color,
          fontSize: sticker.type === 'title' ? '0.9rem' : '0.75rem',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)'
        }}
      >
        {displayValue || sticker.label}
      </span>
    </div>
  );
};

// Map sticker tile with route preview styling
const MapStickerTile: React.FC<{
  sticker: Sticker;
  packStyle: typeof PACK_STYLES[OverlayPack];
  onDragStart: (sticker: Sticker) => void;
  variant: 'landscape' | 'portrait' | 'square';
}> = ({ sticker, packStyle, onDragStart, variant }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('sticker', JSON.stringify({ ...sticker, previewStyle: variant }));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(sticker);
  };

  const aspectClass = variant === 'landscape' ? 'aspect-[16/9]' : variant === 'portrait' ? 'aspect-[3/4]' : 'aspect-square';
  const colSpan = variant === 'landscape' ? 'col-span-2' : '';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        ${colSpan} ${aspectClass}
        rounded-lg cursor-grab active:cursor-grabbing
        bg-zinc-800/60 hover:bg-zinc-700/60
        border-2 border-dashed border-zinc-600/50 hover:border-zinc-500
        flex items-center justify-center p-3
        transition-all duration-150 hover:scale-[1.02]
        select-none group
      `}
    >
      {/* Fake route preview */}
      <svg viewBox="0 0 100 60" className="w-full h-full opacity-60 group-hover:opacity-80 transition-opacity">
        <path
          d="M 10,50 Q 25,20 40,35 T 70,25 T 90,40"
          fill="none"
          stroke={packStyle.color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="50" r="3" fill={packStyle.color} />
        <circle cx="90" cy="40" r="3" fill={packStyle.color} />
      </svg>
    </div>
  );
};

// Wavy text tile with preview
const WavyTextTile: React.FC<{
  sticker: Sticker;
  onDragStart: (sticker: Sticker) => void;
}> = ({ sticker, onDragStart }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('sticker', JSON.stringify(sticker));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(sticker);
  };

  // Split text for wavy preview
  const words = sticker.label.split(' ');

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        col-span-1 aspect-square rounded-lg cursor-grab active:cursor-grabbing
        bg-zinc-800/80 hover:bg-zinc-700/80
        border border-zinc-700/50 hover:border-zinc-600
        flex flex-col items-center justify-center p-2
        transition-all duration-150 hover:scale-[1.02]
        select-none overflow-hidden group
      `}
    >
      <div 
        className="flex flex-col items-center leading-none"
        style={{
          fontFamily: '"Modak", "Lilita One", cursive',
          color: sticker.wavyColor || '#E63946',
          fontSize: '0.65rem',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        {words.map((word, i) => (
          <span 
            key={i} 
            style={{
              transform: `rotate(${Math.sin(i * 0.8) * 3}deg)`,
              display: 'block',
              marginTop: i > 0 ? '-2px' : 0,
            }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

// Section header
const SectionHeader: React.FC<{ title: string; packStyle: typeof PACK_STYLES[OverlayPack] }> = ({ title, packStyle }) => (
  <div className="flex items-center gap-2 mb-2">
    <span className={`text-[10px] uppercase tracking-widest font-bold ${packStyle.labelColor}`}>
      {title}
    </span>
    <div className="flex-1 h-px bg-zinc-800" />
  </div>
);

export const StickerPanel: React.FC<StickerPanelProps> = ({
  activePack,
  stats,
  onStickerDragStart,
  onStickerDrop,
  droppedStickers,
  onPackChange,
}) => {
  const packStyle = PACK_STYLES[activePack];
  const titles = PACK_TITLES[activePack];

  // Build sticker definitions
  const titleStickers: Sticker[] = titles.map((title, i) => ({
    id: `title-${i}`,
    type: 'title',
    pack: activePack,
    label: title,
  }));

  const mapStickers: Sticker[] = [
    { id: 'map-landscape', type: 'map', pack: activePack, label: 'Route', previewStyle: 'landscape' },
    { id: 'map-portrait', type: 'map', pack: activePack, label: 'Route', previewStyle: 'portrait' },
    { id: 'map-square', type: 'map', pack: activePack, label: 'Route', previewStyle: 'square' },
  ];

  const singleStatStickers: Sticker[] = [
    { id: 'stat-distance', type: 'stat-single', pack: activePack, label: 'Distance', statKey: 'distance' },
    { id: 'stat-time', type: 'stat-single', pack: activePack, label: 'Time', statKey: 'time' },
    { id: 'stat-pace', type: 'stat-single', pack: activePack, label: 'Pace', statKey: 'pace' },
    { id: 'stat-elevation', type: 'stat-single', pack: activePack, label: 'Elevation', statKey: 'elevation' },
    { id: 'stat-calories', type: 'stat-single', pack: activePack, label: 'Calories', statKey: 'calories' },
    { id: 'stat-hr', type: 'stat-single', pack: activePack, label: 'Heart Rate', statKey: 'heartRate' },
  ];

  const bundleStickers: Sticker[] = [
    { id: 'bundle-main', type: 'stat-bundle', pack: activePack, label: 'Dist + Time', bundleKeys: ['distance', 'time'] },
    { id: 'bundle-performance', type: 'stat-bundle', pack: activePack, label: 'Pace + HR', bundleKeys: ['pace', 'heartRate'] },
    { id: 'bundle-all', type: 'stat-all', pack: activePack, label: 'All Stats', bundleKeys: ['distance', 'time', 'pace', 'elevation', 'calories', 'heartRate'] },
  ];

  // Wavy text stickers - retro psychedelic style
  const wavyTextStickers: Sticker[] = WAVY_TEXT_PRESETS.map((preset, i) => ({
    id: `wavy-${i}`,
    type: 'wavy-text',
    pack: activePack,
    label: preset.text,
    wavyColor: preset.color,
  }));

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 overflow-hidden">
      {/* Pack Tabs - Horizontal at top */}
      <div className="flex border-b border-zinc-800 shrink-0">
        {Object.values(OverlayPack).map(pack => (
          <button
            key={pack}
            onClick={() => onPackChange(pack)}
            className={`
              flex-1 py-3 text-[10px] font-bold uppercase tracking-widest
              transition-all duration-200 relative
              ${activePack === pack 
                ? 'text-white bg-zinc-800' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }
            `}
          >
            {pack}
            {activePack === pack && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: PACK_STYLES[pack].color }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        
        {/* TITLES Section */}
        <div>
          <SectionHeader title="Titles" packStyle={packStyle} />
          <div className="grid grid-cols-2 gap-2">
            {titleStickers.map(sticker => (
              <StickerTile
                key={sticker.id}
                sticker={sticker}
                packStyle={packStyle}
                onDragStart={onStickerDragStart}
              />
            ))}
          </div>
        </div>

        {/* MAPS Section */}
        <div>
          <SectionHeader title="Maps" packStyle={packStyle} />
          <div className="grid grid-cols-2 gap-2">
            {mapStickers.map(sticker => (
              <MapStickerTile
                key={sticker.id}
                sticker={sticker}
                packStyle={packStyle}
                onDragStart={onStickerDragStart}
                variant={sticker.previewStyle as 'landscape' | 'portrait' | 'square'}
              />
            ))}
          </div>
        </div>

        {/* STATS Section */}
        <div>
          <SectionHeader title="Stats" packStyle={packStyle} />
          <div className="grid grid-cols-3 gap-2">
            {singleStatStickers.map(sticker => (
              <StickerTile
                key={sticker.id}
                sticker={sticker}
                packStyle={packStyle}
                onDragStart={onStickerDragStart}
                displayValue={sticker.statKey ? String(stats[sticker.statKey] || sticker.label) : sticker.label}
              />
            ))}
          </div>
        </div>

        {/* BUNDLES Section */}
        <div>
          <SectionHeader title="Bundles" packStyle={packStyle} />
          <div className="grid grid-cols-2 gap-2">
            {bundleStickers.map(sticker => (
              <StickerTile
                key={sticker.id}
                sticker={sticker}
                packStyle={packStyle}
                onDragStart={onStickerDragStart}
                isWide={sticker.type === 'stat-all'}
              />
            ))}
          </div>
        </div>

        {/* WAVY TEXT Section */}
        <div>
          <SectionHeader title="Wavy Text" packStyle={packStyle} />
          <div className="grid grid-cols-2 gap-2">
            {wavyTextStickers.map(sticker => (
              <WavyTextTile
                key={sticker.id}
                sticker={sticker}
                onDragStart={onStickerDragStart}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Footer - Sticker count */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/80 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-500">
            {droppedStickers.length} on canvas
          </span>
          <span className="text-[10px] text-zinc-600">
            Drag to add
          </span>
        </div>
      </div>
    </div>
  );
};

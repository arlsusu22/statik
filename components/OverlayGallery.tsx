import React, { useState, useRef, useCallback, useMemo, memo } from 'react';
import { ActivityStats, OverlayPack, PACK_CONFIG } from '../types';
import { OverlayPreview } from './OverlayPreview';
import { OverlayThumbnail } from './OverlayThumbnail';

// Define overlay variants for each pack
export type OverlayVariant = 'stats-only' | 'route-only' | 'route-stats' | 'full-data' | 'title-only' | 'scattered' | 'hero-stat' | 'circular' | 'wavy' | 'split-view' | 'pace-chart' | 'elevation-chart' | 'create';

export interface OverlayDefinition {
  id: string;
  variant: OverlayVariant;
  label: string;
  description: string;
}

// Each pack has the same variants, but styled differently
// Order matters - this is how they appear in the carousel
// Note: circular and wavy are commented out for future use
const OVERLAY_VARIANTS: OverlayDefinition[] = [
  { id: 'stats-only', variant: 'stats-only', label: 'Stats', description: 'Stats with route below' },
  { id: 'hero-stat', variant: 'hero-stat', label: 'Hero', description: 'Large main stat with smaller stats' },
  { id: 'route-stats', variant: 'route-stats', label: 'Route + Stats', description: 'Route with stats below' },
  { id: 'split-view', variant: 'split-view', label: 'Split', description: 'Stats left, route right' },
  { id: 'pace-chart', variant: 'pace-chart', label: 'Pace Chart', description: 'Pace per kilometer bars' },
  { id: 'elevation-chart', variant: 'elevation-chart', label: 'Elevation', description: 'Elevation profile chart' },
  // { id: 'circular', variant: 'circular', label: 'Circle', description: 'Stats arranged in a circle' },
  // { id: 'wavy', variant: 'wavy', label: 'Wave', description: 'Stats in a wavy line' },
  { id: 'create', variant: 'create', label: 'Create', description: 'Build your own layout' },
];

interface OverlayGalleryProps {
  activity: ActivityStats;
  onBack: () => void;
}

// Carousel component for each pack's overlays
interface PackCarouselProps {
  pack: OverlayPack;
  activity: ActivityStats;
  backgroundImage: string | null;
  imageAspectRatio: number | null;
  onSelectOverlay: (pack: OverlayPack, variant: OverlayVariant) => void;
}

const PackCarousel: React.FC<PackCarouselProps> = memo(function PackCarousel({
  pack,
  activity,
  backgroundImage,
  imageAspectRatio,
  onSelectOverlay,
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tabStyle = PACK_TAB_STYLES[pack];
  
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const itemWidth = scrollRef.current.offsetWidth * 0.42 + 12; // card width + gap
    const newIndex = Math.round(scrollLeft / itemWidth);
    setCurrentIndex(Math.min(newIndex, OVERLAY_VARIANTS.length - 1));
  }, []);

  // Memoize tap handlers to prevent re-renders of OverlayThumbnail
  const tapHandlers = useMemo(() => {
    return OVERLAY_VARIANTS.reduce((acc, overlay) => {
      acc[overlay.id] = () => onSelectOverlay(pack, overlay.variant);
      return acc;
    }, {} as Record<string, () => void>);
  }, [pack, onSelectOverlay]);

  return (
    <div className="mb-6">
      {/* Pack header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 
          className="text-lg font-bold"
          style={{
            fontFamily: tabStyle.font,
            color: tabStyle.color,
            textShadow: tabStyle.textShadow,
          }}
        >
          {PACK_CONFIG[pack].label}
        </h3>
        {/* Carousel dots indicator */}
        <div className="flex gap-1.5">
          {OVERLAY_VARIANTS.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-white scale-110' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Horizontal scrolling carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        {OVERLAY_VARIANTS.map((overlay) => (
          <div
            key={overlay.id}
            className="flex-shrink-0 snap-start aspect-[3/4]"
            style={{ width: '52%', minWidth: '160px' }}
          >
            <OverlayThumbnail
              activity={activity}
              pack={pack}
              variant={overlay.variant}
              label=""
              backgroundImage={backgroundImage}
              imageAspectRatio={imageAspectRatio}
              onTap={tapHandlers[overlay.id]}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

// Active packs - only OFL licensed fonts
const ACTIVE_PACKS: OverlayPack[] = [
  // Featured packs at top
  OverlayPack.SLACKEY,
  OverlayPack.DOODLE,
  OverlayPack.COMFORTAA,
  // Playful Google Fonts
  OverlayPack.BANGERS,
  OverlayPack.FRECKLE_FACE,
  OverlayPack.ATKINSON,
  OverlayPack.CHEWY,
  OverlayPack.LUCKIEST_GUY,
  // Clean & Professional
  OverlayPack.RETRO,
  OverlayPack.FINLANDICA,
  // Stylish & Fun
  OverlayPack.GROOVY,
  OverlayPack.CHICLE,
  OverlayPack.ALLERTA,
  // Digital & Tech
  OverlayPack.CYBER,
  OverlayPack.GLITCH,
  // Display Fonts
  OverlayPack.DOKDO,
  OverlayPack.KDAM,
  // New OFL fonts
  OverlayPack.CAFE24_MOYAMOYA,
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
];

// Pack styling for tabs (used in editor)
export const PACK_TAB_STYLES: Record<OverlayPack, {
  font: string;
  color: string;
  bgColor: string;
  textShadow?: string;
}> = {
  [OverlayPack.DOODLE]: {
    font: '"Galindo", cursive',
    color: '#F5A5C8',
    bgColor: '#000',
    textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
  },
  [OverlayPack.GROOVY]: {
    font: '"Modak", cursive',
    color: '#F5EBD8',
    bgColor: '#2a1a0a',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  [OverlayPack.RETRO]: {
    font: '"Teko", sans-serif',
    color: '#F5F0E6',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 rgba(0,0,0,0.7)',
  },
  [OverlayPack.PAINT]: { font: 'inherit', color: '#fff', bgColor: '#333' },
  [OverlayPack.CARTOON]: { font: 'inherit', color: '#fff', bgColor: '#333' },
  [OverlayPack.SKETCH]: {
    font: '"Patrick Hand", cursive',
    color: '#4BA3C3',
    bgColor: '#F5F0E6',
    textShadow: '1px 0 0 #2C2C2C, -1px 0 0 #2C2C2C, 0 1px 0 #2C2C2C, 0 -1px 0 #2C2C2C',
  },
  [OverlayPack.CYBER]: {
    font: '"VT323", monospace',
    color: '#54efea',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.GLASS]: {
    font: '"Inter", sans-serif',
    color: 'rgba(255,255,255,0.9)',
    bgColor: 'rgba(255,255,255,0.1)',
    textShadow: '0 1px 2px rgba(0,0,0,0.3), 0 -1px 1px rgba(255,255,255,0.2)',
  },
  [OverlayPack.CHUNKY]: {
    font: '"Erica One", cursive',
    color: '#EF4444',
    bgColor: '#FEF08A',
    textShadow: '2px 2px 0 #000',
  },
  [OverlayPack.CHILL]: {
    font: '"Archivo Black", sans-serif',
    color: '#F5EED6',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.CHICLE]: {
    font: '"Chicle", cursive',
    color: '#FDE047',
    bgColor: '#1a1a1a',
    textShadow: '2px 0 0 #166534, -2px 0 0 #166534, 0 2px 0 #166534, 0 -2px 0 #166534',
  },
  [OverlayPack.SLACKEY]: {
    font: '"Slackey", cursive',
    color: '#8cc850',
    bgColor: '#333',
    textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
  },
  [OverlayPack.ABRIL_FATFACE]: {
    font: '"Abril Fatface", serif',
    color: '#FBB728',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
  },
  [OverlayPack.LOBSTER]: {
    font: '"Lobster", cursive',
    color: '#efce7b',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
  },
  [OverlayPack.ROCK3D]: {
    font: '"Rock 3D", cursive',
    color: '#FFFFFF',
    bgColor: '#333',
    textShadow: '2px 2px 0 #333, 4px 4px 0 #222',
  },
  [OverlayPack.MARKER]: {
    font: '"Permanent Marker", cursive',
    color: '#FFFFFF',
    bgColor: '#333',
    textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
  },
  [OverlayPack.GLITCH]: {
    font: '"Rubik Glitch", system-ui',
    color: '#ffffffff',
    bgColor: '#0a0a0a',
    textShadow: '-2px 0 #FF0000, 2px 0 #00FF00',
  },
  [OverlayPack.OUTLINE]: {
    font: '"Londrina Outline", cursive',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.BURNED]: {
    font: '"Rubik Burned", system-ui',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.BUNGEE]: {
    font: '"Bungee Outline", system-ui',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.JERSEY]: {
    font: '"Jersey 10 Charted", system-ui',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.KABLAMMO]: {
    font: '"Kablammo", system-ui',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.RIGHTEOUS]: {
    font: '"Righteous", cursive',
    color: '#C4B5FD',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.POPPINS]: {
    font: '"Poppins", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.RUBIK_DOODLE]: {
    font: '"Rubik Doodle Shadow", system-ui',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.FASCINATE]: {
    font: '"Fascinate Inline", cursive',
    color: '#FFD700',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 rgba(0,0,0,0.6)',
  },
  [OverlayPack.VINA_SANS]: {
    font: '"Vina Sans", cursive',
    color: '#FF6B6B',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
  },
  [OverlayPack.QAHIRI]: {
    font: '"Qahiri", sans-serif',
    color: '#4ECDC4',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.BARRIO]: {
    font: '"Barrio", cursive',
    color: '#FF9F1C',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
  },
  [OverlayPack.DOKDO]: {
    font: '"Dokdo", cursive',
    color: '#E8E8E8',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
  },
  [OverlayPack.RUBIK_MAZE]: {
    font: '"Rubik Maze", system-ui',
    color: '#ffffffff',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.RUBIK_MAPS]: {
    font: '"Rubik Maps", system-ui',
    color: '#22C55E',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.MIXO]: {
    font: '"Mixo", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 rgba(0,0,0,0.6)',
  },
  [OverlayPack.CHAUMONT]: {
    font: '"Chaumont", sans-serif',
    color: '#F472B6',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
  },
  [OverlayPack.BACKOUT]: {
    font: '"Backout", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 rgba(0,0,0,0.6)',
  },
  [OverlayPack.GULAX]: {
    font: '"Gulax", sans-serif',
    color: '#34D399',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
  },
  [OverlayPack.LITTLE_HOPE]: {
    font: '"Little Hope", cursive',
    color: '#F08C21',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
  },
  [OverlayPack.JUMPS_WINTER]: {
    font: '"Jumps Winter", cursive',
    color: '#00FBEA',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
  },
  [OverlayPack.CHOCO_BLACK]: {
    font: '"ChocoBlackG", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
  },
  [OverlayPack.STRANGE_MARKS]: {
    font: '"Strange Marks", cursive',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '0 0 8px rgba(255,255,255,0.8), 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
  },
  [OverlayPack.PLAYFUL_BOXES]: {
    font: '"Playful Boxes", sans-serif',
    color: '#FFD93D',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
  },
  [OverlayPack.POSTBOOK]: {
    font: '"Postbook", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
  },
  [OverlayPack.SUGGESTED]: {
    font: '"Suggested", sans-serif',
    color: '#FF6B6B',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000',
  },
  [OverlayPack.AMATIC]: {
    font: '"Amatic SC", cursive',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  [OverlayPack.BLOX2]: {
    font: '"Blox2", sans-serif',
    color: '#00FF00',
    bgColor: '#0a0a0a',
    textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
  },
  [OverlayPack.WEDGIE]: {
    font: '"Wedgie", cursive',
    color: '#FF6B35',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  [OverlayPack.CWISDOM]: {
    font: '"Cwisdom", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
  },
  [OverlayPack.FACON]: {
    font: '"Facon", sans-serif',
    color: '#FFD700',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 rgba(0,0,0,0.6)',
  },
  [OverlayPack.SEFA]: {
    font: '"Sefa", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
  },
  [OverlayPack.ONICK]: {
    font: '"Onick", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
  },
  [OverlayPack.HELPME]: {
    font: '"HelpMe", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
  },
  [OverlayPack.GRIDLOCK]: {
    font: '"Gridlock", sans-serif',
    color: '#C0C0C0',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
  },
  [OverlayPack.MONTSERRAT_ITALIC]: {
    font: '"Montserrat Italic", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
  },
  [OverlayPack.ACHTUNG_BRAVO]: {
    font: '"AchtungBravo", sans-serif',
    color: '#FF4136',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000',
  },
  [OverlayPack.BOCALUPO]: {
    font: '"Bocalupo", cursive',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000',
  },
  [OverlayPack.CAFE24_MOYAMOYA]: {
    font: '"Cafe24Moyamoya", cursive',
    color: '#Bee0f2',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000',
  },
  [OverlayPack.KUBO]: {
    font: '"KUBO", sans-serif',
    color: '#8f35ec',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000',
  },
  [OverlayPack.SPEED_FREAK]: {
    font: '"SpeedFreak", sans-serif',
    color: '#CCFF00',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000',
  },
  [OverlayPack.BEZMIAR]: {
    font: '"Bezmiar", serif',
    color: '#E8D5B7',
    bgColor: '#2a2520',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
  },
  [OverlayPack.BLOCKY]: {
    font: '"Wendy One", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: '3px 3px 0 #000',
  },
  [OverlayPack.FUNKWEST]: {
    font: '"Funkwest", cursive',
    color: '#DAA520',
    bgColor: '#2d1f0f',
    textShadow: '2px 2px 0 #5C4033',
  },
  [OverlayPack.GRITH]: {
    font: '"Monoton", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a2530',
    textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
  },
  [OverlayPack.LT_RAILWAY]: {
    font: '"LTRailway", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1C2951',
    textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
  },
  [OverlayPack.CDT_BIVAQUE]: {
    font: '"CDTBivaque", sans-serif',
    color: '#648c82',
    bgColor: '#2a2318',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
  },
  [OverlayPack.CHICOREE]: {
    font: '"Chicoree", cursive',
    color: '#df8fff',
    bgColor: '#1a1025',
    textShadow: '2px 2px 0 #2C1A4A',
  },
  [OverlayPack.PIXEL_AWAY]: {
    font: '"PixelAway", monospace',
    color: '#fb8007',
    bgColor: '#0a0f0a',
    textShadow: '1px 1px 0 #003300',
  },
  [OverlayPack.HYRAX]: {
    font: '"Hyrax", sans-serif',
    color: '#FFFFFF',
    bgColor: '#251810',
    textShadow: '1px 1px 0 #7A3F1A',
  },
  [OverlayPack.MIDNIGHT_LETTERS]: {
    font: '"MidnightLetters", serif',
    color: '#ccffbc',
    bgColor: '#1A202C',
    textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
  },
  [OverlayPack.NOSE_TRANSPORT]: {
    font: '"NoseTransport", sans-serif',
    color: '#f2ff00',
    bgColor: '#2a2510',
    textShadow: '1px 1px 0 #B8860B',
  },
  [OverlayPack.ORBIX]: {
    font: '"Caesar Dressing", cursive',
    color: '#e1e1e1',
    bgColor: '#0a2020',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
  },
  [OverlayPack.QUADRIANA]: {
    font: '"Quadriana", sans-serif',
    color: '#3cd6e7',
    bgColor: '#1a0a08',
    textShadow: '2px 2px 0 #7B241C',
  },
  [OverlayPack.QUANTUM]: {
    font: '"Quantum", sans-serif',
    color: '#e1e1e1',
    bgColor: '#150a1a',
    textShadow: '1px 1px 0 #4A235A',
  },
  [OverlayPack.RUNTTI]: {
    font: '"Runtti", sans-serif',
    color: '#3498DB',
    bgColor: '#0a151f',
    textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
  },
  [OverlayPack.TACHYO]: {
    font: '"Tachyo", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1f1508',
    textShadow: '2px 2px 0 #7D5A0B',
  },
  [OverlayPack.XANMONO]: {
    font: '"Xanmono", monospace',
    color: '#1ABC9C',
    bgColor: '#0a1a18',
    textShadow: '1px 1px 0 #0E6655',
  },
  [OverlayPack.CAL_SANS]: {
    font: '"Cal Sans", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.KIRANG]: {
    font: '"Kirang Haerang", cursive',
    color: '#FF6B9D',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 #000',
  },
  [OverlayPack.BANGERS]: {
    font: '"Bangers", cursive',
    color: '#FFE135',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000',
  },
  [OverlayPack.JOLLY_LODGER]: {
    font: '"Jolly Lodger", cursive',
    color: '#7FDBFF',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 #000',
  },
  [OverlayPack.FRECKLE_FACE]: {
    font: '"Freckle Face", cursive',
    color: '#2ECC40',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 #000',
  },
  [OverlayPack.CHEWY]: {
    font: '"Chewy", cursive',
    color: '#FF9FF3',
    bgColor: '#1a1a1a',
    textShadow: '1px 1px 0 #000',
  },
  [OverlayPack.LUCKIEST_GUY]: {
    font: '"Luckiest Guy", cursive',
    color: '#00D2D3',
    bgColor: '#1a1a1a',
    textShadow: '2px 2px 0 #000',
  },
  // Clean Modern packs (no outlines, clean look)
  [OverlayPack.COMFORTAA]: {
    font: '"Comfortaa", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.ATKINSON]: {
    font: '"Atkinson Hyperlegible Mono", monospace',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.FINLANDICA]: {
    font: '"Finlandica", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.ALLERTA]: {
    font: '"Allerta", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
  [OverlayPack.KDAM]: {
    font: '"Kdam Thmor Pro", sans-serif',
    color: '#FFFFFF',
    bgColor: '#1a1a1a',
    textShadow: 'none',
  },
};

export const OverlayGallery: React.FC<OverlayGalleryProps> = ({ activity, onBack }) => {
  const [previewOverlay, setPreviewOverlay] = useState<{ pack: OverlayPack; variant: OverlayVariant } | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSelectOverlay = (pack: OverlayPack, variant: OverlayVariant) => {
    setPreviewOverlay({ pack, variant });
  };

  const handleClosePreview = () => {
    setPreviewOverlay(null);
  };

  return (
    <div className="h-screen w-full flex flex-col font-sans text-white overflow-hidden relative">
      {/* Full-screen checkerboard background - extends behind everything */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #1f1f1f 25%, transparent 25%), 
            linear-gradient(-45deg, #1f1f1f 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #1f1f1f 75%), 
            linear-gradient(-45deg, transparent 75%, #1f1f1f 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          backgroundColor: '#141414',
        }}
      />
      
      {/* Content on top of checkerboard */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header - transparent to show checkerboard */}
        <div className="px-4 pt-14 pb-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black tracking-tight truncate">{activity.title}</h1>
              <p className="text-xs text-zinc-500">{activity.distance} • {activity.time}</p>
            </div>
            {/* Photo upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={backgroundImage ? handleRemovePhoto : handlePhotoButtonClick}
              disabled={isLoadingImage}
              className={`w-10 h-10 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all ${
                isLoadingImage
                  ? 'bg-black/40 border-white/10 text-zinc-400 cursor-wait'
                  : backgroundImage 
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' 
                    : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
              }`}
              title={isLoadingImage ? 'Loading...' : backgroundImage ? 'Remove photo' : 'Add photo'}
            >
              {isLoadingImage ? (
                <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
              ) : backgroundImage ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Section title */}
        <div className="px-4 pt-1 pb-3">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Choose a Style</h2>
          <p className="text-[10px] text-zinc-600 mt-0.5">Swipe to browse overlays • Scroll down for more packs</p>
        </div>

        {/* Vertical scrolling list of pack carousels */}
        <div className="flex-1 overflow-y-auto pb-6 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
          {ACTIVE_PACKS.map((pack) => (
            <PackCarousel
              key={pack}
              pack={pack}
              activity={activity}
              backgroundImage={backgroundImage}
              imageAspectRatio={imageAspectRatio}
              onSelectOverlay={handleSelectOverlay}
            />
          ))}
        </div>
      </div>

      {/* Full-screen Preview/Editor Modal */}
      {previewOverlay && (
        <OverlayPreview
          activity={activity}
          pack={previewOverlay.pack}
          variant={previewOverlay.variant}
          backgroundImage={backgroundImage}
          imageAspectRatio={imageAspectRatio}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
};

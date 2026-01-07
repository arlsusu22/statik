
// Strava athlete profile data
export interface StravaAthlete {
  id: number;
  firstname?: string;
  lastname?: string;
  profile_medium?: string; // 62x62 pixel profile picture URL
  profile?: string; // 124x124 pixel profile picture URL
  city?: string;
  state?: string;
  country?: string;
}

// Split data for pace charts
export interface SplitData {
  split: number; // Split number (1, 2, 3...)
  distance: number; // Distance in meters
  elapsed_time: number; // Time in seconds
  moving_time: number; // Moving time in seconds
  average_speed: number; // m/s
  elevation_difference: number; // meters
  pace_zone: number; // 0-4 zone
}

// Chart data available for an activity
export interface ActivityChartData {
  splits?: SplitData[]; // Km/mile splits (pace chart)
  hasHeartRate?: boolean; // If HR data available
  hasElevation?: boolean; // If elevation data available  
  hasPower?: boolean; // If power data available (cycling)
  // Elevation data for elevation chart
  elevationGain?: number; // Total elevation gain in meters
  elevLow?: number; // Lowest elevation point in meters
  elevHigh?: number; // Highest elevation point in meters
  averageSpeed?: number; // Average speed in m/s
}

// Chart types that can be displayed
export type ChartType = 'pace' | 'elevation' | 'heartrate';

// Chart orientation
export type ChartOrientation = 'vertical' | 'horizontal';

// Chart bar effect styles
export type ChartBarEffect = 'solid' | 'gradient-multi' | 'gradient-shine';

// Chart settings for customization
export interface ChartSettings {
  barColor?: string; // Custom bar color
  textColor?: string; // Custom text color
  orientation?: ChartOrientation; // Vertical or horizontal bars
  barEffect?: ChartBarEffect; // Effect applied to bars
  showLabels?: boolean; // Show pace labels above bars
  showTitle?: boolean; // Show "Splits" title
}

export interface ActivityStats {
  id?: string;
  title: string;
  distance: string;
  time: string;
  elevation: string;
  pace?: string;
  calories?: string;
  heartRate?: string;
  maxHeartRate?: string;
  type?: 'run' | 'bike' | 'hike' | 'swim' | 'workout';
  date?: string; // e.g., "Today, 6:42 AM"
  mapUrl?: string; // Placeholder for map thumbnail
  polyline?: string; // Encoded polyline for route overlay
  chartData?: ActivityChartData; // Chart visualization data
}

export interface VisibleStats {
  title: boolean;
  distance: boolean;
  time: boolean;
  elevation: boolean;
  pace: boolean;
  calories: boolean;
  heartRate: boolean;
  date: boolean;
}

export interface SeparatedStats {
  distance: boolean;
  time: boolean;
  elevation: boolean;
  pace: boolean;
  calories: boolean;
  heartRate: boolean;
  date: boolean;
}

export type OutlineStyle = 'solid' | 'glow' | 'double';

// Visual effects that can be applied to any element
export type ElementEffectType = 'none' | 'glitch' | 'shiny' | 'retro';

export interface ElementEffect {
  type: ElementEffectType;
  intensity: number; // 0-100 - how strong the effect is
}

// Sticker outline styles that can be applied to elements
export type StickerStyle = 'none' | 'outline';

export interface StickerOutline {
  enabled: boolean; // Whether outline is on
  thickness: number; // 1-10 - outline thickness
  color: string; // Outline color
}

export interface ElementPosition {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  width?: number; // Represents maxWidth percentage (1-100)
  outline?: boolean;
  outlineWidth?: number; // 1-5 (thin to thick)
  outlineStyle?: OutlineStyle; // solid, glow, double
  // Element-specific styling
  color?: string;
  font?: string;
  fontWeight?: string;
  textShadow?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  // Visual effects
  effect?: ElementEffect;
}

export interface BackgroundConfig {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  transparent?: boolean;
}

export type RouteStyle = 'smooth' | 'sharp' | 'paint' | 'dashed' | 'dotted' | 'animated' | '3d' | 'neon' | 'gradient' | 'pulse' | 'trail' | 'striped';

export type TextStyle = 'default' | 'magazine' | 'cartoon' | 'sci-fi';

export type ImageFilter = 'none' | 'noise' | 'bw' | 'vivid' | 'vibrant';

export interface ImageAdjustments {
  noise: number;      // 0-100, grain/noise overlay intensity
  saturation: number; // -100 to 100, color saturation adjustment
  contrast: number;   // -100 to 100, contrast adjustment
  brightness: number; // -100 to 100, brightness adjustment
  warmth: number;     // -100 to 100, color temperature (warm/cool)
}

export interface RouteConfig {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  strokeWidth: number;
  color: string;
  style: RouteStyle;
  outline?: boolean;
  outlineWidth?: number;  // 1-5
  outlineColor?: string;
}

// =============================================================================
// PACK SYSTEM - Replaces old Theme/Vibe system
// Each Pack is a cohesive visual identity with the same 6 layout options
// =============================================================================

// The Pack identifier
export enum OverlayPack {
  PAINT = 'PAINT',
  DOODLE = 'DOODLE',
  RETRO = 'RETRO',
  GROOVY = 'GROOVY',
  ABRIL_FATFACE = 'ABRIL_FATFACE',
  LOBSTER = 'LOBSTER',
  CARTOON = 'CARTOON',
  SKETCH = 'SKETCH',
  CYBER = 'CYBER',
  GLASS = 'GLASS',
  CHUNKY = 'CHUNKY',
  CHILL = 'CHILL',
  CHICLE = 'CHICLE',
  SLACKEY = 'SLACKEY',
  ROCK3D = 'ROCK3D',
  MARKER = 'MARKER',
  GLITCH = 'GLITCH',
  OUTLINE = 'OUTLINE',
  BURNED = 'BURNED',
  BUNGEE = 'BUNGEE',
  JERSEY = 'JERSEY',
  KABLAMMO = 'KABLAMMO',
  RIGHTEOUS = 'RIGHTEOUS',
  POPPINS = 'POPPINS',
  RUBIK_DOODLE = 'RUBIK_DOODLE',
  FASCINATE = 'FASCINATE',
  VINA_SANS = 'VINA_SANS',
  QAHIRI = 'QAHIRI',
  BARRIO = 'BARRIO',
  DOKDO = 'DOKDO',
  RUBIK_MAZE = 'RUBIK_MAZE',
  RUBIK_MAPS = 'RUBIK_MAPS',
  MIXO = 'MIXO',
  CHAUMONT = 'CHAUMONT',
  BACKOUT = 'BACKOUT',
  GULAX = 'GULAX',
  LITTLE_HOPE = 'LITTLE_HOPE',
  JUMPS_WINTER = 'JUMPS_WINTER',
  CHOCO_BLACK = 'CHOCO_BLACK',
  PLAYFUL_BOXES = 'PLAYFUL_BOXES',
  POSTBOOK = 'POSTBOOK',
  SUGGESTED = 'SUGGESTED',
  AMATIC = 'AMATIC',
  BLOX2 = 'BLOX2',
  WEDGIE = 'WEDGIE',
  CWISDOM = 'CWISDOM',
  FACON = 'FACON',
  SEFA = 'SEFA',
  ONICK = 'ONICK',
  HELPME = 'HELPME',
  GRIDLOCK = 'GRIDLOCK',
  // New OFL fonts
  ACHTUNG_BRAVO = 'ACHTUNG_BRAVO',
  BOCALUPO = 'BOCALUPO',
  CAFE24_MOYAMOYA = 'CAFE24_MOYAMOYA',
  KUBO = 'KUBO',
  SPEED_FREAK = 'SPEED_FREAK',
  BEZMIAR = 'BEZMIAR',
  BLOCKY = 'BLOCKY',
  FUNKWEST = 'FUNKWEST',
  GRITH = 'GRITH',
  LT_RAILWAY = 'LT_RAILWAY',
  CDT_BIVAQUE = 'CDT_BIVAQUE',
  CHICOREE = 'CHICOREE',
  PIXEL_AWAY = 'PIXEL_AWAY',
  HYRAX = 'HYRAX',
  MIDNIGHT_LETTERS = 'MIDNIGHT_LETTERS',
  NOSE_TRANSPORT = 'NOSE_TRANSPORT',
  ORBIX = 'ORBIX',
  QUADRIANA = 'QUADRIANA',
  QUANTUM = 'QUANTUM',
  RUNTTI = 'RUNTTI',
  TACHYO = 'TACHYO',
  XANMONO = 'XANMONO',
  CAL_SANS = 'CAL_SANS',
  // Playful Google Fonts packs
  KIRANG = 'KIRANG',
  BANGERS = 'BANGERS',
  JOLLY_LODGER = 'JOLLY_LODGER',
  FRECKLE_FACE = 'FRECKLE_FACE',
  CHEWY = 'CHEWY',
  LUCKIEST_GUY = 'LUCKIEST_GUY',
  // Clean modern packs (no outline, just pop)
  COMFORTAA = 'COMFORTAA',
  ATKINSON = 'ATKINSON',
  FINLANDICA = 'FINLANDICA',
  ALLERTA = 'ALLERTA',
  KDAM = 'KDAM',
  // Inactive packs (kept for type safety)
  STRANGE_MARKS = 'STRANGE_MARKS',
  MONTSERRAT_ITALIC = 'MONTSERRAT_ITALIC',
  // Future packs:
  // NEON = 'NEON',
  // MINIMAL = 'MINIMAL',
}

// Universal layout types - same across all packs
// Each pack styles these layouts according to its aesthetic
export type LayoutType = 
  | 'CLASSIC'    // Large distance on top of other stats, centered
  | 'COLUMN'     // Stats showing one after another vertically
  | 'GRID'       // 3 stats on top of another 3
  | 'WAVY'       // Stats showing in a wave pattern (repeats for length)
  | 'CIRCULAR'   // Stats going in a circle (repeats to close circle)
  | 'SCATTER';   // Each stat is individually draggable

// Full layout identifier combines pack + layout type
export type OverlayLayout = 
  // PAINT Pack layouts
  | 'PAINT_CLASSIC'
  | 'PAINT_COLUMN'
  | 'PAINT_GRID'
  | 'PAINT_WAVY'
  | 'PAINT_CIRCULAR'
  | 'PAINT_SCATTER'
  // DOODLE Pack layouts
  | 'DOODLE_CLASSIC'
  | 'DOODLE_COLUMN'
  | 'DOODLE_GRID'
  | 'DOODLE_WAVY'
  | 'DOODLE_CIRCULAR'
  | 'DOODLE_SCATTER'
  // RETRO Pack layouts
  | 'RETRO_CLASSIC'
  | 'RETRO_COLUMN'
  | 'RETRO_GRID'
  | 'RETRO_WAVY'
  | 'RETRO_CIRCULAR'
  | 'RETRO_SCATTER'
  // GROOVY Pack layouts
  | 'GROOVY_CLASSIC'
  | 'GROOVY_COLUMN'
  | 'GROOVY_GRID'
  | 'GROOVY_WAVY'
  | 'GROOVY_CIRCULAR'
  | 'GROOVY_SCATTER'
  // CARTOON Pack layouts
  | 'CARTOON_CLASSIC'
  | 'CARTOON_COLUMN'
  | 'CARTOON_GRID'
  | 'CARTOON_WAVY'
  | 'CARTOON_CIRCULAR'
  | 'CARTOON_SCATTER'
  // SKETCH Pack layouts
  | 'SKETCH_CLASSIC'
  | 'SKETCH_COLUMN'
  | 'SKETCH_GRID'
  | 'SKETCH_WAVY'
  | 'SKETCH_CIRCULAR'
  | 'SKETCH_SCATTER'
  // CYBER Pack layouts
  | 'CYBER_CLASSIC'
  | 'CYBER_COLUMN'
  | 'CYBER_GRID'
  | 'CYBER_WAVY'
  | 'CYBER_CIRCULAR'
  | 'CYBER_SCATTER'
  // GLITCH Pack layouts
  | 'GLITCH_CLASSIC'
  | 'GLITCH_COLUMN'
  | 'GLITCH_GRID'
  | 'GLITCH_WAVY'
  | 'GLITCH_CIRCULAR'
  | 'GLITCH_SCATTER'
  // GLASS Pack layouts
  | 'GLASS_CLASSIC'
  | 'GLASS_COLUMN'
  | 'GLASS_GRID'
  | 'GLASS_WAVY'
  | 'GLASS_CIRCULAR'
  | 'GLASS_SCATTER'
  // CHUNKY Pack layouts
  | 'CHUNKY_CLASSIC'
  | 'CHUNKY_COLUMN'
  | 'CHUNKY_GRID'
  | 'CHUNKY_WAVY'
  | 'CHUNKY_CIRCULAR'
  | 'CHUNKY_SCATTER'
  // CHILL Pack layouts
  | 'CHILL_CLASSIC'
  | 'CHILL_COLUMN'
  | 'CHILL_GRID'
  | 'CHILL_WAVY'
  | 'CHILL_CIRCULAR'
  | 'CHILL_SCATTER'
  // CHICLE Pack layouts
  | 'CHICLE_CLASSIC'
  | 'CHICLE_COLUMN'
  | 'CHICLE_GRID'
  | 'CHICLE_WAVY'
  | 'CHICLE_CIRCULAR'
  | 'CHICLE_SCATTER'
  // SLACKEY Pack layouts
  | 'SLACKEY_CLASSIC'
  | 'SLACKEY_COLUMN'
  | 'SLACKEY_GRID'
  | 'SLACKEY_WAVY'
  | 'SLACKEY_CIRCULAR'
  | 'SLACKEY_SCATTER'
  // ABRIL_FATFACE Pack layouts
  | 'ABRIL_FATFACE_CLASSIC'
  | 'ABRIL_FATFACE_COLUMN'
  | 'ABRIL_FATFACE_GRID'
  | 'ABRIL_FATFACE_WAVY'
  | 'ABRIL_FATFACE_CIRCULAR'
  | 'ABRIL_FATFACE_SCATTER'
  // LOBSTER Pack layouts
  | 'LOBSTER_CLASSIC'
  | 'LOBSTER_COLUMN'
  | 'LOBSTER_GRID'
  | 'LOBSTER_WAVY'
  | 'LOBSTER_CIRCULAR'
  | 'LOBSTER_SCATTER'
  // OUTLINE Pack layouts
  | 'OUTLINE_CLASSIC'
  | 'OUTLINE_COLUMN'
  | 'OUTLINE_GRID'
  | 'OUTLINE_WAVY'
  | 'OUTLINE_CIRCULAR'
  | 'OUTLINE_SCATTER'
  // ROCK3D Pack layouts
  | 'ROCK3D_CLASSIC'
  | 'ROCK3D_COLUMN'
  | 'ROCK3D_GRID'
  | 'ROCK3D_WAVY'
  | 'ROCK3D_CIRCULAR'
  | 'ROCK3D_SCATTER'
  // MARKER Pack layouts
  | 'MARKER_CLASSIC'
  | 'MARKER_COLUMN'
  | 'MARKER_GRID'
  | 'MARKER_WAVY'
  | 'MARKER_CIRCULAR'
  | 'MARKER_SCATTER'
  // BURNED Pack layouts
  | 'BURNED_CLASSIC'
  | 'BURNED_COLUMN'
  | 'BURNED_GRID'
  | 'BURNED_WAVY'
  | 'BURNED_CIRCULAR'
  | 'BURNED_SCATTER'
  // BUNGEE Pack layouts
  | 'BUNGEE_CLASSIC'
  | 'BUNGEE_COLUMN'
  | 'BUNGEE_GRID'
  | 'BUNGEE_WAVY'
  | 'BUNGEE_CIRCULAR'
  | 'BUNGEE_SCATTER'
  // JERSEY Pack layouts
  | 'JERSEY_CLASSIC'
  | 'JERSEY_COLUMN'
  | 'JERSEY_GRID'
  | 'JERSEY_WAVY'
  | 'JERSEY_CIRCULAR'
  | 'JERSEY_SCATTER'
  // KABLAMMO Pack layouts
  | 'KABLAMMO_CLASSIC'
  | 'KABLAMMO_COLUMN'
  | 'KABLAMMO_GRID'
  | 'KABLAMMO_WAVY'
  | 'KABLAMMO_CIRCULAR'
  | 'KABLAMMO_SCATTER'
  // RIGHTEOUS Pack layouts
  | 'RIGHTEOUS_CLASSIC'
  | 'RIGHTEOUS_COLUMN'
  | 'RIGHTEOUS_GRID'
  | 'RIGHTEOUS_WAVY'
  | 'RIGHTEOUS_CIRCULAR'
  | 'RIGHTEOUS_SCATTER'
  // POPPINS Pack layouts
  | 'POPPINS_CLASSIC'
  | 'POPPINS_COLUMN'
  | 'POPPINS_GRID'
  | 'POPPINS_WAVY'
  | 'POPPINS_CIRCULAR'
  | 'POPPINS_SCATTER'
  // RUBIK_DOODLE Pack layouts
  | 'RUBIK_DOODLE_CLASSIC'
  | 'RUBIK_DOODLE_COLUMN'
  | 'RUBIK_DOODLE_GRID'
  | 'RUBIK_DOODLE_WAVY'
  | 'RUBIK_DOODLE_CIRCULAR'
  | 'RUBIK_DOODLE_SCATTER'
  // FASCINATE Pack layouts
  | 'FASCINATE_CLASSIC'
  | 'FASCINATE_COLUMN'
  | 'FASCINATE_GRID'
  | 'FASCINATE_WAVY'
  | 'FASCINATE_CIRCULAR'
  | 'FASCINATE_SCATTER'
  // VINA_SANS Pack layouts
  | 'VINA_SANS_CLASSIC'
  | 'VINA_SANS_COLUMN'
  | 'VINA_SANS_GRID'
  | 'VINA_SANS_WAVY'
  | 'VINA_SANS_CIRCULAR'
  | 'VINA_SANS_SCATTER'
  // QAHIRI Pack layouts
  | 'QAHIRI_CLASSIC'
  | 'QAHIRI_COLUMN'
  | 'QAHIRI_GRID'
  | 'QAHIRI_WAVY'
  | 'QAHIRI_CIRCULAR'
  | 'QAHIRI_SCATTER'
  // BARRIO Pack layouts
  | 'BARRIO_CLASSIC'
  | 'BARRIO_COLUMN'
  | 'BARRIO_GRID'
  | 'BARRIO_WAVY'
  | 'BARRIO_CIRCULAR'
  | 'BARRIO_SCATTER'
  // DOKDO Pack layouts
  | 'DOKDO_CLASSIC'
  | 'DOKDO_COLUMN'
  | 'DOKDO_GRID'
  | 'DOKDO_WAVY'
  | 'DOKDO_CIRCULAR'
  | 'DOKDO_SCATTER'
  // RUBIK_MAZE Pack layouts
  | 'RUBIK_MAZE_CLASSIC'
  | 'RUBIK_MAZE_COLUMN'
  | 'RUBIK_MAZE_GRID'
  | 'RUBIK_MAZE_WAVY'
  | 'RUBIK_MAZE_CIRCULAR'
  | 'RUBIK_MAZE_SCATTER'
  // RUBIK_MAPS Pack layouts
  | 'RUBIK_MAPS_CLASSIC'
  | 'RUBIK_MAPS_COLUMN'
  | 'RUBIK_MAPS_GRID'
  | 'RUBIK_MAPS_WAVY'
  | 'RUBIK_MAPS_CIRCULAR'
  | 'RUBIK_MAPS_SCATTER'
  // MIXO Pack layouts
  | 'MIXO_CLASSIC'
  | 'MIXO_COLUMN'
  | 'MIXO_GRID'
  | 'MIXO_WAVY'
  | 'MIXO_CIRCULAR'
  | 'MIXO_SCATTER'
  // CHAUMONT Pack layouts
  | 'CHAUMONT_CLASSIC'
  | 'CHAUMONT_COLUMN'
  | 'CHAUMONT_GRID'
  | 'CHAUMONT_WAVY'
  | 'CHAUMONT_CIRCULAR'
  | 'CHAUMONT_SCATTER'
  // BACKOUT Pack layouts
  | 'BACKOUT_CLASSIC'
  | 'BACKOUT_COLUMN'
  | 'BACKOUT_GRID'
  | 'BACKOUT_WAVY'
  | 'BACKOUT_CIRCULAR'
  | 'BACKOUT_SCATTER'
  // GULAX Pack layouts
  | 'GULAX_CLASSIC'
  | 'GULAX_COLUMN'
  | 'GULAX_GRID'
  | 'GULAX_WAVY'
  | 'GULAX_CIRCULAR'
  | 'GULAX_SCATTER'
  // LITTLE_HOPE Pack layouts
  | 'LITTLE_HOPE_CLASSIC'
  | 'LITTLE_HOPE_COLUMN'
  | 'LITTLE_HOPE_GRID'
  | 'LITTLE_HOPE_WAVY'
  | 'LITTLE_HOPE_CIRCULAR'
  | 'LITTLE_HOPE_SCATTER'
  // JUMPS_WINTER Pack layouts
  | 'JUMPS_WINTER_CLASSIC'
  | 'JUMPS_WINTER_COLUMN'
  | 'JUMPS_WINTER_GRID'
  | 'JUMPS_WINTER_WAVY'
  | 'JUMPS_WINTER_CIRCULAR'
  | 'JUMPS_WINTER_SCATTER'
  // CHOCO_BLACK Pack layouts
  | 'CHOCO_BLACK_CLASSIC'
  | 'CHOCO_BLACK_COLUMN'
  | 'CHOCO_BLACK_GRID'
  | 'CHOCO_BLACK_WAVY'
  | 'CHOCO_BLACK_CIRCULAR'
  | 'CHOCO_BLACK_SCATTER'
  // STRANGE_MARKS Pack layouts (inactive)
  | 'STRANGE_MARKS_CLASSIC'
  | 'STRANGE_MARKS_COLUMN'
  | 'STRANGE_MARKS_GRID'
  | 'STRANGE_MARKS_WAVY'
  | 'STRANGE_MARKS_CIRCULAR'
  | 'STRANGE_MARKS_SCATTER'
  // PLAYFUL_BOXES Pack layouts
  | 'PLAYFUL_BOXES_CLASSIC'
  | 'PLAYFUL_BOXES_COLUMN'
  | 'PLAYFUL_BOXES_GRID'
  | 'PLAYFUL_BOXES_WAVY'
  | 'PLAYFUL_BOXES_CIRCULAR'
  | 'PLAYFUL_BOXES_SCATTER'
  // POSTBOOK Pack layouts
  | 'POSTBOOK_CLASSIC'
  | 'POSTBOOK_COLUMN'
  | 'POSTBOOK_GRID'
  | 'POSTBOOK_WAVY'
  | 'POSTBOOK_CIRCULAR'
  | 'POSTBOOK_SCATTER'
  // SUGGESTED Pack layouts
  | 'SUGGESTED_CLASSIC'
  | 'SUGGESTED_COLUMN'
  | 'SUGGESTED_GRID'
  | 'SUGGESTED_WAVY'
  | 'SUGGESTED_CIRCULAR'
  | 'SUGGESTED_SCATTER'
  // AMATIC Pack layouts
  | 'AMATIC_CLASSIC'
  | 'AMATIC_COLUMN'
  | 'AMATIC_GRID'
  | 'AMATIC_WAVY'
  | 'AMATIC_CIRCULAR'
  | 'AMATIC_SCATTER'
  // BLOX2 Pack layouts
  | 'BLOX2_CLASSIC'
  | 'BLOX2_COLUMN'
  | 'BLOX2_GRID'
  | 'BLOX2_WAVY'
  | 'BLOX2_CIRCULAR'
  | 'BLOX2_SCATTER'
  // WEDGIE Pack layouts
  | 'WEDGIE_CLASSIC'
  | 'WEDGIE_COLUMN'
  | 'WEDGIE_GRID'
  | 'WEDGIE_WAVY'
  | 'WEDGIE_CIRCULAR'
  | 'WEDGIE_SCATTER'
  // CWISDOM Pack layouts
  | 'CWISDOM_CLASSIC'
  | 'CWISDOM_COLUMN'
  | 'CWISDOM_GRID'
  | 'CWISDOM_WAVY'
  | 'CWISDOM_CIRCULAR'
  | 'CWISDOM_SCATTER'
  // FACON Pack layouts
  | 'FACON_CLASSIC'
  | 'FACON_COLUMN'
  | 'FACON_GRID'
  | 'FACON_WAVY'
  | 'FACON_CIRCULAR'
  | 'FACON_SCATTER'
  // SEFA Pack layouts
  | 'SEFA_CLASSIC'
  | 'SEFA_COLUMN'
  | 'SEFA_GRID'
  | 'SEFA_WAVY'
  | 'SEFA_CIRCULAR'
  | 'SEFA_SCATTER'
  // ONICK Pack layouts
  | 'ONICK_CLASSIC'
  | 'ONICK_COLUMN'
  | 'ONICK_GRID'
  | 'ONICK_WAVY'
  | 'ONICK_CIRCULAR'
  | 'ONICK_SCATTER'
  // HELPME Pack layouts
  | 'HELPME_CLASSIC'
  | 'HELPME_COLUMN'
  | 'HELPME_GRID'
  | 'HELPME_WAVY'
  | 'HELPME_CIRCULAR'
  | 'HELPME_SCATTER'
  // GRIDLOCK Pack layouts
  | 'GRIDLOCK_CLASSIC'
  | 'GRIDLOCK_COLUMN'
  | 'GRIDLOCK_GRID'
  | 'GRIDLOCK_WAVY'
  | 'GRIDLOCK_CIRCULAR'
  | 'GRIDLOCK_SCATTER'
  // ACHTUNG_BRAVO Pack layouts
  | 'ACHTUNG_BRAVO_CLASSIC'
  | 'ACHTUNG_BRAVO_COLUMN'
  | 'ACHTUNG_BRAVO_GRID'
  | 'ACHTUNG_BRAVO_WAVY'
  | 'ACHTUNG_BRAVO_CIRCULAR'
  | 'ACHTUNG_BRAVO_SCATTER'
  // BOCALUPO Pack layouts
  | 'BOCALUPO_CLASSIC'
  | 'BOCALUPO_COLUMN'
  | 'BOCALUPO_GRID'
  | 'BOCALUPO_WAVY'
  | 'BOCALUPO_CIRCULAR'
  | 'BOCALUPO_SCATTER'
  // CAFE24_MOYAMOYA Pack layouts
  | 'CAFE24_MOYAMOYA_CLASSIC'
  | 'CAFE24_MOYAMOYA_COLUMN'
  | 'CAFE24_MOYAMOYA_GRID'
  | 'CAFE24_MOYAMOYA_WAVY'
  | 'CAFE24_MOYAMOYA_CIRCULAR'
  | 'CAFE24_MOYAMOYA_SCATTER'
  // KUBO Pack layouts
  | 'KUBO_CLASSIC'
  | 'KUBO_COLUMN'
  | 'KUBO_GRID'
  | 'KUBO_WAVY'
  | 'KUBO_CIRCULAR'
  | 'KUBO_SCATTER'
  // SPEED_FREAK Pack layouts
  | 'SPEED_FREAK_CLASSIC'
  | 'SPEED_FREAK_COLUMN'
  | 'SPEED_FREAK_GRID'
  | 'SPEED_FREAK_WAVY'
  | 'SPEED_FREAK_CIRCULAR'
  | 'SPEED_FREAK_SCATTER'
  // BEZMIAR Pack layouts
  | 'BEZMIAR_CLASSIC'
  | 'BEZMIAR_COLUMN'
  | 'BEZMIAR_GRID'
  | 'BEZMIAR_WAVY'
  | 'BEZMIAR_CIRCULAR'
  | 'BEZMIAR_SCATTER'
  // BLOCKY Pack layouts
  | 'BLOCKY_CLASSIC'
  | 'BLOCKY_COLUMN'
  | 'BLOCKY_GRID'
  | 'BLOCKY_WAVY'
  | 'BLOCKY_CIRCULAR'
  | 'BLOCKY_SCATTER'
  // FUNKWEST Pack layouts
  | 'FUNKWEST_CLASSIC'
  | 'FUNKWEST_COLUMN'
  | 'FUNKWEST_GRID'
  | 'FUNKWEST_WAVY'
  | 'FUNKWEST_CIRCULAR'
  | 'FUNKWEST_SCATTER'
  // GRITH Pack layouts
  | 'GRITH_CLASSIC'
  | 'GRITH_COLUMN'
  | 'GRITH_GRID'
  | 'GRITH_WAVY'
  | 'GRITH_CIRCULAR'
  | 'GRITH_SCATTER'
  // LT_RAILWAY Pack layouts
  | 'LT_RAILWAY_CLASSIC'
  | 'LT_RAILWAY_COLUMN'
  | 'LT_RAILWAY_GRID'
  | 'LT_RAILWAY_WAVY'
  | 'LT_RAILWAY_CIRCULAR'
  | 'LT_RAILWAY_SCATTER'
  // CDT_BIVAQUE Pack layouts
  | 'CDT_BIVAQUE_CLASSIC'
  | 'CDT_BIVAQUE_COLUMN'
  | 'CDT_BIVAQUE_GRID'
  | 'CDT_BIVAQUE_WAVY'
  | 'CDT_BIVAQUE_CIRCULAR'
  | 'CDT_BIVAQUE_SCATTER'
  // CHICOREE Pack layouts
  | 'CHICOREE_CLASSIC'
  | 'CHICOREE_COLUMN'
  | 'CHICOREE_GRID'
  | 'CHICOREE_WAVY'
  | 'CHICOREE_CIRCULAR'
  | 'CHICOREE_SCATTER'
  // PIXEL_AWAY Pack layouts
  | 'PIXEL_AWAY_CLASSIC'
  | 'PIXEL_AWAY_COLUMN'
  | 'PIXEL_AWAY_GRID'
  | 'PIXEL_AWAY_WAVY'
  | 'PIXEL_AWAY_CIRCULAR'
  | 'PIXEL_AWAY_SCATTER'
  // HYRAX Pack layouts
  | 'HYRAX_CLASSIC'
  | 'HYRAX_COLUMN'
  | 'HYRAX_GRID'
  | 'HYRAX_WAVY'
  | 'HYRAX_CIRCULAR'
  | 'HYRAX_SCATTER'
  // MIDNIGHT_LETTERS Pack layouts
  | 'MIDNIGHT_LETTERS_CLASSIC'
  | 'MIDNIGHT_LETTERS_COLUMN'
  | 'MIDNIGHT_LETTERS_GRID'
  | 'MIDNIGHT_LETTERS_WAVY'
  | 'MIDNIGHT_LETTERS_CIRCULAR'
  | 'MIDNIGHT_LETTERS_SCATTER'
  // NOSE_TRANSPORT Pack layouts
  | 'NOSE_TRANSPORT_CLASSIC'
  | 'NOSE_TRANSPORT_COLUMN'
  | 'NOSE_TRANSPORT_GRID'
  | 'NOSE_TRANSPORT_WAVY'
  | 'NOSE_TRANSPORT_CIRCULAR'
  | 'NOSE_TRANSPORT_SCATTER'
  // ORBIX Pack layouts
  | 'ORBIX_CLASSIC'
  | 'ORBIX_COLUMN'
  | 'ORBIX_GRID'
  | 'ORBIX_WAVY'
  | 'ORBIX_CIRCULAR'
  | 'ORBIX_SCATTER'
  // QUADRIANA Pack layouts
  | 'QUADRIANA_CLASSIC'
  | 'QUADRIANA_COLUMN'
  | 'QUADRIANA_GRID'
  | 'QUADRIANA_WAVY'
  | 'QUADRIANA_CIRCULAR'
  | 'QUADRIANA_SCATTER'
  // QUANTUM Pack layouts
  | 'QUANTUM_CLASSIC'
  | 'QUANTUM_COLUMN'
  | 'QUANTUM_GRID'
  | 'QUANTUM_WAVY'
  | 'QUANTUM_CIRCULAR'
  | 'QUANTUM_SCATTER'
  // RUNTTI Pack layouts
  | 'RUNTTI_CLASSIC'
  | 'RUNTTI_COLUMN'
  | 'RUNTTI_GRID'
  | 'RUNTTI_WAVY'
  | 'RUNTTI_CIRCULAR'
  | 'RUNTTI_SCATTER'
  // TACHYO Pack layouts
  | 'TACHYO_CLASSIC'
  | 'TACHYO_COLUMN'
  | 'TACHYO_GRID'
  | 'TACHYO_WAVY'
  | 'TACHYO_CIRCULAR'
  | 'TACHYO_SCATTER'
  // XANMONO Pack layouts
  | 'XANMONO_CLASSIC'
  | 'XANMONO_COLUMN'
  | 'XANMONO_GRID'
  | 'XANMONO_WAVY'
  | 'XANMONO_CIRCULAR'
  | 'XANMONO_SCATTER'
  // CAL_SANS Pack layouts
  | 'CAL_SANS_CLASSIC'
  | 'CAL_SANS_COLUMN'
  | 'CAL_SANS_GRID'
  | 'CAL_SANS_WAVY'
  | 'CAL_SANS_CIRCULAR'
  | 'CAL_SANS_SCATTER'
  // MONTSERRAT_ITALIC Pack layouts (inactive)
  | 'MONTSERRAT_ITALIC_CLASSIC'
  | 'MONTSERRAT_ITALIC_COLUMN'
  | 'MONTSERRAT_ITALIC_GRID'
  | 'MONTSERRAT_ITALIC_WAVY'
  | 'MONTSERRAT_ITALIC_CIRCULAR'
  | 'MONTSERRAT_ITALIC_SCATTER';

// Helper to get layout type from full layout
export const getLayoutType = (layout: OverlayLayout): LayoutType => {
  const parts = layout.split('_');
  return parts[parts.length - 1] as LayoutType;
};

// Helper to get pack from layout
export const getPackFromLayout = (layout: OverlayLayout): OverlayPack => {
  const pack = layout.split('_')[0] as OverlayPack;
  return pack;
};

// All layout types for iteration
export const LAYOUT_TYPES: LayoutType[] = ['CLASSIC', 'COLUMN', 'GRID', 'WAVY', 'CIRCULAR', 'SCATTER'];

// Configuration to map Packs to their available Layouts
export const PACK_CONFIG: Record<OverlayPack, { label: string; description: string; layouts: OverlayLayout[]; defaultColor: string }> = {
  [OverlayPack.PAINT]: {
    label: 'Outline',
    description: 'Hand-drawn hollow outlined text, casual running club aesthetic',
    layouts: [
      'PAINT_CLASSIC',
      'PAINT_COLUMN',
      'PAINT_GRID',
      'PAINT_WAVY',
      'PAINT_CIRCULAR',
      'PAINT_SCATTER',
    ],
    defaultColor: '#FFFFFF', // White outlined text
  },
  [OverlayPack.DOODLE]: {
    label: 'Miami',
    description: 'Playful bubble fonts with outlines and tilted text',
    layouts: [
      'DOODLE_CLASSIC',
      'DOODLE_COLUMN',
      'DOODLE_GRID',
      'DOODLE_WAVY',
      'DOODLE_CIRCULAR',
      'DOODLE_SCATTER',
    ],
    defaultColor: '#F5A5C8', // Signature pink
  },
  [OverlayPack.RETRO]: {
    label: 'Retro',
    description: 'Vintage athletic poster style with bold typography',
    layouts: [
      'RETRO_CLASSIC',
      'RETRO_COLUMN',
      'RETRO_GRID',
      'RETRO_WAVY',
      'RETRO_CIRCULAR',
      'RETRO_SCATTER',
    ],
    defaultColor: '#F5F0E6', // Cream/off-white vintage
  },
  [OverlayPack.GROOVY]: {
    label: 'Groove',
    description: '70s chunky bubble typography with organic curves',
    layouts: [
      'GROOVY_CLASSIC',
      'GROOVY_COLUMN',
      'GROOVY_GRID',
      'GROOVY_WAVY',
      'GROOVY_CIRCULAR',
      'GROOVY_SCATTER',
    ],
    defaultColor: '#F5EBD8', // Warm cream like The Bear
  },
  [OverlayPack.SKETCH]: {
    label: 'Sketch',
    description: 'Hand-drawn blue fill with scratchy black outlines',
    layouts: [
      'SKETCH_CLASSIC',
      'SKETCH_COLUMN',
      'SKETCH_GRID',
      'SKETCH_WAVY',
      'SKETCH_CIRCULAR',
      'SKETCH_SCATTER',
    ],
    defaultColor: '#4BA3C3', // Sky blue with black outline
  },
  [OverlayPack.CARTOON]: {
    label: 'Cartoon',
    description: 'Hand-drawn cards with tilted boxes and rough outlines',
    layouts: [
      'CARTOON_CLASSIC',
      'CARTOON_COLUMN',
      'CARTOON_GRID',
      'CARTOON_WAVY',
      'CARTOON_CIRCULAR',
      'CARTOON_SCATTER',
    ],
    defaultColor: '#CCFF00', // Lime/volt like the poster
  },
  [OverlayPack.CYBER]: {
    label: 'Terminal',
    description: 'Pixelated digital blocky font',
    layouts: [
      'CYBER_CLASSIC',
      'CYBER_COLUMN',
      'CYBER_GRID',
      'CYBER_WAVY',
      'CYBER_CIRCULAR',
      'CYBER_SCATTER',
    ],
    defaultColor: '#FFFFFF', // White
  },
  [OverlayPack.GLITCH]: {
    label: 'Glitch',
    description: 'Digital glitch effect with chromatic aberration',
    layouts: [
      'GLITCH_CLASSIC',
      'GLITCH_COLUMN',
      'GLITCH_GRID',
      'GLITCH_WAVY',
      'GLITCH_CIRCULAR',
      'GLITCH_SCATTER',
    ],
    defaultColor: '#00FFFF', // Cyan
  },
  [OverlayPack.GLASS]: {
    label: 'Glass',
    description: 'Transparent frosted glass with beveled edges',
    layouts: [
      'GLASS_CLASSIC',
      'GLASS_COLUMN',
      'GLASS_GRID',
      'GLASS_WAVY',
      'GLASS_CIRCULAR',
      'GLASS_SCATTER',
    ],
    defaultColor: 'rgba(255,255,255,0.15)', // Transparent white
  },
  [OverlayPack.CHUNKY]: {
    label: 'Chunky',
    description: 'Bold chunky letters with heavy shadow',
    layouts: [
      'CHUNKY_CLASSIC',
      'CHUNKY_COLUMN',
      'CHUNKY_GRID',
      'CHUNKY_WAVY',
      'CHUNKY_CIRCULAR',
      'CHUNKY_SCATTER',
    ],
    defaultColor: '#EF4444', // Red
  },
  [OverlayPack.CHILL]: {
    label: 'Chill',
    description: 'Block letters with organic curves and negative space',
    layouts: [
      'CHILL_CLASSIC',
      'CHILL_COLUMN',
      'CHILL_GRID',
      'CHILL_WAVY',
      'CHILL_CIRCULAR',
      'CHILL_SCATTER',
    ],
    defaultColor: '#F5EED6', // Cream
  },
  [OverlayPack.CHICLE]: {
    label: 'Cassette',
    description: 'Playful bubbly font with yellow on dark green',
    layouts: [
      'CHICLE_CLASSIC',
      'CHICLE_COLUMN',
      'CHICLE_GRID',
      'CHICLE_WAVY',
      'CHICLE_CIRCULAR',
      'CHICLE_SCATTER',
    ],
    defaultColor: '#FDE047', // Stronger yellow
  },
  [OverlayPack.SLACKEY]: {
    label: 'Slackey',
    description: 'Fun rounded cartoon font in white',
    layouts: [
      'SLACKEY_CLASSIC',
      'SLACKEY_COLUMN',
      'SLACKEY_GRID',
      'SLACKEY_WAVY',
      'SLACKEY_CIRCULAR',
      'SLACKEY_SCATTER',
    ],
    defaultColor: '#8cc850', // Green
  },
  [OverlayPack.ABRIL_FATFACE]: {
    label: 'Abril',
    description: 'Elegant serif display font',
    layouts: [
      'ABRIL_FATFACE_CLASSIC',
      'ABRIL_FATFACE_COLUMN',
      'ABRIL_FATFACE_GRID',
      'ABRIL_FATFACE_WAVY',
      'ABRIL_FATFACE_CIRCULAR',
      'ABRIL_FATFACE_SCATTER',
    ],
    defaultColor: '#FBB728', // Gold
  },
  [OverlayPack.LOBSTER]: {
    label: 'Lobster',
    description: 'Flowing script font',
    layouts: [
      'LOBSTER_CLASSIC',
      'LOBSTER_COLUMN',
      'LOBSTER_GRID',
      'LOBSTER_WAVY',
      'LOBSTER_CIRCULAR',
      'LOBSTER_SCATTER',
    ],
    defaultColor: '#efce7b', // Gold
  },
  [OverlayPack.OUTLINE]: {
    label: 'Outline',
    description: 'Clean outline-only text and route',
    layouts: [
      'OUTLINE_CLASSIC',
      'OUTLINE_COLUMN',
      'OUTLINE_GRID',
      'OUTLINE_WAVY',
      'OUTLINE_CIRCULAR',
      'OUTLINE_SCATTER',
    ],
    defaultColor: '#FFFFFF', // White
  },
  [OverlayPack.ROCK3D]: {
    label: 'Rock 3D',
    description: 'Bold 3D block letters with depth',
    layouts: [
      'ROCK3D_CLASSIC',
      'ROCK3D_COLUMN',
      'ROCK3D_GRID',
      'ROCK3D_WAVY',
      'ROCK3D_CIRCULAR',
      'ROCK3D_SCATTER',
    ],
    defaultColor: '#FFFFFF', // White
  },
  [OverlayPack.MARKER]: {
    label: 'Marker',
    description: 'Hand-drawn permanent marker style',
    layouts: [
      'MARKER_CLASSIC',
      'MARKER_COLUMN',
      'MARKER_GRID',
      'MARKER_WAVY',
      'MARKER_CIRCULAR',
      'MARKER_SCATTER',
    ],
    defaultColor: '#FFFFFF', // White
  },
  [OverlayPack.BURNED]: {
    label: 'Burned',
    description: 'Burned charred text style',
    layouts: [
      'BURNED_CLASSIC',
      'BURNED_COLUMN',
      'BURNED_GRID',
      'BURNED_WAVY',
      'BURNED_CIRCULAR',
      'BURNED_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.BUNGEE]: {
    label: 'Bungee',
    description: 'Bold outline block letters',
    layouts: [
      'BUNGEE_CLASSIC',
      'BUNGEE_COLUMN',
      'BUNGEE_GRID',
      'BUNGEE_WAVY',
      'BUNGEE_CIRCULAR',
      'BUNGEE_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.JERSEY]: {
    label: 'Jersey',
    description: 'Retro sports jersey numbers',
    layouts: [
      'JERSEY_CLASSIC',
      'JERSEY_COLUMN',
      'JERSEY_GRID',
      'JERSEY_WAVY',
      'JERSEY_CIRCULAR',
      'JERSEY_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.KABLAMMO]: {
    label: 'Kablammo',
    description: 'Explosive comic style',
    layouts: [
      'KABLAMMO_CLASSIC',
      'KABLAMMO_COLUMN',
      'KABLAMMO_GRID',
      'KABLAMMO_WAVY',
      'KABLAMMO_CIRCULAR',
      'KABLAMMO_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.RIGHTEOUS]: {
    label: 'Righteous',
    description: 'Retro rounded style',
    layouts: [
      'RIGHTEOUS_CLASSIC',
      'RIGHTEOUS_COLUMN',
      'RIGHTEOUS_GRID',
      'RIGHTEOUS_WAVY',
      'RIGHTEOUS_CIRCULAR',
      'RIGHTEOUS_SCATTER',
    ],
    defaultColor: '#C4B5FD',
  },
  [OverlayPack.POPPINS]: {
    label: 'Poppins',
    description: 'Clean modern sans-serif',
    layouts: [
      'POPPINS_CLASSIC',
      'POPPINS_COLUMN',
      'POPPINS_GRID',
      'POPPINS_WAVY',
      'POPPINS_CIRCULAR',
      'POPPINS_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.RUBIK_DOODLE]: {
    label: 'Rubik Doodle',
    description: 'Playful doodle shadow style',
    layouts: [
      'RUBIK_DOODLE_CLASSIC',
      'RUBIK_DOODLE_COLUMN',
      'RUBIK_DOODLE_GRID',
      'RUBIK_DOODLE_WAVY',
      'RUBIK_DOODLE_CIRCULAR',
      'RUBIK_DOODLE_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.FASCINATE]: {
    label: 'Fascinate',
    description: 'Decorative inline vintage display',
    layouts: [
      'FASCINATE_CLASSIC',
      'FASCINATE_COLUMN',
      'FASCINATE_GRID',
      'FASCINATE_WAVY',
      'FASCINATE_CIRCULAR',
      'FASCINATE_SCATTER',
    ],
    defaultColor: '#FFD700',
  },
  [OverlayPack.VINA_SANS]: {
    label: 'Vina Sans',
    description: 'Bold Vietnamese-inspired display',
    layouts: [
      'VINA_SANS_CLASSIC',
      'VINA_SANS_COLUMN',
      'VINA_SANS_GRID',
      'VINA_SANS_WAVY',
      'VINA_SANS_CIRCULAR',
      'VINA_SANS_SCATTER',
    ],
    defaultColor: '#FF6B6B',
  },
  [OverlayPack.QAHIRI]: {
    label: 'Qahiri',
    description: 'Angular Kufi-inspired display',
    layouts: [
      'QAHIRI_CLASSIC',
      'QAHIRI_COLUMN',
      'QAHIRI_GRID',
      'QAHIRI_WAVY',
      'QAHIRI_CIRCULAR',
      'QAHIRI_SCATTER',
    ],
    defaultColor: '#4ECDC4',
  },
  [OverlayPack.BARRIO]: {
    label: 'Barrio',
    description: 'Playful hand-painted street style',
    layouts: [
      'BARRIO_CLASSIC',
      'BARRIO_COLUMN',
      'BARRIO_GRID',
      'BARRIO_WAVY',
      'BARRIO_CIRCULAR',
      'BARRIO_SCATTER',
    ],
    defaultColor: '#FF9F1C',
  },
  [OverlayPack.DOKDO]: {
    label: 'Hazard',
    description: 'Rough brushstroke Korean style',
    layouts: [
      'DOKDO_CLASSIC',
      'DOKDO_COLUMN',
      'DOKDO_GRID',
      'DOKDO_WAVY',
      'DOKDO_CIRCULAR',
      'DOKDO_SCATTER',
    ],
    defaultColor: '#E8E8E8',
  },
  [OverlayPack.RUBIK_MAZE]: {
    label: 'Mainframe',
    description: 'Maze pattern filled letters',
    layouts: [
      'RUBIK_MAZE_CLASSIC',
      'RUBIK_MAZE_COLUMN',
      'RUBIK_MAZE_GRID',
      'RUBIK_MAZE_WAVY',
      'RUBIK_MAZE_CIRCULAR',
      'RUBIK_MAZE_SCATTER',
    ],
    defaultColor: '#A855F7',
  },
  [OverlayPack.RUBIK_MAPS]: {
    label: 'Rubik Maps',
    description: 'Map pattern filled letters',
    layouts: [
      'RUBIK_MAPS_CLASSIC',
      'RUBIK_MAPS_COLUMN',
      'RUBIK_MAPS_GRID',
      'RUBIK_MAPS_WAVY',
      'RUBIK_MAPS_CIRCULAR',
      'RUBIK_MAPS_SCATTER',
    ],
    defaultColor: '#22C55E',
  },
  [OverlayPack.MIXO]: {
    label: 'Mixo',
    description: 'Geometric stencil display',
    layouts: [
      'MIXO_CLASSIC',
      'MIXO_COLUMN',
      'MIXO_GRID',
      'MIXO_WAVY',
      'MIXO_CIRCULAR',
      'MIXO_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.CHAUMONT]: {
    label: 'Chaumont',
    description: 'Experimental display typography',
    layouts: [
      'CHAUMONT_CLASSIC',
      'CHAUMONT_COLUMN',
      'CHAUMONT_GRID',
      'CHAUMONT_WAVY',
      'CHAUMONT_CIRCULAR',
      'CHAUMONT_SCATTER',
    ],
    defaultColor: '#F472B6',
  },
  [OverlayPack.BACKOUT]: {
    label: 'Backout',
    description: 'Bold outlined display',
    layouts: [
      'BACKOUT_CLASSIC',
      'BACKOUT_COLUMN',
      'BACKOUT_GRID',
      'BACKOUT_WAVY',
      'BACKOUT_CIRCULAR',
      'BACKOUT_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.GULAX]: {
    label: 'Gulax',
    description: 'Quirky bubble display',
    layouts: [
      'GULAX_CLASSIC',
      'GULAX_COLUMN',
      'GULAX_GRID',
      'GULAX_WAVY',
      'GULAX_CIRCULAR',
      'GULAX_SCATTER',
    ],
    defaultColor: '#34D399',
  },
  [OverlayPack.LITTLE_HOPE]: {
    label: 'Little Hope',
    description: 'Handwritten casual style',
    layouts: [
      'LITTLE_HOPE_CLASSIC',
      'LITTLE_HOPE_COLUMN',
      'LITTLE_HOPE_GRID',
      'LITTLE_HOPE_WAVY',
      'LITTLE_HOPE_CIRCULAR',
      'LITTLE_HOPE_SCATTER',
    ],
    defaultColor: '#F08C21',
  },
  [OverlayPack.JUMPS_WINTER]: {
    label: 'Jumps Winter',
    description: 'Playful bouncy display',
    layouts: [
      'JUMPS_WINTER_CLASSIC',
      'JUMPS_WINTER_COLUMN',
      'JUMPS_WINTER_GRID',
      'JUMPS_WINTER_WAVY',
      'JUMPS_WINTER_CIRCULAR',
      'JUMPS_WINTER_SCATTER',
    ],
    defaultColor: '#00FBEA',
  },
  [OverlayPack.CHOCO_BLACK]: {
    label: 'ChocoBlack',
    description: 'Bold decorative display',
    layouts: [
      'CHOCO_BLACK_CLASSIC',
      'CHOCO_BLACK_COLUMN',
      'CHOCO_BLACK_GRID',
      'CHOCO_BLACK_WAVY',
      'CHOCO_BLACK_CIRCULAR',
      'CHOCO_BLACK_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.STRANGE_MARKS]: {
    label: 'Strange Marks',
    description: 'Sketchy hand-drawn doodle style',
    layouts: [
      'STRANGE_MARKS_CLASSIC',
      'STRANGE_MARKS_COLUMN',
      'STRANGE_MARKS_GRID',
      'STRANGE_MARKS_WAVY',
      'STRANGE_MARKS_CIRCULAR',
      'STRANGE_MARKS_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.PLAYFUL_BOXES]: {
    label: 'Playful Boxes',
    description: 'Fun blocky boxed letters',
    layouts: [
      'PLAYFUL_BOXES_CLASSIC',
      'PLAYFUL_BOXES_COLUMN',
      'PLAYFUL_BOXES_GRID',
      'PLAYFUL_BOXES_WAVY',
      'PLAYFUL_BOXES_CIRCULAR',
      'PLAYFUL_BOXES_SCATTER',
    ],
    defaultColor: '#FFD93D',
  },
  [OverlayPack.POSTBOOK]: {
    label: 'Postbook',
    description: 'Clean modern social style',
    layouts: [
      'POSTBOOK_CLASSIC',
      'POSTBOOK_COLUMN',
      'POSTBOOK_GRID',
      'POSTBOOK_WAVY',
      'POSTBOOK_CIRCULAR',
      'POSTBOOK_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.SUGGESTED]: {
    label: 'Suggested',
    description: 'Clean outlined block letters',
    layouts: [
      'SUGGESTED_CLASSIC',
      'SUGGESTED_COLUMN',
      'SUGGESTED_GRID',
      'SUGGESTED_WAVY',
      'SUGGESTED_CIRCULAR',
      'SUGGESTED_SCATTER',
    ],
    defaultColor: '#FF6B6B',
  },
  [OverlayPack.AMATIC]: {
    label: 'Amatic',
    description: 'Hand-drawn tall condensed display',
    layouts: [
      'AMATIC_CLASSIC',
      'AMATIC_COLUMN',
      'AMATIC_GRID',
      'AMATIC_WAVY',
      'AMATIC_CIRCULAR',
      'AMATIC_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.BLOX2]: {
    label: 'Blox2',
    description: 'Blocky geometric display',
    layouts: [
      'BLOX2_CLASSIC',
      'BLOX2_COLUMN',
      'BLOX2_GRID',
      'BLOX2_WAVY',
      'BLOX2_CIRCULAR',
      'BLOX2_SCATTER',
    ],
    defaultColor: '#00FF00',
  },
  [OverlayPack.WEDGIE]: {
    label: 'Wedgie',
    description: 'Playful wedge-shaped display',
    layouts: [
      'WEDGIE_CLASSIC',
      'WEDGIE_COLUMN',
      'WEDGIE_GRID',
      'WEDGIE_WAVY',
      'WEDGIE_CIRCULAR',
      'WEDGIE_SCATTER',
    ],
    defaultColor: '#FF6B35',
  },
  [OverlayPack.CWISDOM]: {
    label: 'Cwisdom',
    description: 'Wisdom-inspired typography',
    layouts: [
      'CWISDOM_CLASSIC',
      'CWISDOM_COLUMN',
      'CWISDOM_GRID',
      'CWISDOM_WAVY',
      'CWISDOM_CIRCULAR',
      'CWISDOM_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.FACON]: {
    label: 'Facon',
    description: 'Bold retro display font',
    layouts: [
      'FACON_CLASSIC',
      'FACON_COLUMN',
      'FACON_GRID',
      'FACON_WAVY',
      'FACON_CIRCULAR',
      'FACON_SCATTER',
    ],
    defaultColor: '#FFD700',
  },
  [OverlayPack.SEFA]: {
    label: 'Sefa',
    description: 'Modern artistic display',
    layouts: [
      'SEFA_CLASSIC',
      'SEFA_COLUMN',
      'SEFA_GRID',
      'SEFA_WAVY',
      'SEFA_CIRCULAR',
      'SEFA_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.ONICK]: {
    label: 'Onick',
    description: 'Unique stylized typography',
    layouts: [
      'ONICK_CLASSIC',
      'ONICK_COLUMN',
      'ONICK_GRID',
      'ONICK_WAVY',
      'ONICK_CIRCULAR',
      'ONICK_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.HELPME]: {
    label: 'HelpMe',
    description: 'Expressive display font',
    layouts: [
      'HELPME_CLASSIC',
      'HELPME_COLUMN',
      'HELPME_GRID',
      'HELPME_WAVY',
      'HELPME_CIRCULAR',
      'HELPME_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.GRIDLOCK]: {
    label: 'Protocol',
    description: 'Chrome metallic effect typography',
    layouts: [
      'GRIDLOCK_CLASSIC',
      'GRIDLOCK_COLUMN',
      'GRIDLOCK_GRID',
      'GRIDLOCK_WAVY',
      'GRIDLOCK_CIRCULAR',
      'GRIDLOCK_SCATTER',
    ],
    defaultColor: '#C0C0C0',
  },
  [OverlayPack.ACHTUNG_BRAVO]: {
    label: 'Achtung',
    description: 'Bold military-style display font',
    layouts: [
      'ACHTUNG_BRAVO_CLASSIC',
      'ACHTUNG_BRAVO_COLUMN',
      'ACHTUNG_BRAVO_GRID',
      'ACHTUNG_BRAVO_WAVY',
      'ACHTUNG_BRAVO_CIRCULAR',
      'ACHTUNG_BRAVO_SCATTER',
    ],
    defaultColor: '#FF4136',
  },
  [OverlayPack.BOCALUPO]: {
    label: 'VHS',
    description: 'Playful decorative typography',
    layouts: [
      'BOCALUPO_CLASSIC',
      'BOCALUPO_COLUMN',
      'BOCALUPO_GRID',
      'BOCALUPO_WAVY',
      'BOCALUPO_CIRCULAR',
      'BOCALUPO_SCATTER',
    ],
    defaultColor: '#FFD93D',
  },
  [OverlayPack.CAFE24_MOYAMOYA]: {
    label: 'Canvas',
    description: 'Cute bubbly Korean-inspired font',
    layouts: [
      'CAFE24_MOYAMOYA_CLASSIC',
      'CAFE24_MOYAMOYA_COLUMN',
      'CAFE24_MOYAMOYA_GRID',
      'CAFE24_MOYAMOYA_WAVY',
      'CAFE24_MOYAMOYA_CIRCULAR',
      'CAFE24_MOYAMOYA_SCATTER',
    ],
    defaultColor: '#FF69B4',
  },
  [OverlayPack.KUBO]: {
    label: 'Binary',
    description: 'Geometric blocky display font',
    layouts: [
      'KUBO_CLASSIC',
      'KUBO_COLUMN',
      'KUBO_GRID',
      'KUBO_WAVY',
      'KUBO_CIRCULAR',
      'KUBO_SCATTER',
    ],
    defaultColor: '#00D4FF',
  },
  [OverlayPack.SPEED_FREAK]: {
    label: 'Velocity',
    description: 'Dynamic sporty racing font',
    layouts: [
      'SPEED_FREAK_CLASSIC',
      'SPEED_FREAK_COLUMN',
      'SPEED_FREAK_GRID',
      'SPEED_FREAK_WAVY',
      'SPEED_FREAK_CIRCULAR',
      'SPEED_FREAK_SCATTER',
    ],
    defaultColor: '#CCFF00',
  },
  [OverlayPack.BEZMIAR]: {
    label: 'Bezmiar',
    description: 'Elegant serif display font',
    layouts: [
      'BEZMIAR_CLASSIC',
      'BEZMIAR_COLUMN',
      'BEZMIAR_GRID',
      'BEZMIAR_WAVY',
      'BEZMIAR_CIRCULAR',
      'BEZMIAR_SCATTER',
    ],
    defaultColor: '#E8D5B7',
  },
  [OverlayPack.BLOCKY]: {
    label: 'Impact',
    description: 'Bold geometric block letters',
    layouts: [
      'BLOCKY_CLASSIC',
      'BLOCKY_COLUMN',
      'BLOCKY_GRID',
      'BLOCKY_WAVY',
      'BLOCKY_CIRCULAR',
      'BLOCKY_SCATTER',
    ],
    defaultColor: '#FF6B35',
  },
  [OverlayPack.FUNKWEST]: {
    label: 'Funkwest',
    description: 'Retro western display font',
    layouts: [
      'FUNKWEST_CLASSIC',
      'FUNKWEST_COLUMN',
      'FUNKWEST_GRID',
      'FUNKWEST_WAVY',
      'FUNKWEST_CIRCULAR',
      'FUNKWEST_SCATTER',
    ],
    defaultColor: '#DAA520',
  },
  [OverlayPack.GRITH]: {
    label: 'Studio',
    description: 'Clean modern sans-serif',
    layouts: [
      'GRITH_CLASSIC',
      'GRITH_COLUMN',
      'GRITH_GRID',
      'GRITH_WAVY',
      'GRITH_CIRCULAR',
      'GRITH_SCATTER',
    ],
    defaultColor: '#87CEEB',
  },
  [OverlayPack.LT_RAILWAY]: {
    label: 'Tarmac',
    description: 'London Transport inspired font',
    layouts: [
      'LT_RAILWAY_CLASSIC',
      'LT_RAILWAY_COLUMN',
      'LT_RAILWAY_GRID',
      'LT_RAILWAY_WAVY',
      'LT_RAILWAY_CIRCULAR',
      'LT_RAILWAY_SCATTER',
    ],
    defaultColor: '#CC3333',
  },
  [OverlayPack.CDT_BIVAQUE]: {
    label: 'Force',
    description: 'Rustic outdoor adventure font',
    layouts: [
      'CDT_BIVAQUE_CLASSIC',
      'CDT_BIVAQUE_COLUMN',
      'CDT_BIVAQUE_GRID',
      'CDT_BIVAQUE_WAVY',
      'CDT_BIVAQUE_CIRCULAR',
      'CDT_BIVAQUE_SCATTER',
    ],
    defaultColor: '#8B7355',
  },
  [OverlayPack.CHICOREE]: {
    label: 'Nitro',
    description: 'Bold decorative display font',
    layouts: [
      'CHICOREE_CLASSIC',
      'CHICOREE_COLUMN',
      'CHICOREE_GRID',
      'CHICOREE_WAVY',
      'CHICOREE_CIRCULAR',
      'CHICOREE_SCATTER',
    ],
    defaultColor: '#9B59B6',
  },
  [OverlayPack.PIXEL_AWAY]: {
    label: 'Arcade',
    description: 'Retro 8-bit pixel font',
    layouts: [
      'PIXEL_AWAY_CLASSIC',
      'PIXEL_AWAY_COLUMN',
      'PIXEL_AWAY_GRID',
      'PIXEL_AWAY_WAVY',
      'PIXEL_AWAY_CIRCULAR',
      'PIXEL_AWAY_SCATTER',
    ],
    defaultColor: '#00FF00',
  },
  [OverlayPack.HYRAX]: {
    label: 'Pure',
    description: 'Playful rounded display font',
    layouts: [
      'HYRAX_CLASSIC',
      'HYRAX_COLUMN',
      'HYRAX_GRID',
      'HYRAX_WAVY',
      'HYRAX_CIRCULAR',
      'HYRAX_SCATTER',
    ],
    defaultColor: '#FF8C42',
  },
  [OverlayPack.MIDNIGHT_LETTERS]: {
    label: 'System',
    description: 'Mysterious night-themed font',
    layouts: [
      'MIDNIGHT_LETTERS_CLASSIC',
      'MIDNIGHT_LETTERS_COLUMN',
      'MIDNIGHT_LETTERS_GRID',
      'MIDNIGHT_LETTERS_WAVY',
      'MIDNIGHT_LETTERS_CIRCULAR',
      'MIDNIGHT_LETTERS_SCATTER',
    ],
    defaultColor: '#4A5568',
  },
  [OverlayPack.NOSE_TRANSPORT]: {
    label: 'Essential',
    description: 'Bold dotted transport font',
    layouts: [
      'NOSE_TRANSPORT_CLASSIC',
      'NOSE_TRANSPORT_COLUMN',
      'NOSE_TRANSPORT_GRID',
      'NOSE_TRANSPORT_WAVY',
      'NOSE_TRANSPORT_CIRCULAR',
      'NOSE_TRANSPORT_SCATTER',
    ],
    defaultColor: '#FFD700',
  },
  [OverlayPack.ORBIX]: {
    label: 'Caesar',
    description: 'Roman-inspired decorative font',
    layouts: [
      'ORBIX_CLASSIC',
      'ORBIX_COLUMN',
      'ORBIX_GRID',
      'ORBIX_WAVY',
      'ORBIX_CIRCULAR',
      'ORBIX_SCATTER',
    ],
    defaultColor: '#00CED1',
  },
  [OverlayPack.QUADRIANA]: {
    label: 'Slate',
    description: 'Geometric square-based font',
    layouts: [
      'QUADRIANA_CLASSIC',
      'QUADRIANA_COLUMN',
      'QUADRIANA_GRID',
      'QUADRIANA_WAVY',
      'QUADRIANA_CIRCULAR',
      'QUADRIANA_SCATTER',
    ],
    defaultColor: '#E74C3C',
  },
  [OverlayPack.QUANTUM]: {
    label: 'Quantum',
    description: 'Sci-fi quantum-inspired font',
    layouts: [
      'QUANTUM_CLASSIC',
      'QUANTUM_COLUMN',
      'QUANTUM_GRID',
      'QUANTUM_WAVY',
      'QUANTUM_CIRCULAR',
      'QUANTUM_SCATTER',
    ],
    defaultColor: '#8E44AD',
  },
  [OverlayPack.RUNTTI]: {
    label: 'Titan',
    description: 'Finnish minimalist font',
    layouts: [
      'RUNTTI_CLASSIC',
      'RUNTTI_COLUMN',
      'RUNTTI_GRID',
      'RUNTTI_WAVY',
      'RUNTTI_CIRCULAR',
      'RUNTTI_SCATTER',
    ],
    defaultColor: '#3498DB',
  },
  [OverlayPack.TACHYO]: {
    label: 'Rapid',
    description: 'Speed-inspired dynamic font',
    layouts: [
      'TACHYO_CLASSIC',
      'TACHYO_COLUMN',
      'TACHYO_GRID',
      'TACHYO_WAVY',
      'TACHYO_CIRCULAR',
      'TACHYO_SCATTER',
    ],
    defaultColor: '#F39C12',
  },
  [OverlayPack.XANMONO]: {
    label: 'Digital',
    description: 'Modern monospace display font',
    layouts: [
      'XANMONO_CLASSIC',
      'XANMONO_COLUMN',
      'XANMONO_GRID',
      'XANMONO_WAVY',
      'XANMONO_CIRCULAR',
      'XANMONO_SCATTER',
    ],
    defaultColor: '#1ABC9C',
  },
  [OverlayPack.CAL_SANS]: {
    label: 'Clean',
    description: 'Clean minimal sans-serif, no outline',
    layouts: [
      'CAL_SANS_CLASSIC',
      'CAL_SANS_COLUMN',
      'CAL_SANS_GRID',
      'CAL_SANS_WAVY',
      'CAL_SANS_CIRCULAR',
      'CAL_SANS_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.KIRANG]: {
    label: 'Kirang',
    description: 'Playful Korean brush font',
    layouts: [
      'KIRANG_CLASSIC',
      'KIRANG_COLUMN',
      'KIRANG_GRID',
      'KIRANG_WAVY',
      'KIRANG_CIRCULAR',
      'KIRANG_SCATTER',
    ],
    defaultColor: '#FF6B9D',
  },
  [OverlayPack.BANGERS]: {
    label: 'Bangers',
    description: 'Bold comic book style',
    layouts: [
      'BANGERS_CLASSIC',
      'BANGERS_COLUMN',
      'BANGERS_GRID',
      'BANGERS_WAVY',
      'BANGERS_CIRCULAR',
      'BANGERS_SCATTER',
    ],
    defaultColor: '#FFE135',
  },
  [OverlayPack.JOLLY_LODGER]: {
    label: 'Jolly',
    description: 'Fun handwritten carnival style',
    layouts: [
      'JOLLY_LODGER_CLASSIC',
      'JOLLY_LODGER_COLUMN',
      'JOLLY_LODGER_GRID',
      'JOLLY_LODGER_WAVY',
      'JOLLY_LODGER_CIRCULAR',
      'JOLLY_LODGER_SCATTER',
    ],
    defaultColor: '#7FDBFF',
  },
  [OverlayPack.FRECKLE_FACE]: {
    label: 'Freckle',
    description: 'Friendly hand-drawn lettering',
    layouts: [
      'FRECKLE_FACE_CLASSIC',
      'FRECKLE_FACE_COLUMN',
      'FRECKLE_FACE_GRID',
      'FRECKLE_FACE_WAVY',
      'FRECKLE_FACE_CIRCULAR',
      'FRECKLE_FACE_SCATTER',
    ],
    defaultColor: '#2ECC40',
  },
  [OverlayPack.CHEWY]: {
    label: 'Chewy',
    description: 'Soft, rounded playful font',
    layouts: [
      'CHEWY_CLASSIC',
      'CHEWY_COLUMN',
      'CHEWY_GRID',
      'CHEWY_WAVY',
      'CHEWY_CIRCULAR',
      'CHEWY_SCATTER',
    ],
    defaultColor: '#FF9FF3',
  },
  [OverlayPack.LUCKIEST_GUY]: {
    label: 'Lucky',
    description: 'Bold cartoon display font',
    layouts: [
      'LUCKIEST_GUY_CLASSIC',
      'LUCKIEST_GUY_COLUMN',
      'LUCKIEST_GUY_GRID',
      'LUCKIEST_GUY_WAVY',
      'LUCKIEST_GUY_CIRCULAR',
      'LUCKIEST_GUY_SCATTER',
    ],
    defaultColor: '#00D2D3',
  },
  [OverlayPack.MONTSERRAT_ITALIC]: {
    label: 'Montserrat',
    description: 'Clean italic sans-serif',
    layouts: [
      'MONTSERRAT_ITALIC_CLASSIC',
      'MONTSERRAT_ITALIC_COLUMN',
      'MONTSERRAT_ITALIC_GRID',
      'MONTSERRAT_ITALIC_WAVY',
      'MONTSERRAT_ITALIC_CIRCULAR',
      'MONTSERRAT_ITALIC_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.COMFORTAA]: {
    label: 'Comfort',
    description: 'Rounded modern sans-serif',
    layouts: [
      'COMFORTAA_CLASSIC',
      'COMFORTAA_COLUMN',
      'COMFORTAA_GRID',
      'COMFORTAA_WAVY',
      'COMFORTAA_CIRCULAR',
      'COMFORTAA_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.ATKINSON]: {
    label: 'Atkinson',
    description: 'Accessible monospace',
    layouts: [
      'ATKINSON_CLASSIC',
      'ATKINSON_COLUMN',
      'ATKINSON_GRID',
      'ATKINSON_WAVY',
      'ATKINSON_CIRCULAR',
      'ATKINSON_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.FINLANDICA]: {
    label: 'Nordic',
    description: 'Clean Finnish design',
    layouts: [
      'FINLANDICA_CLASSIC',
      'FINLANDICA_COLUMN',
      'FINLANDICA_GRID',
      'FINLANDICA_WAVY',
      'FINLANDICA_CIRCULAR',
      'FINLANDICA_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.ALLERTA]: {
    label: 'Alert',
    description: 'Bold signal typography',
    layouts: [
      'ALLERTA_CLASSIC',
      'ALLERTA_COLUMN',
      'ALLERTA_GRID',
      'ALLERTA_WAVY',
      'ALLERTA_CIRCULAR',
      'ALLERTA_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
  [OverlayPack.KDAM]: {
    label: 'Kdam',
    description: 'Thai-inspired display',
    layouts: [
      'KDAM_CLASSIC',
      'KDAM_COLUMN',
      'KDAM_GRID',
      'KDAM_WAVY',
      'KDAM_CIRCULAR',
      'KDAM_SCATTER',
    ],
    defaultColor: '#FFFFFF',
  },
};

// =============================================================================
// LEGACY THEME SYSTEM - Commented out, may need later
// =============================================================================

/*
// The high-level Aesthetic Category
export enum OverlayTheme {
  EDITORIAL = 'EDITORIAL',
  BOLD = 'BOLD',
  GRAPHIC = 'GRAPHIC',
  CINEMATIC = 'CINEMATIC',
  CANVAS = 'CANVAS',
  REPEATER = 'REPEATER',
  VINTAGE = 'VINTAGE'
}

// The specific arrangement/layout for a theme
export type LegacyOverlayLayout = 
  | 'MINIMAL_CENTER' | 'MINIMAL_CENTER_BLOCK' | 'MINIMAL_CORNERS' | 'MINIMAL_VERTICAL_STACK' | 'MINIMAL_MAP_SIDES' | 'MINIMAL_BOTTOM' | 'MINIMAL_VERTICAL' | 'MINIMAL_HORIZONTAL' | 'MINIMAL_SCATTERED' | 'MINIMAL_GRID_4' | 'MINIMAL_GRID_6' | 'CIRCULAR_STATS'
  | 'HANDWRITTEN_MESSY' | 'VERTICAL_TICKER'
  | 'BOLD_HERO' | 'BOLD_VERTICAL' | 'BOLD_SPORT' | 'BOLD_PAINTED'
  | 'SYSTEM_DRILL' | 'SYSTEM_SIDEWAYS_UNIFORM' | 'SYSTEM_SIDEWAYS_OPPOSITE'
  | 'BLOCK_CENTER' | 'BLOCK_CIRCLE'
  | 'IMPACT_HEAVY' | 'IMPACT_BOTTOM' | 'IMPACT_SIDE'
  | 'GLASS_CARD'
  | 'POLAR_STRIPS'
  | 'RIPPED_SPLIT'
  | 'LUXE_COVER' | 'LUXE_MINIMAL'
  | 'SPORT_COVER' | 'SPORT_HL' | 'SPORT_NOISE'
  | 'CANVAS_OVERLAP'
  | 'REPEATER_TYPO';

// Configuration to map Themes to their available Layouts
export const THEME_CONFIG: Record<OverlayTheme, { label: string; layouts: LegacyOverlayLayout[] }> = {
  [OverlayTheme.EDITORIAL]: { 
    label: 'Editorial', 
    layouts: [
      'MINIMAL_CENTER',
      'MINIMAL_CENTER_BLOCK',
      'MINIMAL_CORNERS',
      'MINIMAL_VERTICAL_STACK',
      'MINIMAL_MAP_SIDES',
      'CIRCULAR_STATS',
      'HANDWRITTEN_MESSY',
      'VERTICAL_TICKER',
    ] 
  },
  [OverlayTheme.BOLD]: {
    label: 'Bold',
    layouts: [
      'BOLD_HERO',
      'BOLD_VERTICAL',
      'BOLD_SPORT',
      'BOLD_PAINTED',
    ]
  },
  [OverlayTheme.GRAPHIC]: {
    label: 'Graphic',
    layouts: [
      'GLASS_CARD',
      'BLOCK_CENTER', 
      'BLOCK_CIRCLE',
      'IMPACT_HEAVY', 
      'IMPACT_BOTTOM', 
      'IMPACT_SIDE',
      'RIPPED_SPLIT',
      'REPEATER_TYPO',
    ]
  },
  [OverlayTheme.CINEMATIC]: {
    label: 'Cinematic',
    layouts: []
  },
  [OverlayTheme.CANVAS]: {
    label: 'Canvas',
    layouts: [
      'CANVAS_OVERLAP'
    ]
  },
  [OverlayTheme.REPEATER]: {
    label: 'Repeater',
    layouts: [
      'REPEATER_TYPO'
    ]
  },
  [OverlayTheme.VINTAGE]: {
    label: 'Vintage',
    layouts: [
      'CANVAS_OVERLAP',
      'SPORT_HL',
      'POLAR_STRIPS',
      'SYSTEM_DRILL',
      'SYSTEM_SIDEWAYS_UNIFORM',
      'SYSTEM_SIDEWAYS_OPPOSITE'
    ]
  }
};
*/

// Backwards compatibility - keeping OverlayTheme as an alias to OverlayPack for now
export const OverlayTheme = OverlayPack;
export type OverlayTheme = OverlayPack;

// Backwards compatibility - THEME_CONFIG maps to PACK_CONFIG  
export const THEME_CONFIG = PACK_CONFIG;

export interface ActivityContext {
  stats: ActivityStats;
  backgroundImage: string | null;
  bgConfig: BackgroundConfig;
  layout: OverlayLayout;
  customColor: string;
  fontWeight: string;
  textShadow: boolean;
  textStyle: TextStyle;
  textAlign: 'left' | 'center' | 'right';
  statsLayout: 'horizontal' | 'vertical' | 'separate';
  imageFilter: ImageFilter;
  imageFilterStrength: number;
  imageAdjustments: ImageAdjustments;
  visibleStats: VisibleStats;
  separatedStats: SeparatedStats;
  elementPositions: Record<string, ElementPosition>;
  selectedElementId: string | null;
  showLabels: boolean;
}

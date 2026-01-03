import { OverlayPack } from './types';

const createGradientDataUrl = (stops: string[]): string => {
  const stopElements = stops
    .map((color, index) => {
      const offset = stops.length === 1 ? 0 : (index / (stops.length - 1)) * 100;
      return `<stop offset='${offset}%' stop-color='${color}' />`;
    })
    .join('');

  const svg = `<?xml version='1.0' encoding='UTF-8'?>
<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'>
  <defs>
    <linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
      ${stopElements}
    </linearGradient>
  </defs>
  <rect width='800' height='1000' fill='url(#gradient)' />
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Pack preview images - shown when no user background is uploaded
export const PACK_PREVIEW_IMAGES: Record<OverlayPack, string> = {
  // PAINT: Sunset gradient like the reference (deep blue → purple → orange → warm)
  [OverlayPack.PAINT]: createGradientDataUrl(['#1a1a2e', '#3d3d6b', '#8b5a5a', '#c97b4b', '#e8a85c']),
  // DOODLE: Soft beige/cream background like the "Pretty Standert Love Affair" reference
  [OverlayPack.DOODLE]: createGradientDataUrl(['#d4c9a8', '#c9bea0', '#beb398']),
  // RETRO: Dusty blue like the BN CONF poster or cream/off-white
  [OverlayPack.RETRO]: createGradientDataUrl(['#c8d4dc', '#b8c8d4', '#a8bcc8']),
};

// Backwards compatibility
export const THEME_PREVIEW_IMAGES = PACK_PREVIEW_IMAGES;

export const SAFE_DEFAULT_BACKGROUND = PACK_PREVIEW_IMAGES[OverlayPack.PAINT];

import React from 'react';
import { ElementEffect, ElementEffectType } from '../types';

// Unique ID counter for SVG filter IDs
let effectIdCounter = 0;
export const generateEffectId = () => `effect-${++effectIdCounter}`;

// Generate SVG filter definitions for effects
export const getEffectFilterDef = (effect: ElementEffect, filterId: string): string => {
  const intensity = effect.intensity / 100; // Normalize to 0-1
  
  switch (effect.type) {
    case 'blur':
      // Simple gaussian blur
      const blurRadius = intensity * 6; // 0-6px blur
      return `
        <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="${blurRadius}" />
        </filter>
      `;
      
    case 'grain':
      // Dense TV static/noise effect - high frequency noise within element bounds only
      const grainOpacity = 0.3 + (intensity * 0.007); // 0.3-1.0 opacity based on intensity
      const baseFreq = 0.6 + (intensity * 0.015); // Higher frequency = denser noise
      return `
        <filter id="${filterId}" x="0%" y="0%" width="100%" height="100%">
          <!-- Create dense noise pattern -->
          <feTurbulence type="fractalNoise" baseFrequency="${baseFreq}" numOctaves="3" seed="5" result="noise" />
          <!-- Convert noise to grayscale with high contrast -->
          <feColorMatrix in="noise" type="matrix"
            values="1 0 0 0 0
                    1 0 0 0 0
                    1 0 0 0 0
                    0 0 0 1 0" result="monoNoise" />
          <!-- Increase contrast of noise -->
          <feComponentTransfer in="monoNoise" result="contrastNoise">
            <feFuncR type="discrete" tableValues="0 1" />
            <feFuncG type="discrete" tableValues="0 1" />
            <feFuncB type="discrete" tableValues="0 1" />
          </feComponentTransfer>
          <!-- Blend noise with original using overlay mode -->
          <feBlend in="SourceGraphic" in2="contrastNoise" mode="overlay" result="grained" />
          <!-- Clip to original element shape -->
          <feComposite in="grained" in2="SourceAlpha" operator="in" />
        </filter>
      `;
      
    case 'glitch':
      // RGB split/glitch effect
      const glitchOffset = intensity * 5; // 0-5px offset
      return `
        <filter id="${filterId}" x="-10%" y="-10%" width="120%" height="120%">
          <feOffset in="SourceGraphic" dx="${glitchOffset}" dy="0" result="red" />
          <feOffset in="SourceGraphic" dx="${-glitchOffset}" dy="0" result="blue" />
          <feColorMatrix in="red" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="redOnly" />
          <feColorMatrix in="blue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blueOnly" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="greenOnly" />
          <feBlend in="redOnly" in2="greenOnly" mode="screen" result="rg" />
          <feBlend in="rg" in2="blueOnly" mode="screen" />
        </filter>
      `;
      
    default:
      return '';
  }
};

// Get CSS styles for effects (some effects work better with CSS)
export const getEffectStyles = (effect: ElementEffect): React.CSSProperties => {
  if (!effect || effect.type === 'none') return {};
  
  const intensity = effect.intensity / 100;
  
  switch (effect.type) {
    case 'blur':
      return {
        filter: `blur(${intensity * 4}px)`,
      };
      
    case 'grain':
      // For grain, we'll use a pseudo-element approach or SVG filter
      return {};
      
    case 'glitch':
      // Glitch is better with SVG filter for proper RGB split
      return {};
      
    default:
      return {};
  }
};

// Effect presets for quick selection
export const EFFECT_PRESETS: { id: ElementEffectType; label: string; icon: string; description: string }[] = [
  { id: 'none', label: 'None', icon: '○', description: 'No effect' },
  { id: 'blur', label: 'Blur', icon: '◐', description: 'Soft blur effect' },
  { id: 'grain', label: 'Grain', icon: '▒', description: 'Grainy texture' },
  { id: 'glitch', label: 'Glitch', icon: '⚡', description: 'RGB split glitch' },
];

// Default effect values
export const DEFAULT_EFFECT: ElementEffect = {
  type: 'none',
  intensity: 50,
};

// Create effect from type with default intensity
export const createEffect = (type: ElementEffectType, intensity: number = 50): ElementEffect => ({
  type,
  intensity,
});

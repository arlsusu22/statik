import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import PolylineUtil from 'polyline-encoded';
import { RouteStyle } from '../types';

interface RoutePolylineProps {
  polylineEncoded?: string;
  x?: number;
  y?: number;
  scale?: number;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  style?: RouteStyle;
  outline?: boolean;
  outlineWidth?: number;
  outlineColor?: string;
  // Outline-only mode - render as hollow stroke (no fill)
  outlineOnly?: boolean;
  // Sketchy irregular hand-drawn style
  sketchy?: boolean;
  // Shadow/background effect (offset copy behind main route)
  shadowOffset?: { x: number; y: number };
  shadowColor?: string;
  shadowOpacity?: number;
  // Special effects
  pixelated?: boolean;
  // Max dimensions to constrain the route
  maxWidth?: number;
  maxHeight?: number;
  isEditing?: boolean;
  isSelected?: boolean;
  onPositionChange?: (x: number, y: number) => void;
  onScaleChange?: (scale: number) => void;
  onSelect?: () => void;
  className?: string;
}

export const RoutePolyline: React.FC<RoutePolylineProps> = memo(function RoutePolyline({ 
  polylineEncoded, 
  x = 0,
  y = 0,
  scale = 1,
  strokeColor = '#FFFFFF', 
  strokeWidth = 2,
  opacity = 0.8,
  style = 'smooth',
  outline = false,
  outlineWidth = 2,
  outlineColor = '#000000',
  outlineOnly = false,
  sketchy = false,
  shadowOffset,
  shadowColor = '#000000',
  shadowOpacity = 0.5,
  pixelated = false,
  maxWidth,
  maxHeight,
  isEditing = false,
  isSelected = false,
  onPositionChange,
  onScaleChange,
  onSelect,
  className = ''
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Decode and render polyline
  useEffect(() => {
    if (!polylineEncoded) return;

    try {
      const coordinates = PolylineUtil.decode(polylineEncoded) as [number, number][];
      
      if (coordinates.length < 2) return;

      const lats = coordinates.map(coord => coord[0]);
      const lngs = coordinates.map(coord => coord[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const latRange = maxLat - minLat || 0.001;
      const lngRange = maxLng - minLng || 0.001;
      
      // Use smaller base size when constraints are provided
      const baseSize = (maxWidth || maxHeight) ? Math.min(maxWidth || 300, maxHeight || 300) : 300;
      const aspectRatio = lngRange / latRange;
      
      let width: number, height: number;
      if (aspectRatio > 1) {
        width = baseSize;
        height = baseSize / aspectRatio;
      } else {
        height = baseSize;
        width = baseSize * aspectRatio;
      }

      // Always constrain to both dimensions if provided
      if (maxWidth || maxHeight) {
        const mw = maxWidth || width;
        const mh = maxHeight || height;
        const scaleX = mw / width;
        const scaleY = mh / height;
        const constrainScale = Math.min(scaleX, scaleY, 1);
        width = width * constrainScale;
        height = height * constrainScale;
      }

      const padding = 20;
      const paddedWidth = width + padding * 2;
      const paddedHeight = height + padding * 2;

      const xScale = width / lngRange;
      const yScale = height / latRange;

      const points = coordinates.map(([lat, lng]) => {
        const px = (lng - minLng) * xScale + padding;
        const py = paddedHeight - ((lat - minLat) * yScale + padding);
        return `${px},${py}`;
      }).join(' ');

      setDimensions({ width: paddedWidth, height: paddedHeight });
      setSvgContent(points);
    } catch (error) {
      console.error('Failed to decode polyline:', error);
    }
  }, [polylineEncoded]);

  // Handle drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isEditing) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    if (onSelect) onSelect();
    if (!onPositionChange) return;

    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = x;
    const initialY = y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      onPositionChange(initialX + deltaX, initialY + deltaY);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [isEditing, x, y, onPositionChange, onSelect]);

  // Handle resize from corner
  const handleResizePointerDown = useCallback((e: React.PointerEvent, corner: string) => {
    if (!isEditing || !onScaleChange) return;
    
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialScale = scale;
    const centerX = (containerRef.current?.getBoundingClientRect().width || 0) / 2;
    const centerY = (containerRef.current?.getBoundingClientRect().height || 0) / 2;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      // Calculate scale change based on diagonal movement
      let scaleDelta = 0;
      if (corner === 'se' || corner === 'ne') {
        scaleDelta = (deltaX + (corner === 'se' ? deltaY : -deltaY)) / 100;
      } else {
        scaleDelta = (-deltaX + (corner === 'sw' ? deltaY : -deltaY)) / 100;
      }
      
      const newScale = Math.max(0.2, Math.min(3, initialScale + scaleDelta));
      onScaleChange(newScale);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [isEditing, scale, onScaleChange]);

  if (!polylineEncoded || !svgContent) return null;

  const scaledWidth = dimensions.width * scale;
  const scaledHeight = dimensions.height * scale;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className={`absolute z-[25] ${isEditing ? 'cursor-move touch-none' : 'pointer-events-none'} ${className}`}
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        width: scaledWidth,
        height: scaledHeight,
      }}
    >
      {/* Selection ring and resize handles */}
      {isSelected && isEditing && (
        <>
          <div className="absolute inset-0 ring-2 ring-[#CCFF00] rounded pointer-events-none" />
          {/* Corner resize handles */}
          {['nw', 'ne', 'sw', 'se'].map((corner) => (
            <div
              key={corner}
              onPointerDown={(e) => handleResizePointerDown(e, corner)}
              className={`absolute w-3 h-3 bg-[#CCFF00] rounded-full cursor-${corner}-resize z-50`}
              style={{
                top: corner.includes('n') ? -6 : 'auto',
                bottom: corner.includes('s') ? -6 : 'auto',
                left: corner.includes('w') ? -6 : 'auto',
                right: corner.includes('e') ? -6 : 'auto',
              }}
            />
          ))}
        </>
      )}
      
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          display: 'block', 
          overflow: 'visible',
          ...(pixelated ? { imageRendering: 'pixelated' as const, shapeRendering: 'crispEdges' as const } : {})
        }}
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {/* Strong shadow for outlined */}
          <filter id="strong-shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="black" floodOpacity="0.8"/>
          </filter>
          {/* 3D depth effect */}
          <filter id="depth-3d">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
            <feOffset in="blur" dx="3" dy="3" result="offsetBlur"/>
            <feMerge>
              <feMergeNode in="offsetBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {/* Pixelated/blocky filter */}
          <filter id="pixelate" x="0%" y="0%" width="100%" height="100%">
            <feFlood x="4" y="4" height="2" width="2"/>
            <feComposite width="8" height="8"/>
            <feTile result="tile"/>
            <feComposite in="SourceGraphic" in2="tile" operator="in"/>
            <feMorphology operator="dilate" radius="2"/>
          </filter>
        </defs>

        {/* Invisible hit area for easier clicking */}
        <polyline
          points={svgContent}
          fill="none"
          stroke="transparent"
          strokeWidth={Math.max(20, strokeWidth + 15)}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ cursor: isEditing ? 'move' : 'default' }}
        />
        
        {/* Shadow/offset layer - rendered first so it's behind everything */}
        {shadowOffset && (
          <g transform={`translate(${shadowOffset.x}, ${shadowOffset.y})`}>
            <polyline
              points={svgContent}
              fill="none"
              stroke={shadowColor}
              strokeWidth={strokeWidth + (outline ? outlineWidth * 2 : 0)}
              strokeLinecap={pixelated ? 'butt' : 'round'}
              strokeLinejoin={pixelated ? 'miter' : 'round'}
              opacity={shadowOpacity}
            />
          </g>
        )}

        {/* Style-specific rendering */}
        {style === 'smooth' && (
          <>
            {sketchy ? (
              /* Sketchy mode: multiple thin irregular lines for hand-drawn effect */
              <>
                {/* Multiple offset strokes to create sketchy irregular look */}
                <g transform="translate(1.5, -1.5)">
                  <polyline
                    points={svgContent}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={opacity * 0.6}
                    strokeDasharray="none"
                  />
                </g>
                <g transform="translate(-1, 2)">
                  <polyline
                    points={svgContent}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={opacity * 0.5}
                    strokeDasharray="none"
                  />
                </g>
                <g transform="translate(0.5, 1)">
                  <polyline
                    points={svgContent}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={0.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={opacity * 0.4}
                    strokeDasharray="none"
                  />
                </g>
                {/* Main center line */}
                <polyline
                  points={svgContent}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={opacity}
                />
              </>
            ) : outlineOnly ? (
              /* Outline-only mode: render as hollow stroke (like outline font) using mask */
              <>
                <defs>
                  <mask id="hollow-route-mask">
                    {/* White = visible, Black = hidden */}
                    {/* Outer stroke - visible */}
                    <polyline
                      points={svgContent}
                      fill="none"
                      stroke="white"
                      strokeWidth={strokeWidth + outlineWidth * 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Inner stroke - punch out the middle */}
                    <polyline
                      points={svgContent}
                      fill="none"
                      stroke="black"
                      strokeWidth={Math.max(1, strokeWidth)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </mask>
                </defs>
                {/* Apply the hollow mask to a solid colored stroke */}
                <polyline
                  points={svgContent}
                  fill="none"
                  stroke={outlineColor}
                  strokeWidth={strokeWidth + outlineWidth * 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={opacity}
                  mask="url(#hollow-route-mask)"
                />
              </>
            ) : (
              /* Normal mode */
              <>
                {/* Outline layer (if enabled) */}
                {outline && (
                  <polyline
                    points={svgContent}
                    fill="none"
                    stroke={outlineColor}
                    strokeWidth={strokeWidth + 2 + (outlineWidth * 2)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {/* Soft shadow */}
                <polyline
                  points={svgContent}
                  fill="none"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={strokeWidth + 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'blur(3px)' }}
                />
                {/* Main line */}
                <polyline
                  points={svgContent}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={opacity}
                />
              </>
            )}
          </>
        )}

        {style === 'sharp' && (
          <>
            {/* Outline layer (if enabled) */}
            {outline && (
              <polyline
                points={svgContent}
                fill="none"
                stroke={outlineColor}
                strokeWidth={strokeWidth + (outlineWidth * 2)}
                strokeLinecap="butt"
                strokeLinejoin="miter"
              />
            )}
            {/* Hard shadow */}
            <polyline
              points={svgContent}
              fill="none"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeLinejoin="miter"
            />
            {/* Main sharp line */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeLinejoin="miter"
              opacity={opacity}
            />
          </>
        )}

        {style === 'glow' && (
          <>
            {/* Outline layer (if enabled) */}
            {outline && (
              <polyline
                points={svgContent}
                fill="none"
                stroke={outlineColor}
                strokeWidth={strokeWidth + 6 + (outlineWidth * 2)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Outer glow */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth + 6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity * 0.3}
              style={{ filter: 'blur(8px)' }}
            />
            {/* Inner glow */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth + 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity * 0.6}
              style={{ filter: 'blur(4px)' }}
            />
            {/* Core line */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
          </>
        )}

        {style === 'dashed' && (
          <>
            {/* Outline layer (if enabled) */}
            {outline && (
              <polyline
                points={svgContent}
                fill="none"
                stroke={outlineColor}
                strokeWidth={strokeWidth + 2 + (outlineWidth * 2)}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="12 8"
              />
            )}
            {/* Shadow */}
            <polyline
              points={svgContent}
              fill="none"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={strokeWidth + 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="12 8"
              style={{ filter: 'blur(2px)' }}
            />
            {/* Dashed line */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="12 8"
              opacity={opacity}
            />
          </>
        )}

        {style === 'dotted' && (
          <>
            {/* Outline layer (if enabled) */}
            {outline && (
              <polyline
                points={svgContent}
                fill="none"
                stroke={outlineColor}
                strokeWidth={strokeWidth + 2 + (outlineWidth * 2)}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="2 6"
              />
            )}
            {/* Shadow */}
            <polyline
              points={svgContent}
              fill="none"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={strokeWidth + 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2 6"
              style={{ filter: 'blur(2px)' }}
            />
            {/* Dotted line */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2 6"
              opacity={opacity}
            />
          </>
        )}

        {style === 'animated' && (
          <>
            {/* Outline layer (if enabled) */}
            {outline && (
              <polyline
                points={svgContent}
                fill="none"
                stroke={outlineColor}
                strokeWidth={strokeWidth + 8 + (outlineWidth * 2)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Cartoonish thick outline */}
            <polyline
              points={svgContent}
              fill="none"
              stroke="rgba(0,0,0,0.9)"
              strokeWidth={strokeWidth + 8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Textured middle layer with pattern */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
              strokeDasharray="3 1"
            />
            {/* Inner highlight for cartoon effect */}
            <polyline
              points={svgContent}
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8 4"
            />
          </>
        )}

        {style === '3d' && (
          <>
            {/* Outline layer (if enabled) */}
            {outline && (
              <polyline
                points={svgContent}
                fill="none"
                stroke={outlineColor}
                strokeWidth={strokeWidth + 4 + (outlineWidth * 2)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Deep shadow for 3D depth */}
            <polyline
              points={svgContent}
              fill="none"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={strokeWidth + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'blur(4px)', transform: 'translate(4px, 4px)' }}
            />
            {/* Mid shadow layer */}
            <polyline
              points={svgContent}
              fill="none"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={strokeWidth + 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'blur(2px)', transform: 'translate(2px, 2px)' }}
            />
            {/* Highlight edge */}
            <polyline
              points={svgContent}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={strokeWidth * 0.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: 'translate(-1px, -1px)' }}
            />
            {/* Main 3D line */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
          </>
        )}

        {style === 'neon' && (
          <>
            <style>{`
              @keyframes neon-glow {
                0%, 100% { filter: drop-shadow(0 0 8px ${strokeColor}) drop-shadow(0 0 16px ${strokeColor}); }
                50% { filter: drop-shadow(0 0 12px ${strokeColor}) drop-shadow(0 0 24px ${strokeColor}); }
              }
            `}</style>
            {/* Outline layer (if enabled) */}
            {outline && (
              <polyline
                points={svgContent}
                fill="none"
                stroke={outlineColor}
                strokeWidth={strokeWidth + 8 + (outlineWidth * 2)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Outer neon glow */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth + 8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity * 0.2}
              style={{ filter: `blur(12px)` }}
            />
            {/* Middle glow */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity * 0.4}
              style={{ filter: `blur(6px)` }}
            />
            {/* Core neon line */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
              style={{ animation: 'neon-glow 2s ease-in-out infinite' }}
            />
          </>
        )}

        {style === 'gradient' && (
          <>
            <defs>
              <linearGradient id={`route-gradient-${strokeColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="25%" stopColor="#feca57" />
                <stop offset="50%" stopColor="#48dbfb" />
                <stop offset="75%" stopColor="#ff9ff3" />
                <stop offset="100%" stopColor="#54a0ff" />
              </linearGradient>
            </defs>
            {/* Outline layer (if enabled) */}
            {outline && (
              <polyline
                points={svgContent}
                fill="none"
                stroke={outlineColor}
                strokeWidth={strokeWidth + 3 + (outlineWidth * 2)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Shadow */}
            <polyline
              points={svgContent}
              fill="none"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth={strokeWidth + 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'blur(4px)' }}
            />
            {/* Gradient line */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={`url(#route-gradient-${strokeColor.replace('#', '')})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
          </>
        )}

        {style === 'pulse' && (
          <>
            <style>{`
              @keyframes pulse-scale {
                0%, 100% { stroke-width: ${strokeWidth}px; opacity: ${opacity}; }
                50% { stroke-width: ${strokeWidth + 3}px; opacity: ${opacity * 0.7}; }
              }
            `}</style>
            {/* Outline layer (if enabled) */}
            {outline && (
              <polyline
                points={svgContent}
                fill="none"
                stroke={outlineColor}
                strokeWidth={strokeWidth + 4 + (outlineWidth * 2)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Pulsing shadow */}
            <polyline
              points={svgContent}
              fill="none"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={strokeWidth + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'blur(3px)' }}
            />
            {/* Main pulsing line */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: 'pulse-scale 2s ease-in-out infinite' }}
            />
          </>
        )}

        {style === 'trail' && (
          <>
            <style>{`
              @keyframes trail-dash {
                to { stroke-dashoffset: -50; }
              }
            `}</style>
            {/* Outline layer (if enabled) */}
            {outline && (
              <polyline
                points={svgContent}
                fill="none"
                stroke={outlineColor}
                strokeWidth={strokeWidth + 4 + (outlineWidth * 2)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Multiple trailing layers */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity * 0.2}
              strokeDasharray="10 5"
            />
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth + 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity * 0.4}
              strokeDasharray="8 4"
            />
            {/* Animated trail line */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
              strokeDasharray="20 10"
              style={{ animation: 'trail-dash 2s linear infinite' }}
            />
          </>
        )}

        {style === 'striped' && (
          <>
            {/* Multiple layered outlines for striped/3D effect like "HOLY SPIRIT" text */}
            {/* Outermost dark layer */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={outlineColor}
              strokeWidth={strokeWidth + 20}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Light stripe */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth + 18}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dark stripe */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={outlineColor}
              strokeWidth={strokeWidth + 16}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Light stripe */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth + 14}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dark stripe */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={outlineColor}
              strokeWidth={strokeWidth + 12}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Light stripe */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth + 10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dark stripe */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={outlineColor}
              strokeWidth={strokeWidth + 8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Light stripe */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth + 6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dark stripe */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={outlineColor}
              strokeWidth={strokeWidth + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Light stripe */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth + 2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner core */}
            <polyline
              points={svgContent}
              fill="none"
              stroke={outlineColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
          </>
        )}
      </svg>
    </div>
  );
});
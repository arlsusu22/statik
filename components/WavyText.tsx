import React from 'react';

interface WavyTextProps {
  text: string;
  color?: string;
  fontSize?: number;
  waveIntensity?: number;
  className?: string;
}

/**
 * WavyText - Creates a retro, psychedelic wavy text effect
 * Similar to vintage poster typography with flowing, organic letter shapes
 */
export const WavyText: React.FC<WavyTextProps> = ({
  text = 'TAKE IT EASY',
  color = '#E63946',
  fontSize = 48,
  waveIntensity = 8,
  className = '',
}) => {
  // Split text into lines (each word on its own line for stacked effect)
  const lines = text.split(' ').filter(Boolean);
  
  // Generate unique wave path for each character
  const generateWavyChar = (char: string, charIndex: number, lineIndex: number) => {
    // Create a wavy baseline offset for each character
    const waveOffset = Math.sin((charIndex + lineIndex * 3) * 0.8) * waveIntensity;
    const rotateAngle = Math.sin((charIndex + lineIndex * 2) * 0.6) * 3;
    const scaleX = 1 + Math.sin((charIndex + lineIndex) * 0.5) * 0.08;
    
    return (
      <span
        key={`${lineIndex}-${charIndex}`}
        style={{
          display: 'inline-block',
          transform: `translateY(${waveOffset}px) rotate(${rotateAngle}deg) scaleX(${scaleX})`,
          fontFamily: '"Modak", "Lilita One", cursive',
          fontWeight: 400,
          letterSpacing: '-0.02em',
        }}
      >
        {char}
      </span>
    );
  };

  return (
    <div 
      className={`flex flex-col items-center leading-none ${className}`}
      style={{
        fontSize: `${fontSize}px`,
        color: color,
        textShadow: `
          2px 2px 0px rgba(0,0,0,0.15),
          4px 4px 8px rgba(0,0,0,0.1)
        `,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      }}
    >
      {lines.map((line, lineIndex) => (
        <div 
          key={lineIndex} 
          className="flex justify-center"
          style={{
            marginTop: lineIndex > 0 ? `-${fontSize * 0.15}px` : 0,
          }}
        >
          {line.split('').map((char, charIndex) => 
            generateWavyChar(char, charIndex, lineIndex)
          )}
        </div>
      ))}
    </div>
  );
};

// SVG-based wavy text for more precise control
export const WavyTextSVG: React.FC<WavyTextProps> = ({
  text = 'TAKE IT EASY',
  color = '#E63946',
  fontSize = 48,
  waveIntensity = 6,
  className = '',
}) => {
  const lines = text.split(' ').filter(Boolean);
  const lineHeight = fontSize * 0.85;
  const svgHeight = lines.length * lineHeight + fontSize * 0.3;
  const svgWidth = Math.max(...lines.map(l => l.length)) * fontSize * 0.65;

  return (
    <svg 
      className={className}
      width={svgWidth} 
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
    >
      <defs>
        {/* Wavy text path for each line */}
        {lines.map((_, lineIndex) => {
          const y = (lineIndex + 0.8) * lineHeight;
          const pathId = `wavePath-${lineIndex}`;
          
          // Create a gentle wave path
          const points: string[] = [];
          const steps = 20;
          for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * svgWidth;
            const waveY = y + Math.sin((i / steps) * Math.PI * 2 + lineIndex) * waveIntensity;
            points.push(`${i === 0 ? 'M' : 'L'} ${x},${waveY}`);
          }
          
          return (
            <path 
              key={pathId}
              id={pathId} 
              d={points.join(' ')} 
              fill="none" 
            />
          );
        })}
      </defs>
      
      {lines.map((line, lineIndex) => (
        <text
          key={lineIndex}
          fill={color}
          style={{
            fontFamily: '"Modak", "Lilita One", cursive',
            fontSize: `${fontSize}px`,
            fontWeight: 400,
          }}
        >
          <textPath 
            href={`#wavePath-${lineIndex}`} 
            startOffset="50%" 
            textAnchor="middle"
          >
            {line}
          </textPath>
        </text>
      ))}
    </svg>
  );
};

// Preset wavy text stickers
export const WAVY_TEXT_PRESETS = [
  { text: 'TAKE IT EASY', color: '#E63946' },
  { text: 'GOOD VIBES', color: '#F77F00' },
  { text: 'KEEP MOVING', color: '#2A9D8F' },
  { text: 'RUN HAPPY', color: '#E9C46A' },
  { text: 'STAY WILD', color: '#9B5DE5' },
  { text: 'JUST RUN', color: '#00BBF9' },
  { text: 'EASY DOES IT', color: '#F15BB5' },
  { text: 'SLOW DOWN', color: '#00F5D4' },
] as const;

export default WavyText;

import React from 'react';

// Real Berlin Marathon route from GPX data
const berlinMarathonPath = `
  M 95.3 123.2 L 86.1 123.6 L 85.5 123.4 L 84.5 123.4 L 83.9 123.7 L 73.2 124.6 
  L 68.1 125.0 L 57.3 125.5 L 57.1 124.7 L 57.0 123.8 L 58.9 121.4 L 63.0 116.5 
  L 63.1 116.0 L 64.3 115.5 L 65.8 114.3 L 74.2 112.5 L 76.3 112.7 L 82.6 113.5 
  L 94.1 115.0 L 98.1 115.4 L 103.2 116.1 L 105.7 117.4 L 111.7 116.2 L 121.2 114.7 
  L 122.9 113.1 L 122.5 111.1 L 127.2 110.1 L 133.0 108.8 L 136.3 108.7 L 141.1 108.8 
  L 148.3 110.3 L 151.4 111.5 L 153.6 112.5 L 155.1 113.4 L 152.9 115.3 L 162.5 119.3 
  L 164.7 119.6 L 164.3 120.2 L 163.4 120.9 L 161.3 123.5 L 159.8 125.1 L 158.7 126.4 
  L 154.7 128.1 L 151.7 128.1 L 146.7 134.5 L 146.0 134.9 L 146.0 135.3 L 145.3 137.0 
  L 153.6 139.7 L 154.2 139.9 L 155.0 141.6 L 155.7 142.5 L 159.7 148.8 L 160.0 152.2 
  L 157.3 151.5 L 150.3 150.6 L 142.3 149.3 L 137.0 148.5 L 133.5 147.7 L 125.5 146.2 
  L 118.8 144.9 L 111.9 147.1 L 107.3 146.3 L 101.1 145.1 L 96.1 144.4 L 95.7 147.6 
  L 94.4 148.2 L 91.6 148.5 L 84.6 149.2 L 79.7 149.8 L 79.8 153.3 L 79.8 154.6 
  L 79.9 155.2 L 79.7 156.2 L 79.7 158.5 L 79.1 160.0 L 77.1 161.6 L 68.6 168.6 
  L 66.5 169.6 L 64.0 168.0 L 63.7 167.5 L 62.6 167.6 L 58.1 167.4 L 52.0 168.4 
  L 43.8 171.4 L 41.1 171.3 L 31.4 169.8 L 23.9 168.3 L 19.6 165.5 L 15.0 162.1 
  L 19.0 159.5 L 27.1 155.0 L 34.3 151.2 L 36.8 150.5 L 41.0 150.5 L 48.3 148.5 
  L 47.1 147.2 L 44.6 144.8 L 45.8 142.0 L 47.3 139.0 L 47.5 138.4 L 53.7 137.1 
  L 62.0 135.7 L 69.7 134.1 L 71.2 134.4 L 76.5 136.5 L 77.7 137.0 L 80.5 137.4 
  L 88.5 138.7 L 97.1 140.7 L 98.2 138.4 L 101.3 134.9 L 102.8 133.6 L 103.6 132.5 
  L 105.0 130.1 L 106.8 129.5 L 113.2 128.9 L 120.9 128.4 L 132.2 127.5 L 128.5 123.4 
  L 116.4 122.0 L 108.3 122.4
`;

// RETRO style configuration
const RETRO_STYLE = {
  font: '"Teko", sans-serif',
  textColor: '#ca6702',
  labelColor: '#F5F0E6',
  routeColor: '#0a9396',
  routeStrokeWidth: 6,
  routeOutlineColor: '#000000',
  routeOutlineWidth: 3,
  shadowOffset: { x: 4, y: 4 },
  shadowColor: 'rgba(0,0,0,0.7)',
};

interface BerlinMarathonPreviewProps {
  width?: number;
  height?: number;
}

export const BerlinMarathonPreview: React.FC<BerlinMarathonPreviewProps> = ({
  width = 1080,
  height = 1920,
}) => {
  const scale = Math.min(width / 1080, height / 1920);
  
  // Text shadow style for retro look
  const retroTextStyle: React.CSSProperties = {
    fontFamily: RETRO_STYLE.font,
    color: RETRO_STYLE.textColor,
    textShadow: `
      2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000,
      4px 4px 0 rgba(0,0,0,0.7)
    `,
    fontWeight: 'bold',
    letterSpacing: '0.05em',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: RETRO_STYLE.font,
    color: RETRO_STYLE.labelColor,
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontSize: `${24 * scale}px`,
    opacity: 0.8,
    fontWeight: '400',
  };

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        backgroundColor: '#1a1a1a',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Signature checkerboard transparency background */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.3,
          backgroundImage: `
            linear-gradient(45deg, #222 25%, transparent 25%), 
            linear-gradient(-45deg, #222 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #222 75%), 
            linear-gradient(-45deg, transparent 75%, #222 75%)
          `,
          backgroundSize: '10px 10px',
          backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
        }}
      />

      {/* Title at top */}
      <div
        style={{
          padding: `${60 * scale}px ${40 * scale}px ${30 * scale}px`,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <h1
          style={{
            ...retroTextStyle,
            fontSize: `${72 * scale}px`,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          BERLIN MARATHON
        </h1>
      </div>

      {/* Route in center */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${20 * scale}px`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <svg
          viewBox="0 0 180 200"
          style={{
            width: '85%',
            height: 'auto',
            maxHeight: '60%',
          }}
        >
          {/* Shadow layer */}
          <path
            d={berlinMarathonPath}
            fill="none"
            stroke={RETRO_STYLE.shadowColor}
            strokeWidth={RETRO_STYLE.routeStrokeWidth + RETRO_STYLE.routeOutlineWidth * 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={`translate(${RETRO_STYLE.shadowOffset.x}, ${RETRO_STYLE.shadowOffset.y})`}
          />
          {/* Outline layer */}
          <path
            d={berlinMarathonPath}
            fill="none"
            stroke={RETRO_STYLE.routeOutlineColor}
            strokeWidth={RETRO_STYLE.routeStrokeWidth + RETRO_STYLE.routeOutlineWidth * 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Main route */}
          <path
            d={berlinMarathonPath}
            fill="none"
            stroke={RETRO_STYLE.routeColor}
            strokeWidth={RETRO_STYLE.routeStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Start marker */}
          <circle
            cx="95.3"
            cy="123.2"
            r="8"
            fill={RETRO_STYLE.routeColor}
            stroke={RETRO_STYLE.routeOutlineColor}
            strokeWidth="3"
          />
        </svg>
      </div>

      {/* Stats at bottom */}
      <div
        style={{
          padding: `${40 * scale}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: `${30 * scale}px`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Distance */}
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>DISTANCE</div>
          <div
            style={{
              ...retroTextStyle,
              fontSize: `${120 * scale}px`,
              lineHeight: 1,
            }}
          >
            42.195
          </div>
          <div
            style={{
              ...retroTextStyle,
              fontSize: `${48 * scale}px`,
              marginTop: `${-10 * scale}px`,
            }}
          >
            KM
          </div>
        </div>

        {/* Time and Pace row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            gap: `${20 * scale}px`,
          }}
        >
          {/* Time */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={labelStyle}>TIME</div>
            <div
              style={{
                ...retroTextStyle,
                fontSize: `${64 * scale}px`,
                lineHeight: 1.1,
              }}
            >
              3:28:45
            </div>
          </div>

          {/* Pace */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={labelStyle}>PACE</div>
            <div
              style={{
                ...retroTextStyle,
                fontSize: `${64 * scale}px`,
                lineHeight: 1.1,
              }}
            >
              4:57
            </div>
            <div
              style={{
                ...retroTextStyle,
                fontSize: `${28 * scale}px`,
                marginTop: `${-5 * scale}px`,
              }}
            >
              /KM
            </div>
          </div>
        </div>

        {/* Elevation */}
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>ELEVATION</div>
          <div
            style={{
              ...retroTextStyle,
              fontSize: `${56 * scale}px`,
              lineHeight: 1.1,
            }}
          >
            58 M
          </div>
        </div>
      </div>
    </div>
  );
};

export default BerlinMarathonPreview;

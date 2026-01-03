import React from 'react';

// Real NYC Marathon route from GPX data (Nov 3, 2024 - Wikiloc)
// Route: Staten Island → Brooklyn → Queens → Bronx → Manhattan/Central Park
// Transformed to fit nicely in SVG with proper orientation (north up)
// x = (lon - (-74.065)) * 2500, y = (40.82 - lat) * 2500
const nycMarathonPath = `
  M 8 545 L 16 545 L 19 544 L 33 540 L 37 539 L 42 538 
  L 52 536 L 86 529 L 90 527 L 95 525 L 99 522 L 105 516 
  L 108 514 L 109 514 L 98 505 L 105 493 L 107 491 L 117 481 
  L 126 473 L 180 388 L 191 366 L 196 358 L 207 344 L 214 338 
  L 217 341 L 218 341 L 197 312 L 195 310 L 194 305 L 186 291 
  L 180 283 L 194 288 L 198 290 L 200 290 L 203 291 L 175 269 
  L 166 265 L 163 262 L 155 252 L 141 264 L 139 266 L 137 269 
  L 159 256 L 161 254 L 163 248 L 174 250 L 184 252 L 199 248 
  L 203 247 L 201 253 L 202 254 L 215 249 L 219 247 L 220 246 
  L 214 231 L 213 229 L 217 228 L 214 230 L 205 239 L 204 241 
  L 200 244 L 197 248 L 167 268 L 130 297 L 121 302 L 115 307 
  L 108 312 L 101 307 L 92 310 L 86 314 L 79 318 L 73 324 
  L 66 331 L 58 335 L 43 350 L 38 355 L 35 359 L 29 368 
  L 21 379 L 17 384 L 11 394 L 7 400 L 1 409 L -6 418 
  L -12 425 L -19 429 L -28 437 L -37 444 L -43 448 L -51 453 
  L -56 456 L -75 470 L -79 474 L -120 505 L -124 508 L -140 525 
  L -148 535 L -153 539 L -154 539 L -145 527 L -143 526 L -137 521 
  L -133 519 L -139 528 L -140 529 L -146 527 L -152 523 L -153 523 
  L -156 527 L -150 532 L -147 535 L -158 547 L -163 555 L -163 566 
  L -166 574 L -165 576 L -124 551 L -121 552 L -116 556 L -119 562 
  L -119 564 L -125 569 L -131 573 L -133 573 L -137 567 L -139 567 
  L -153 579 L -168 591 L -178 596 L -180 599 L -192 608 L -200 614 
  L -207 619 L -210 622 L -217 627 L -225 634 L -230 639 L -235 642 
  L -238 644 L -245 650 L -251 658 L -254 663 L -260 669 L -265 672 
  L -271 670 L -275 673 L -279 676 L -278 682 L -275 688 L -272 695 
  L -268 703 L -263 713 L -262 714 L -259 707 L -256 704 L -250 699 
  L -244 692 L -239 689
`;

// RETRO style configuration
const RETRO_STYLE = {
  font: '"Teko", sans-serif',
  textColor: '#ca6702',
  labelColor: '#F5F0E6',
  routeColor: '#0a9396',
  routeStrokeWidth: 3,
  routeOutlineColor: '#000000',
  routeOutlineWidth: 1.5,
  shadowOffset: { x: 2, y: 2 },
  shadowColor: 'rgba(0,0,0,0.7)',
};

interface NYCMarathonPreviewProps {
  width?: number;
  height?: number;
}

export const NYCMarathonPreview: React.FC<NYCMarathonPreviewProps> = ({
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
            fontSize: `${64 * scale}px`,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          NYC MARATHON
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
          viewBox="-310 200 380 540"
          style={{
            width: '85%',
            height: 'auto',
            maxHeight: '60%',
          }}
        >
          {/* Shadow layer */}
          <path
            d={nycMarathonPath}
            fill="none"
            stroke={RETRO_STYLE.shadowColor}
            strokeWidth={RETRO_STYLE.routeStrokeWidth + RETRO_STYLE.routeOutlineWidth * 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={`translate(${RETRO_STYLE.shadowOffset.x}, ${RETRO_STYLE.shadowOffset.y})`}
          />
          {/* Outline layer */}
          <path
            d={nycMarathonPath}
            fill="none"
            stroke={RETRO_STYLE.routeOutlineColor}
            strokeWidth={RETRO_STYLE.routeStrokeWidth + RETRO_STYLE.routeOutlineWidth * 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Main route */}
          <path
            d={nycMarathonPath}
            fill="none"
            stroke={RETRO_STYLE.routeColor}
            strokeWidth={RETRO_STYLE.routeStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Start marker - Staten Island */}
          <circle
            cx="8"
            cy="545"
            r="10"
            fill="#22c55e"
            stroke={RETRO_STYLE.routeOutlineColor}
            strokeWidth="2"
          />
          {/* Finish marker - Central Park */}
          <circle
            cx="-239"
            cy="689"
            r="10"
            fill="#ef4444"
            stroke={RETRO_STYLE.routeOutlineColor}
            strokeWidth="2"
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
              3:53:14
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
              5:32
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
            243 M
          </div>
        </div>
      </div>
    </div>
  );
};

export default NYCMarathonPreview;

import React, { useState, useEffect } from 'react';

const COLORS_LIGHT = ['#7DD3D8', '#4A7BC7', '#F5A623', '#FFDC00', '#4CAF50', '#9C27B0', '#DC143C'];
const COLORS_DARK = ['#5AA0A5', '#3A6294', '#C88820', '#C8B000', '#3E8A40', '#7A2090', '#A01030'];

function getRandomColor(isDark) {
  const colors = isDark ? COLORS_DARK : COLORS_LIGHT;
  return colors[Math.floor(Math.random() * colors.length)];
}

function TetrisPiece({ piece, isDark }) {
  const [color, setColor] = useState(null);
  const [showText, setShowText] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 500);
  const isCV = piece.label === 'cv';
  const isFeatured = piece.featured;
      const alwaysShowText = true;
 
  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 500);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleMouseEnter = () => {
    if (!isCV) setColor(piece.hoverColor);
    setShowText(true);
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    if (!isCV) setColor(null);
    setShowText(false);
    setIsHovered(false);
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (piece.link) {
      window.open(piece.link, '_blank', 'noopener,noreferrer');
    }
  };
  
  // For desktop: start gray, show hover color when hovering
// For mobile: use actual color (will be animated)
const bgColor = piece.label === 'cv' 
  ? piece.color 
  : (isDark || isMobile) 
    ? (color || piece.color) 
    : '#cccccc'; // Start gray for desktop
  const rowDelay = piece.startY * 8;
  const textColor = '#ffffff';
  const isStatic = piece.label === 'cv' || piece.featured;
  
  const containerStyle = {
    gridColumn: `${piece.startX + 1} / span ${piece.w}`,
    gridRow: `${piece.startY + 1} / span ${piece.h}`,
    position: 'relative',
    cursor: piece.link ? 'pointer' : 'default',
    animation: isStatic 
      ? `dropIn 0.5s ease-out forwards` 
      : `dropIn 0.5s ease-out forwards, blink 3s ease-in-out ${rowDelay}s infinite`,
    animationFillMode: 'forwards',
  };

  // For desktop: use hoverColor when hovering, otherwise gray
// For mobile: use blinkColor for animation (will start dim via animation)
const bgStyle = {
    position: 'absolute',
    inset: 0,
    backgroundColor: isDark || isMobile 
      ? (color || bgColor)  // Use actual color for blink animation
      : (isHovered ? (piece.hoverColor || color) : '#cccccc'), // Hover color or gray
    transition: 'background-color 0.15s ease',
  };

  const textStyle = {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    fontSize: 'clamp(8px, 1.5vw, 12px)',
    fontWeight: '500',
    textTransform: 'lowercase',
    color: textColor,
    opacity: alwaysShowText ? 1 : (showText ? 1 : 0),
    transition: 'opacity 0.15s ease, color 0.15s ease',
    zIndex: 1,
  };
  
  const className = 'tetris-piece show';
  
  // CV block shows looping video
  if (isCV) {
    return (
      <div style={containerStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <a 
          href={piece.link} 
          target="_blank" 
          rel="noopener"
          style={{...bgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 1,
              border: 'none',
              outline: 'none',
            }}
          >
            <source src="/cv-video.mp4" type="video/mp4" />
          </video>
        </a>
        <span style={{...textStyle, color: '#fff'}}>{piece.label}</span>
      </div>
    );
  }

  const wrapperStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
  };
  
  if (piece.link) {
    return (
      <div 
        style={containerStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onTouchEnd={handleClick}
      >
        <a 
          href={piece.link} 
          target="_blank" 
          rel="noopener"
          style={{...bgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
        >
          <div style={wrapperStyle}>
            <span style={textStyle}>{piece.label}</span>
          </div>
        </a>
      </div>
    );
  }
  
  return (
    <div 
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={bgStyle}></div>
      <div style={wrapperStyle}>
        <span style={{...textStyle, cursor: 'default'}}>{piece.label}</span>
      </div>
    </div>
  );
}

function App() {
  const [isDark, setIsDark] = useState(() => {
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18;
  });
  const [seed, setSeed] = useState(() => Math.random());
  
  const shuffleLayout = () => {
    const items = [
      { w: 4, h: 1, label: 'rm8pfix', link: 'https://rm8pfix.khoavo.myds.me', color: '#E8E8E8', colorDark: '#333333', hoverColor: '#00BCD4', blinkColor: '#6DD5D6' },
      { w: 2, h: 2, label: 'netflix', link: 'https://nf.khoavo.myds.me', color: '#E8E8E8', colorDark: '#3a3a3a', hoverColor: '#FF9800', blinkColor: '#E6A84A' },
      { w: 2, h: 3, label: 'portfolio', link: 'https://portfolio.khoavo.myds.me', featured: true, color: '#4A7BC7', colorDark: '#2d4a7c', hoverColor: '#2196F3', blinkColor: '#6B8BC9' },
      { w: 2, h: 3, label: 'cv', link: 'https://cv.khoavo.myds.me', color: '#616161', colorDark: '#424242', hoverColor: '#424242', blinkColor: '#888888' },
      { w: 2, h: 2, label: 'youtube', link: 'https://ut.khoavo.myds.me', color: '#E8E8E8', colorDark: '#3a3a3a', hoverColor: '#FF5722', blinkColor: '#D97856' },
      { w: 2, h: 2, label: 'tiktok', link: 'https://tt.khoavo.myds.me', color: '#E8E8E8', colorDark: '#3a3a3a', hoverColor: '#9C27B0', blinkColor: '#B87ABF' },
      { w: 3, h: 2, label: 'spotify', link: 'https://sp.khoavo.myds.me', color: '#E8E8E8', colorDark: '#3a3a3a', hoverColor: '#4CAF50', blinkColor: '#78B578' },
      { w: 3, h: 2, label: 'tools', link: 'https://it.khoavo.myds.me', color: '#E8E8E8', colorDark: '#3a3a3a', hoverColor: '#FFC107', blinkColor: '#E6C449' },
      { w: 2, h: 2, label: 'save', link: 'https://save.khoavo.myds.me', color: '#E8E8E8', colorDark: '#3a3a3a', hoverColor: '#E91E63', blinkColor: '#D0648A' },
      { w: 2, h: 2, label: 'free', link: 'https://free.khoavo.myds.me', color: '#E8E8E8', colorDark: '#3a3a3a', hoverColor: '#00BCD4', blinkColor: '#6DD5D6' },
      { w: 2, h: 2, label: 'jpg', link: 'https://jpg.khoavo.myds.me', color: '#E8E8E8', colorDark: '#3a3a3a', hoverColor: '#673AB7', blinkColor: '#9A88BF' },
      { w: 2, h: 2, label: 'pdf', link: 'https://pdf.khoavo.myds.me', color: '#E8E8E8', colorDark: '#3a3a3a', hoverColor: '#795548', blinkColor: '#A6917C' },
    ];
    
    const random = (s) => {
      const x = Math.sin(s * 9999) * 10000;
      return x - Math.floor(x);
    };
    
    // Sort items by size (larger first) to make placement easier
    const sortedItems = [...items].sort((a, b) => (b.w * b.h) - (a.w * a.h));
    
    // Shuffle the sorted items
    for (let i = sortedItems.length - 1; i > 0; i--) {
      const j = Math.floor(random(seed + i * 100) * (i + 1));
      [sortedItems[i], sortedItems[j]] = [sortedItems[j], sortedItems[i]];
    }
    
    const gridRows = 10;
    const gridCols = 10;
    const grid = Array(gridRows).fill(null).map(() => Array(gridCols).fill(0));
    const placed = [];
    
    for (const item of sortedItems) {
      let fits = false;
      let bestPos = null;
      let minOverlap = Infinity;
      
      // Try many random positions
      for (let attempt = 0; attempt < 500; attempt++) {
        const r1 = random(seed + attempt * 7 + item.label.charCodeAt(0));
        const r2 = random(seed + attempt * 13 + item.label.charCodeAt(0));
        const row = Math.floor(r1 * (gridRows - item.h + 1));
        const col = Math.floor(r2 * (gridCols - item.w + 1));
        
        // Check if this position works
        let canPlace = true;
        let overlap = 0;
        for (let rr = row; rr < row + item.h && canPlace; rr++) {
          for (let cc = col; cc < col + item.w && canPlace; cc++) {
            if (grid[rr] && grid[rr][cc] === 1) {
              canPlace = false;
            }
          }
        }
        
        if (canPlace) {
          for (let rr = row; rr < row + item.h; rr++) {
            for (let cc = col; cc < col + item.w; cc++) {
              grid[rr][cc] = 1;
            }
          }
          placed.push({ ...item, startX: col, startY: row });
          fits = true;
          break;
        }
      }
    }
    
    return placed;
  };
  
const layout = shuffleLayout();
  const sortedLayout = [...layout].sort((a, b) => b.startY - a.startY);
  
  const toggleTheme = () => setIsDark(!isDark);
  const refreshLayout = () => setSeed(Math.random());
  
  const bg = isDark ? '#1a1a1a' : '#ffffff';
  const headerBg = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#fff' : '#000';
  const borderColor = isDark ? '#444' : '#000';
  
  return (
    <div style={{ minHeight: '100vh', height: '100%', background: bg, padding: '0 10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 12px',
        background: headerBg,
        flexWrap: 'wrap',
        gap: '8px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/" style={{ fontSize: '14px', fontWeight: '500', color: textColor }}>Khoa.vo</a>
          <span style={{ fontSize: '10px', color: isDark ? '#666' : '#999' }} className="header-tagline">where design meets intelligence</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={refreshLayout}
            style={{
              background: 'none',
              border: `1px solid ${borderColor}`,
              padding: '8px 12px',
              fontSize: '14px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              color: textColor,
              touchAction: 'manipulation',
            }}
          >
            ↻
          </button>
          <button 
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: `1px solid ${borderColor}`,
              padding: '8px 12px',
              fontSize: '14px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              color: textColor,
              touchAction: 'manipulation',
            }}
          >
            {isDark ? '☀' : '☾'}
          </button>
        </div>
      </header>

      <main className="tetris-board" key={seed} style={{ background: isDark ? '#222' : '#fff', flex: '1 1 auto', minHeight: 0 }}>
        {sortedLayout.map((piece, idx) => (
          <TetrisPiece key={piece.label} piece={piece} isDark={isDark} />
        ))}
      </main>

      <footer style={{ 
        padding: '8px 20px', 
        fontSize: '10px', 
        color: isDark ? '#888' : '#666',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <p>© {new Date().getFullYear()} — Khoa.vo</p>
      </footer>
    </div>
  );
}

export default App;
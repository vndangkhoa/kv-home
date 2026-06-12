import React, { useState, useEffect } from 'react';

const FALL_DURATION = 0.5;
const FALL_STAGGER = 0.12;

// All 19 fixed tetromino orientations as [dx, dy] offsets
const TETROMINOS = [
  // I-piece (2 orientations)
  [[0,0],[1,0],[2,0],[3,0]],  // ████
  [[0,0],[0,1],[0,2],[0,3]],  // vertical

  // O-piece (1 orientation)
  [[0,0],[1,0],[0,1],[1,1]],  // 2×2 square

  // T-piece (4 orientations)
  [[0,0],[1,0],[2,0],[1,1]],  // ███ + center below
  [[0,0],[0,1],[1,1],[0,2]],  // ⊢
  [[1,0],[0,1],[1,1],[2,1]],  // ⊥
  [[1,0],[0,1],[1,1],[1,2]],  // ⊣

  // L-piece (4 orientations)
  [[0,0],[0,1],[0,2],[1,2]],
  [[0,0],[1,0],[2,0],[0,1]],
  [[0,0],[1,0],[1,1],[1,2]],
  [[2,0],[0,1],[1,1],[2,1]],

  // J-piece (4 orientations)
  [[1,0],[1,1],[0,2],[1,2]],
  [[0,0],[0,1],[1,1],[2,1]],
  [[0,0],[1,0],[0,1],[0,2]],
  [[0,0],[1,0],[2,0],[2,1]],

  // S-piece (2 orientations)
  [[1,0],[2,0],[0,1],[1,1]],
  [[0,0],[0,1],[1,1],[1,2]],

  // Z-piece (2 orientations)
  [[0,0],[1,0],[1,1],[2,1]],
  [[1,0],[0,1],[1,1],[0,2]],
];

// Seeded pseudo-random number generator (linear congruential)
function createRandom(seed) {
  let s = Math.abs(Math.floor(seed * 100000)) % 233280 || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Generate a perfect tetromino tiling using backtracking.
// Finds the first empty cell, tries all 19 orientations (shuffled for variety),
// places the piece, and recurses. Backtracks on dead ends.
function generateTiling(cols, rows, numPieces, rng) {
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(-1));
  const pieces = new Array(numPieces).fill(null);
  let iterations = 0;
  const MAX_ITER = 100000;

  function findFirstEmpty() {
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++)
        if (grid[y][x] === -1) return { x, y };
    return null;
  }

  function solve(pieceId) {
    if (++iterations > MAX_ITER) return false;
    if (pieceId >= numPieces) return findFirstEmpty() === null;

    const empty = findFirstEmpty();
    if (!empty) return false;

    // Shuffle orientation order for variety
    const indices = TETROMINOS.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    for (const idx of indices) {
      const shape = TETROMINOS[idx];

      // Find anchor: topmost-leftmost cell of the shape (first in reading order)
      const sorted = [...shape].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
      const [ax, ay] = sorted[0];
      const ox = empty.x - ax;
      const oy = empty.y - ay;

      // Check if all 4 cells fit in the grid and are empty
      let canPlace = true;
      for (const [dx, dy] of shape) {
        const x = ox + dx, y = oy + dy;
        if (x < 0 || x >= cols || y < 0 || y >= rows || grid[y][x] !== -1) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        const cells = shape.map(([dx, dy]) => {
          const x = ox + dx, y = oy + dy;
          grid[y][x] = pieceId;
          return { x, y };
        });
        pieces[pieceId] = cells;

        if (solve(pieceId + 1)) return true;

        // Backtrack
        for (const { x, y } of cells) grid[y][x] = -1;
        pieces[pieceId] = null;
      }
    }

    return false;
  }

  // Attempt to solve; retry with modified rng if iteration limit reached
  if (!solve(0)) {
    iterations = 0;
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) grid[y][x] = -1;
    pieces.fill(null);
    for (let i = 0; i < 50; i++) rng(); // advance rng state
    if (!solve(0)) {
      // Ultimate fallback: fill with O-pieces
      let pid = 0;
      for (let y = 0; y < rows; y += 2) {
        for (let x = 0; x < cols; x += 2) {
          if (pid >= numPieces) break;
          pieces[pid] = [{ x, y }, { x: x+1, y }, { x, y: y+1 }, { x: x+1, y: y+1 }];
          pid++;
        }
      }
    }
  }

  return pieces;
}

function TetrisPiece({ piece, isDark, fallIndex, allLanded }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 500);
  const isCV = piece.label === 'cv';
  const isFeatured = piece.featured;
  const isStatic = isCV || isFeatured;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 500);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // Color logic:
  // CV/Portfolio (static): always their color (CV is video, Portfolio is blue)
  // Regular: dim gray while falling and connected → vibrant color on hover
  let bgColor;
  if (isStatic) {
    bgColor = piece.color;
  } else if (isHovered) {
    bgColor = piece.hoverColor;
  } else {
    bgColor = isDark ? '#333' : '#e0e0e0';
  }

  const showText = isMobile ? allLanded : isHovered;
  const fallDelay = fallIndex * FALL_STAGGER;

  // Bounding box of the tetromino cells
  const minX = Math.min(...piece.cells.map(c => c.x));
  const maxX = Math.max(...piece.cells.map(c => c.x));
  const minY = Math.min(...piece.cells.map(c => c.y));
  const maxY = Math.max(...piece.cells.map(c => c.y));
  const W = maxX - minX + 1;
  const H = maxY - minY + 1;

  // Place label in the bottom-left cell of the piece
  const sortedCells = [...piece.cells].sort((a, b) => b.y - a.y || a.x - b.x);
  const labelCell = sortedCells[0];
  const lx = labelCell.x - minX;
  const ly = labelCell.y - minY;

  const labelContent = (
    <span
      style={{
        position: 'absolute',
        bottom: '4px',
        left: '4px',
        fontSize: 'clamp(6px, 1.2vw, 11px)',
        fontWeight: '500',
        textTransform: 'lowercase',
        color: '#fff',
        zIndex: 1,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      {piece.label}
    </span>
  );

  // Deterministic random delay based on label letters for staggered pulsing
  const labelHash = piece.label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const blinkDelay = (labelHash % 50) / 10;

  const pieceStyle = {
    gridColumnStart: minX + 1,
    gridColumnEnd: maxX + 2,
    gridRowStart: minY + 1,
    gridRowEnd: maxY + 2,
    position: 'relative',
    cursor: piece.link ? 'pointer' : 'default',
    backgroundColor: isCV ? 'transparent' : bgColor,
    transition: 'background-color 0.5s ease',
    clipPath: `url(#clip-${piece.label})`,
    WebkitClipPath: `url(#clip-${piece.label})`,
    display: 'block',
    overflow: 'hidden',
    '--cell-w': `calc((100% - (${W} - 1) * var(--grid-gap)) / ${W})`,
    '--cell-h': `calc((100% - (${H} - 1) * var(--grid-gap)) / ${H})`,
    '--vibrant-color': piece.hoverColor,
    '--dim-color': isDark ? '#333' : '#e0e0e0',
  };

  if (isMobile && allLanded && !isStatic) {
    pieceStyle.animation = `colorBlink 6s ease-in-out ${blinkDelay}s infinite`;
  } else if (!allLanded) {
    pieceStyle.animation = `tetrisFall ${FALL_DURATION}s cubic-bezier(0.33, 0, 0.67, 1) ${fallDelay}s both`;
  }

  const Element = piece.link ? 'a' : 'div';
  const linkProps = piece.link ? {
    href: piece.link,
    target: '_blank',
    rel: 'noopener noreferrer'
  } : {};

  return (
    <>
      <Element
        style={pieceStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...linkProps}
      >
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <clipPath id={`clip-${piece.label}`} clipPathUnits="userSpaceOnUse">
              {piece.cells.map((cell, idx) => {
                const clx = cell.x - minX;
                const cly = cell.y - minY;

                // Check adjacency within the piece
                const hasLeft = piece.cells.some(c => c.x === cell.x - 1 && c.y === cell.y);
                const hasRight = piece.cells.some(c => c.x === cell.x + 1 && c.y === cell.y);
                const hasTop = piece.cells.some(c => c.x === cell.x && c.y === cell.y - 1);
                const hasBottom = piece.cells.some(c => c.x === cell.x && c.y === cell.y + 1);

                const leftExtend = hasLeft ? 'var(--grid-gap) / 2' : '0px';
                const rightExtend = hasRight ? 'var(--grid-gap) / 2' : '0px';
                const topExtend = hasTop ? 'var(--grid-gap) / 2' : '0px';
                const bottomExtend = hasBottom ? 'var(--grid-gap) / 2' : '0px';

                // Sizing and positioning using CSS variables and calc
                const rx = `calc(${clx} * (var(--cell-w) + var(--grid-gap)) - ${leftExtend})`;
                const ry = `calc(${cly} * (var(--cell-h) + var(--grid-gap)) - ${topExtend})`;
                const rw = `calc(var(--cell-w) + ${leftExtend} + ${rightExtend})`;
                const rh = `calc(var(--cell-h) + ${topExtend} + ${bottomExtend})`;

                return (
                  <rect
                    key={idx}
                    x={rx}
                    y={ry}
                    width={rw}
                    height={rh}
                    style={{
                      x: rx,
                      y: ry,
                      width: rw,
                      height: rh
                    }}
                  />
                );
              })}
            </clipPath>
          </defs>
        </svg>
        {isCV && (
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              inset: 0,
              border: 'none',
              outline: 'none',
            }}
          >
            <source src="/cv-video.mp4" type="video/mp4" />
          </video>
        )}
        {showText && (
          <div
            style={{
              position: 'absolute',
              left: `calc(${lx} * (var(--cell-w) + var(--grid-gap)))`,
              top: `calc(${ly} * (var(--cell-h) + var(--grid-gap)))`,
              width: `var(--cell-w)`,
              height: `var(--cell-h)`,
              pointerEvents: 'none',
            }}
          >
            {labelContent}
          </div>
        )}
      </Element>
    </>
  );
}

function App() {
  const [isDark, setIsDark] = useState(() => {
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18;
  });
  const [seed, setSeed] = useState(() => Math.random());
  const [allLanded, setAllLanded] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cols = isMobile ? 6 : 8;
  const rows = isMobile ? 8 : 6;

  const generateLayout = () => {
    const items = [
      { label: 'rm8pfix', link: 'https://rm8pfix.khoavo.myds.me', color: '#E8E8E8', hoverColor: '#00BCD4' },
      { label: 'netflix', link: 'https://nf.khoavo.myds.me', color: '#E8E8E8', hoverColor: '#FF9800' },
      { label: 'portfolio', link: 'https://portfolio.khoavo.myds.me', featured: true, color: '#4A7BC7', hoverColor: '#2196F3' },
      { label: 'cv', link: 'https://cv.khoavo.myds.me', color: '#616161', hoverColor: '#424242' },
      { label: 'youtube', link: 'https://ut.khoavo.myds.me', color: '#E8E8E8', hoverColor: '#FF5722' },
      { label: 'tiktok', link: 'https://tt.khoavo.myds.me', color: '#E8E8E8', hoverColor: '#9C27B0' },
      { label: 'spotify', link: 'https://sp.khoavo.myds.me', color: '#E8E8E8', hoverColor: '#4CAF50' },
      { label: 'tools', link: 'https://it.khoavo.myds.me', color: '#E8E8E8', hoverColor: '#FFC107' },
      { label: 'save', link: 'https://save.khoavo.myds.me', color: '#E8E8E8', hoverColor: '#E91E63' },
      { label: 'free', link: 'https://free.khoavo.myds.me', color: '#E8E8E8', hoverColor: '#00BCD4' },
      { label: 'jpg', link: 'https://jpg.khoavo.myds.me', color: '#E8E8E8', hoverColor: '#673AB7' },
      { label: 'pdf', link: 'https://pdf.khoavo.myds.me', color: '#E8E8E8', hoverColor: '#795548' },
    ];

    const rng = createRandom(seed);
    const tiling = generateTiling(cols, rows, items.length, rng);

    // Randomly assign items to tiling positions
    const shuffledItems = [...items];
    for (let i = shuffledItems.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffledItems[i], shuffledItems[j]] = [shuffledItems[j], shuffledItems[i]];
    }

    return tiling.map((cells, i) => ({ ...shuffledItems[i], cells }));
  };

  const layout = generateLayout();

  // Falling order: bottom pieces first (stacking up like Tetris)
  const fallingOrder = [...layout].sort((a, b) => {
    const maxYA = Math.max(...a.cells.map(c => c.y));
    const maxYB = Math.max(...b.cells.map(c => c.y));
    if (maxYB !== maxYA) return maxYB - maxYA;
    return Math.min(...a.cells.map(c => c.x)) - Math.min(...b.cells.map(c => c.x));
  });
  const fallIndexMap = {};
  fallingOrder.forEach((piece, idx) => {
    fallIndexMap[piece.label] = idx;
  });

  const totalFallTime = (layout.length - 1) * FALL_STAGGER + FALL_DURATION;

  useEffect(() => {
    setAllLanded(false);
    const timer = setTimeout(() => setAllLanded(true), totalFallTime * 1000 + 300);
    return () => clearTimeout(timer);
  }, [seed]);

  const toggleTheme = () => setIsDark(!isDark);
  const refreshLayout = () => {
    setAllLanded(false);
    setSeed(Math.random());
  };

  const bg = isDark ? '#1a1a1a' : '#ffffff';
  const headerBg = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#fff' : '#000';
  const borderColor = isDark ? '#444' : '#000';

  return (
    <div style={{ height: '100vh', background: bg, padding: '0 10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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

      <main className="tetris-board" key={seed} style={{ background: isDark ? '#222' : '#fff' }}>
        {layout.map((piece) => (
          <TetrisPiece
            key={piece.label}
            piece={piece}
            isDark={isDark}
            fallIndex={fallIndexMap[piece.label]}
            allLanded={allLanded}
          />
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
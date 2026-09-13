import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { calculateOptimalGrid } from './utils/gridCalculator';
import { getVideoFromIndexedDB } from './utils/videoStorage';
import AdminModal from './components/AdminModal';
import defaultLinksData from './data/links.json';

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
function generateTiling(cols, rows, numPieces, rng) {
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(-1));
  const pieces = new Array(numPieces).fill(null);
  let iterations = 0;
  const MAX_ITER = 60000;

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
      // Ultimate fallback: fill with 2x2 O-pieces or 1x4 I-pieces
      let pid = 0;
      if (cols % 2 === 0 && rows % 2 === 0) {
        for (let y = 0; y < rows; y += 2) {
          for (let x = 0; x < cols; x += 2) {
            if (pid >= numPieces) break;
            pieces[pid] = [{ x, y }, { x: x+1, y }, { x, y: y+1 }, { x: x+1, y: y+1 }];
            pid++;
          }
        }
      } else if (cols % 4 === 0) {
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x += 4) {
            if (pid >= numPieces) break;
            pieces[pid] = [{ x, y }, { x: x+1, y }, { x: x+2, y }, { x: x+3, y }];
            pid++;
          }
        }
      } else {
        for (let y = 0; y < rows; y += 4) {
          for (let x = 0; x < cols; x++) {
            if (pid >= numPieces) break;
            pieces[pid] = [{ x, y }, { x: x, y: y+1 }, { x: x, y: y+2 }, { x: x, y: y+3 }];
            pid++;
          }
        }
      }
    }
  }

  return pieces.filter(Boolean);
}

function TetrisPiece({ piece, isDark, fallIndex, allLanded }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 500);
  const [resolvedVideoSrc, setResolvedVideoSrc] = useState(piece.videoUrl || (piece.label === 'cv' ? '/cv-video.mp4' : ''));

  const isVideo = !!(piece.isVideo || piece.label === 'cv');
  const isFeatured = !!piece.featured;
  const isStatic = isVideo || isFeatured;
  const clipId = `clip-${piece.id || piece.label}-${fallIndex}`;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 500);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Resolve video source (handles IndexedDB, uploads, and local assets)
  useEffect(() => {
    let active = true;
    let objectUrlToRevoke = null;

    async function loadSrc() {
      const src = piece.videoUrl || (piece.label === 'cv' ? '/cv-video.mp4' : '');
      if (!src) {
        if (active) setResolvedVideoSrc('');
        return;
      }

      if (src.startsWith('idb://')) {
        try {
          const blobUrl = await getVideoFromIndexedDB(src);
          if (active && blobUrl) {
            objectUrlToRevoke = blobUrl;
            setResolvedVideoSrc(blobUrl);
          }
        } catch (e) {
          console.warn('Could not load video from IndexedDB:', e);
        }
      } else {
        if (active) setResolvedVideoSrc(src);
      }
    }

    if (isVideo) {
      loadSrc();
    }

    return () => {
      active = false;
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [piece.videoUrl, piece.label, isVideo]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const pieceColor = piece.color || piece.hoverColor || '#2196F3';
  const pieceHoverColor = piece.hoverColor || piece.color || '#2196F3';

  // Color logic:
  // Video: transparent to show <video>
  // Featured (Solid): always display its selected color
  // Regular: dim gray while resting → vibrant color on hover
  let bgColor;
  if (isVideo) {
    bgColor = 'transparent';
  } else if (isFeatured) {
    bgColor = pieceColor;
  } else if (isHovered) {
    bgColor = pieceHoverColor;
  } else {
    bgColor = isDark ? '#333333' : '#e0e0e0';
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
  const labelCell = sortedCells[0] || piece.cells[0];
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
        zIndex: 2,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      {piece.label}
    </span>
  );

  // Deterministic random delay based on label letters for staggered pulsing
  const labelHash = (piece.label || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const blinkDelay = (labelHash % 50) / 10;

  const pieceStyle = {
    gridColumnStart: minX + 1,
    gridColumnEnd: maxX + 2,
    gridRowStart: minY + 1,
    gridRowEnd: maxY + 2,
    position: 'relative',
    cursor: piece.link ? 'pointer' : 'default',
    backgroundColor: isVideo ? 'transparent' : bgColor,
    transition: 'background-color 0.4s ease',
    clipPath: `url(#${clipId})`,
    WebkitClipPath: `url(#${clipId})`,
    display: 'block',
    overflow: 'hidden',
    '--cell-w': `calc((100% - (${W} - 1) * var(--grid-gap, 2px)) / ${W})`,
    '--cell-h': `calc((100% - (${H} - 1) * var(--grid-gap, 2px)) / ${H})`,
    '--vibrant-color': pieceHoverColor,
    '--dim-color': isFeatured ? pieceColor : (isDark ? '#333333' : '#e0e0e0'),
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
    <Element
      style={pieceStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...linkProps}
    >
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {piece.cells.map((cell, idx) => {
              const clx = cell.x - minX;
              const cly = cell.y - minY;

              const hasLeft = piece.cells.some(c => c.x === cell.x - 1 && c.y === cell.y);
              const hasRight = piece.cells.some(c => c.x === cell.x + 1 && c.y === cell.y);
              const hasTop = piece.cells.some(c => c.x === cell.x && c.y === cell.y - 1);
              const hasBottom = piece.cells.some(c => c.x === cell.x && c.y === cell.y + 1);

              const leftExtend = hasLeft ? 'var(--grid-gap, 2px) / 2' : '0px';
              const rightExtend = hasRight ? 'var(--grid-gap, 2px) / 2' : '0px';
              const topExtend = hasTop ? 'var(--grid-gap, 2px) / 2' : '0px';
              const bottomExtend = hasBottom ? 'var(--grid-gap, 2px) / 2' : '0px';

              const rx = `calc(${clx} * (var(--cell-w) + var(--grid-gap, 2px)) - ${leftExtend})`;
              const ry = `calc(${cly} * (var(--cell-h) + var(--grid-gap, 2px)) - ${topExtend})`;
              const rw = `calc(var(--cell-w) + ${leftExtend} + ${rightExtend})`;
              const rh = `calc(var(--cell-h) + ${topExtend} + ${bottomExtend})`;

              return (
                <rect
                  key={idx}
                  x={rx}
                  y={ry}
                  width={rw}
                  height={rh}
                />
              );
            })}
          </clipPath>
        </defs>
      </svg>
      {isVideo && resolvedVideoSrc && (
        <video
          key={resolvedVideoSrc}
          src={resolvedVideoSrc}
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
            zIndex: 1,
          }}
        />
      )}
      {showText && (
        <div
          style={{
            position: 'absolute',
            left: `calc(${lx} * (var(--cell-w) + var(--grid-gap, 2px)))`,
            top: `calc(${ly} * (var(--cell-h) + var(--grid-gap, 2px)))`,
            width: `var(--cell-w)`,
            height: `var(--cell-h)`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {labelContent}
        </div>
      )}
    </Element>
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
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Load links from localStorage or initial JSON
  const [links, setLinks] = useState(() => {
    try {
      const cached = localStorage.getItem('kv_links_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 1) return parsed;
      }
    } catch (e) {
      console.error('Error loading links from localStorage:', e);
    }
    return defaultLinksData;
  });

  // Fetch from backend API on mount
  useEffect(() => {
    fetch('/api/links')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setLinks(data);
          try {
            localStorage.setItem('kv_links_data', JSON.stringify(data));
          } catch (e) {
            // ignore localStorage quota warnings
          }
        }
      })
      .catch(() => {
        // Backend offline / static mode - use local state
      });
  }, []);

  // Keyboard shortcut: Ctrl+Shift+A (or Cmd+Shift+A) to open Admin
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic grid dimensions (cols, rows)
  const { cols, rows } = useMemo(() => {
    return calculateOptimalGrid(links.length, isMobile);
  }, [links.length, isMobile]);

  // Generate layout with tetromino tiling
  const layout = useMemo(() => {
    if (!links || links.length === 0) return [];
    const rng = createRandom(seed);
    const tiling = generateTiling(cols, rows, links.length, rng);

    // Randomly assign links to tiling positions
    const shuffledItems = [...links];
    for (let i = shuffledItems.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffledItems[i], shuffledItems[j]] = [shuffledItems[j], shuffledItems[i]];
    }

    return tiling.map((cells, i) => ({
      ...(shuffledItems[i] || links[i % links.length]),
      cells
    }));
  }, [links, cols, rows, seed]);

  // Falling order: bottom pieces first (stacking up like Tetris)
  const { fallingOrder, fallIndexMap } = useMemo(() => {
    const sorted = [...layout].sort((a, b) => {
      const maxYA = Math.max(...a.cells.map(c => c.y));
      const maxYB = Math.max(...b.cells.map(c => c.y));
      if (maxYB !== maxYA) return maxYB - maxYA;
      return Math.min(...a.cells.map(c => c.x)) - Math.min(...b.cells.map(c => c.x));
    });
    const map = {};
    sorted.forEach((piece, idx) => {
      map[piece.id || piece.label] = idx;
    });
    return { fallingOrder: sorted, fallIndexMap: map };
  }, [layout]);

  const totalFallTime = (layout.length - 1) * FALL_STAGGER + FALL_DURATION;

  useEffect(() => {
    setAllLanded(false);
    const timer = setTimeout(() => setAllLanded(true), totalFallTime * 1000 + 300);
    return () => clearTimeout(timer);
  }, [seed, layout.length, totalFallTime]);

  const toggleTheme = () => setIsDark(!isDark);
  const refreshLayout = useCallback(() => {
    setAllLanded(false);
    setSeed(Math.random());
  }, []);

  const handleSaveLinks = async (newLinks) => {
    setLinks(newLinks);
    try {
      localStorage.setItem('kv_links_data', JSON.stringify(newLinks));
    } catch {
      console.warn('localStorage full or unavailable');
    }

    let synced = false;
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('kv_admin_token') : null;
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify(newLinks),
      });
      if (res.ok) {
        synced = true;
      } else if (res.status === 401) {
        sessionStorage.removeItem('kv_admin_token');
        alert('Session expired or unauthorized. Please log in again to sync changes to the server.');
      }
    } catch {
      console.warn('API endpoint not reachable, changes active in local browser only.');
    }
    refreshLayout();
    return { synced };
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setIsAdminOpen(true)}
            title="Admin Login / Link Management (Ctrl+Shift+A)"
            style={{
              background: 'none',
              border: `1px solid ${borderColor}`,
              padding: '6px 10px',
              fontSize: '12px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              color: textColor,
              touchAction: 'manipulation',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>⚙</span>
            <span style={{ fontSize: '10px' }}>Admin</span>
          </button>
          <button
            onClick={refreshLayout}
            title="Shuffle Layout"
            style={{
              background: 'none',
              border: `1px solid ${borderColor}`,
              padding: '6px 12px',
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
            title="Toggle Light / Dark Theme"
            style={{
              background: 'none',
              border: `1px solid ${borderColor}`,
              padding: '6px 12px',
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

      <main 
        className="tetris-board" 
        key={seed} 
        style={{ 
          background: isDark ? '#222' : '#fff',
          '--grid-cols': cols,
          '--grid-rows': rows,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {layout.map((piece) => (
          <TetrisPiece
            key={`${piece.id || piece.label}-${piece.cells.map(c=>`${c.x},${c.y}`).join('_')}`}
            piece={piece}
            isDark={isDark}
            fallIndex={fallIndexMap[piece.id || piece.label] ?? 0}
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

      {/* Admin Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        links={links}
        onSaveLinks={handleSaveLinks}
        isDark={isDark}
        gridInfo={{ cols, rows }}
      />
    </div>
  );
}

export default App;
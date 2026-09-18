import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { calculateOptimalGrid } from './utils/gridCalculator';
import { getVideoFromIndexedDB } from './utils/videoStorage';
import { getServiceIconUrl } from './utils/iconResolver';
import { safeSessionStorage } from './utils/safeStorage';
import AdminModal from './components/AdminModal';
import defaultLinksData from './data/links.json';
import defaultSettingsData from './data/settings.json';
import { THEMES, getTetrominoShape } from './data/themes';
import { LAYOUTS } from './data/layouts';
import BentoLayout from './components/layouts/BentoLayout';
import AnalyticsLayout from './components/layouts/AnalyticsLayout';
import TerminalLayout from './components/layouts/TerminalLayout';
import NouveauLayout from './components/layouts/NouveauLayout';
import KineticItalicLayout from './components/layouts/KineticItalicLayout';

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

function TetrisPiece({ piece, theme, isDark, fallIndex, allLanded }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(max-width: 500px)').matches : false));
  const [resolvedVideoSrc, setResolvedVideoSrc] = useState(piece.videoUrl || (piece.label === 'cv' ? '/cv-video.mp4' : ''));

  const iconUrl = useMemo(() => getServiceIconUrl(piece), [piece]);
  const hasIcon = iconUrl && !imgError;
  const isVideo = !!(piece.isVideo || piece.label === 'cv');
  const isFeatured = !!piece.featured;
  const isStatic = isVideo || isFeatured;
  const clipId = `clip-${piece.id || piece.label}-${fallIndex}`;

  const shape = useMemo(() => getTetrominoShape(piece.cells), [piece.cells]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.matchMedia ? window.matchMedia('(max-width: 500px)').matches : window.innerWidth <= 500);
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

  // Determine base and hover colors based on active theme
  let pieceColor = piece.color || piece.hoverColor || '#2196F3';
  let pieceHoverColor = piece.hoverColor || piece.color || '#2196F3';

  if (theme) {
    if (theme.colorMode === 'authentic-tetris' && theme.pieceColors) {
      pieceColor = theme.pieceColors[shape] || pieceColor;
      pieceHoverColor = pieceColor;
    } else if (theme.colorMode === 'palette-solid' && theme.palette) {
      pieceColor = theme.palette[fallIndex % theme.palette.length];
      pieceHoverColor = pieceColor;
    }
  }

  // Color logic:
  let bgColor;
  if (isVideo) {
    bgColor = 'transparent';
  } else if (isFeatured) {
    bgColor = pieceColor;
  } else if (isHovered) {
    bgColor = pieceHoverColor;
  } else if (theme?.dimResting) {
    bgColor = isDark ? '#333333' : '#e0e0e0';
  } else {
    bgColor = pieceColor;
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
    <div
      style={{
        position: 'absolute',
        bottom: '4px',
        left: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        zIndex: 2,
        pointerEvents: 'none',
        maxWidth: 'calc(100% - 8px)',
        overflow: 'hidden',
      }}
    >
      {hasIcon && (
        <img
          src={iconUrl}
          alt=""
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            width: 'clamp(10px, 1.4vw, 14px)',
            height: 'clamp(10px, 1.4vw, 14px)',
            objectFit: 'contain',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
            flexShrink: 0,
          }}
        />
      )}
      <span
        style={{
          fontSize: 'clamp(6px, 1.2vw, 11px)',
          fontWeight: '500',
          textTransform: 'lowercase',
          color: '#fff',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          textShadow: '0 1px 2px rgba(0,0,0,0.7)',
        }}
      >
        {piece.label}
      </span>
    </div>
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
    transition: 'background-color 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease',
    clipPath: `url(#${clipId})`,
    WebkitClipPath: `url(#${clipId})`,
    display: 'block',
    overflow: 'hidden',
    '--cell-w': `calc((100% - (${W} - 1) * var(--grid-gap, 2px)) / ${W})`,
    '--cell-h': `calc((100% - (${H} - 1) * var(--grid-gap, 2px)) / ${H})`,
    '--vibrant-color': pieceHoverColor,
    '--dim-color': isFeatured ? pieceColor : (isDark ? '#333333' : '#e0e0e0'),
  };

  // Theme-specific styles
  if (theme?.style === 'beveled' && !isVideo) {
    pieceStyle.boxShadow = 'inset 3px 3px 0px rgba(255, 255, 255, 0.45), inset -3px -3px 0px rgba(0, 0, 0, 0.55)';
  } else if (theme?.style === 'neon') {
    pieceStyle.filter = isHovered ? `drop-shadow(0 0 10px ${pieceHoverColor})` : `drop-shadow(0 0 4px ${pieceHoverColor}88)`;
    if (!isHovered && theme.dimResting && !isFeatured && !isVideo) {
      pieceStyle.backgroundColor = 'rgba(13, 14, 22, 0.88)';
    }
  } else if (theme?.style === 'glass') {
    pieceStyle.backdropFilter = 'blur(10px)';
    pieceStyle.WebkitBackdropFilter = 'blur(10px)';
    if (!isHovered && theme.dimResting && !isFeatured && !isVideo) {
      pieceStyle.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    }
  } else if (theme?.style === 'gameboy' && !isVideo) {
    pieceStyle.boxShadow = 'inset 2px 2px 0px #9bbc0f, inset -2px -2px 0px #0f380f';
  }

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
      {theme?.style === 'beveled' && !isVideo && (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
          {piece.cells.map((cell, idx) => {
            const clx = cell.x - minX;
            const cly = cell.y - minY;
            const rx = `calc(${clx} * (var(--cell-w) + var(--grid-gap, 2px)))`;
            const ry = `calc(${cly} * (var(--cell-h) + var(--grid-gap, 2px)))`;
            return (
              <g key={idx}>
                <rect x={rx} y={ry} width="var(--cell-w)" height="2.5" fill="rgba(255,255,255,0.45)" />
                <rect x={rx} y={ry} width="2.5" height="var(--cell-h)" fill="rgba(255,255,255,0.45)" />
                <rect x={rx} y={`calc(${ry} + var(--cell-h) - 2.5px)`} width="var(--cell-w)" height="2.5" fill="rgba(0,0,0,0.5)" />
                <rect x={`calc(${rx} + var(--cell-w) - 2.5px)`} y={ry} width="2.5" height="var(--cell-h)" fill="rgba(0,0,0,0.5)" />
              </g>
            );
          })}
        </svg>
      )}
      {theme?.style === 'neon' && !isVideo && (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
          {piece.cells.map((cell, idx) => {
            const clx = cell.x - minX;
            const cly = cell.y - minY;
            const rx = `calc(${clx} * (var(--cell-w) + var(--grid-gap, 2px)))`;
            const ry = `calc(${cly} * (var(--cell-h) + var(--grid-gap, 2px)))`;
            return (
              <rect
                key={idx}
                x={rx}
                y={ry}
                width="var(--cell-w)"
                height="var(--cell-h)"
                fill="none"
                stroke={pieceHoverColor}
                strokeWidth="1.5"
                opacity={isHovered ? "0.95" : "0.45"}
              />
            );
          })}
        </svg>
      )}
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
    try {
      const saved = localStorage.getItem('kv_theme_dark');
      if (saved !== null) return saved === 'true';
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
      }
    } catch {
      // fallback
    }
    return true; // Default to sleek dark mode
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  const [seed, setSeed] = useState(() => Math.random());
  const [landedSeed, setLandedSeed] = useState(() => null);
  const allLanded = landedSeed === seed;
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(max-width: 600px)').matches : false));
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSplitView, setIsSplitView] = useState(() => {
    return typeof window !== 'undefined' ? (window.matchMedia ? window.matchMedia('(min-width: 901px)').matches : true) : true;
  });
  const [layoutHud, setLayoutHud] = useState(null);
  const layoutHudTimerRef = useRef(null);

  // Load branding & settings from localStorage or initial JSON
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('kv_settings_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') return { ...defaultSettingsData, ...parsed };
      }
    } catch (e) {
      console.error('Error loading settings from localStorage:', e);
    }
    return defaultSettingsData;
  });

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

  // Fetch settings from backend API on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          setSettings(prev => {
            const merged = { ...prev, ...data };
            try {
              localStorage.setItem('kv_settings_data', JSON.stringify(merged));
            } catch (err) {
              console.warn('Could not cache settings', err);
            }
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Update dynamic document title and favicon from 1-photo branding
  useEffect(() => {
    if (settings.title) {
      document.title = `${settings.title.toUpperCase()} — PORTAL`;
    }
    if (settings.logoUrl) {
      let iconLink = document.querySelector("link[rel~='icon']");
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = settings.logoUrl;

      let appleIconLink = document.querySelector("link[rel='apple-touch-icon']");
      if (!appleIconLink) {
        appleIconLink = document.createElement('link');
        appleIconLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleIconLink);
      }
      appleIconLink.href = settings.logoUrl;
    }
  }, [settings.title, settings.logoUrl]);

  // Active theme resolved from settings
  const currentTheme = useMemo(() => {
    return THEMES[settings.themeId] || THEMES.classic;
  }, [settings.themeId]);

  // Fetch links from backend API on mount
  useEffect(() => {
    fetch('/api/links')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setLinks(data);
          try {
            localStorage.setItem('kv_links_data', JSON.stringify(data));
          } catch (err) {
            console.warn('Could not cache links', err);
          }
        }
      })
      .catch(() => {
        // Backend offline / static mode - use local state
      });
  }, []);


  // Window resize handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.matchMedia ? window.matchMedia('(max-width: 600px)').matches : window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Is docked split view actively showing on desktop?
  const showSplit = isAdminOpen && isSplitView && !isMobile;

  // Calculate dynamic grid dimensions (cols, rows)
  const { cols, rows } = useMemo(() => {
    const isNarrowSplit = showSplit && (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(max-width: 1149px)').matches : false);
    const effectiveMobile = isMobile || isNarrowSplit;
    return calculateOptimalGrid(links.length, effectiveMobile);
  }, [links.length, isMobile, showSplit]);

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
  const { fallIndexMap } = useMemo(() => {
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
    return { fallIndexMap: map };
  }, [layout]);

  const totalFallTime = (layout.length - 1) * FALL_STAGGER + FALL_DURATION;

  useEffect(() => {
    const timer = setTimeout(() => setLandedSeed(seed), totalFallTime * 1000 + 300);
    return () => clearTimeout(timer);
  }, [seed, layout.length, totalFallTime]);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      try {
        localStorage.setItem('kv_theme_dark', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };
  const refreshLayout = useCallback(() => {
    setSeed(Math.random());
  }, []);

  const handleSaveLinks = useCallback(async (newLinks) => {
    setLinks(newLinks);
    try {
      localStorage.setItem('kv_links_data', JSON.stringify(newLinks));
    } catch {
      console.warn('localStorage full or unavailable');
    }

    let synced = false;
    const token = safeSessionStorage.getItem('kv_admin_token');
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
        safeSessionStorage.removeItem('kv_admin_token');
        alert('Session expired or unauthorized. Please log in again to sync changes to the server.');
      }
    } catch {
      console.warn('API endpoint not reachable, changes active in local browser only.');
    }
    refreshLayout();
    return { synced };
  }, [refreshLayout]);

  const handleLivePreviewLinks = useCallback((previewLinks) => {
    setLinks(previewLinks);
  }, []);

  const handleLivePreviewSettings = useCallback((previewSettings) => {
    setSettings((prev) => ({ ...prev, ...previewSettings }));
  }, []);

  const handleSaveSettings = useCallback(async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem('kv_settings_data', JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not cache settings locally', err);
    }

    let synced = false;
    const token = safeSessionStorage.getItem('kv_admin_token');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        synced = true;
      }
    } catch {
      console.warn('API endpoint for settings not reachable');
    }
    return { synced };
  }, [settings]);

  const handleSelectTheme = (newThemeId) => {
    handleSaveSettings({ themeId: newThemeId });
  };

  const triggerLayoutSwitch = useCallback((newLayoutId, shortcutLabel) => {
    handleSaveSettings({ activeLayout: newLayoutId });
    const layoutInfo = LAYOUTS[newLayoutId];
    if (layoutInfo) {
      if (layoutHudTimerRef.current) clearTimeout(layoutHudTimerRef.current);
      setLayoutHud({
        id: newLayoutId,
        name: layoutInfo.name,
        badge: layoutInfo.badge || layoutInfo.tag,
        shortcut: shortcutLabel,
      });
      layoutHudTimerRef.current = setTimeout(() => {
        setLayoutHud(null);
      }, 1800);
    }
  }, [handleSaveSettings]);

  const handleSelectLayout = useCallback((newLayoutId) => {
    triggerLayoutSwitch(newLayoutId);
  }, [triggerLayoutSwitch]);

  // Global Keyboard Shortcuts:
  // - Ctrl+Shift+A (or Cmd+Shift+A) to open Admin
  // - Alt+1 to Alt+6 to quickly switch layout engine
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle Admin: Ctrl+Shift+A / Cmd+Shift+A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
        return;
      }

      // Avoid layout hotkeys if user is actively typing in an input, textarea, or contentEditable
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if (isInput) return;

      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const layoutKeyMap = {
          '1': { id: 'dock', shortcut: 'Alt+1' },
          '2': { id: 'bento', shortcut: 'Alt+2' },
          '3': { id: 'terminal', shortcut: 'Alt+3' },
          '4': { id: 'tetris', shortcut: 'Alt+4' },
          '5': { id: 'nouveau', shortcut: 'Alt+5' },
          '6': { id: 'kinetic', shortcut: 'Alt+6' },
        };
        const match = layoutKeyMap[e.key];
        if (match) {
          e.preventDefault();
          triggerLayoutSwitch(match.id, match.shortcut);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerLayoutSwitch]);

  const bg = isDark ? (currentTheme.pageBg || '#09090c') : '#f8fafc';
  const headerBg = isDark ? (currentTheme.pageBg || '#09090c') : '#ffffff';
  const boardBg = isDark ? (currentTheme.boardBg || '#111115') : '#ffffff';
  const textColor = isDark ? (currentTheme.textColor || '#ffffff') : '#0f172a';
  const borderColor = isDark ? (currentTheme.borderColor || 'rgba(255, 255, 255, 0.1)') : 'rgba(0, 0, 0, 0.1)';

  const activeLayoutId = settings.activeLayout || 'tetris';

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: bg,
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Live Dashboard Area */}
      <div style={{
        flex: 1,
        width: showSplit ? 'calc(100vw - min(500px, 45vw))' : '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: activeLayoutId === 'dock' ? '0' : '0 10px',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        minWidth: 0,
      }}>
        {activeLayoutId !== 'dock' && (
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          background: headerBg,
          flexWrap: 'wrap',
          gap: '8px',
          flexShrink: 0,
          borderBottom: `1px solid ${borderColor}`,
          fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: textColor, textDecoration: 'none' }}>
              {settings.logoUrl && (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    border: `1px solid ${borderColor}`,
                    flexShrink: 0
                  }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <span>{settings.title || 'Khoa.vo'}</span>
            </a>
            {settings.tagline && (
              <span style={{ fontSize: '11px', color: currentTheme.subTextColor || (isDark ? '#888' : '#64748b') }} className="header-tagline">
                {settings.tagline}
              </span>
            )}
          </div>

          {/* Quick Segmented Layout Switcher (Hidden in header by default; managed in Settings / Admin modal) */}
          {settings.showLayoutSwitcherInHeader && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: '9px',
              padding: '3px',
              border: `1px solid ${borderColor}`,
              gap: '2px',
            }}>
              {[
                { id: 'bento', label: 'Bento', icon: '⊞' },
                { id: 'tetris', label: 'Tetris', icon: '🕹️' },
                { id: 'dock', label: 'Analytics', icon: '📊' },
                { id: 'terminal', label: 'Terminal', icon: '>_' },
                { id: 'nouveau', label: 'Nouveau', icon: '❧' },
                { id: 'kinetic', label: 'Kinetic', icon: '⚡' },
              ].map((l) => {
                const isActive = activeLayoutId === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => handleSelectLayout(l.id)}
                    style={{
                      background: isActive ? (isDark ? 'rgba(255, 255, 255, 0.16)' : '#ffffff') : 'transparent',
                      color: isActive ? textColor : (isDark ? '#888' : '#666'),
                      border: 'none',
                      borderRadius: '7px',
                      padding: '4px 9px',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: isActive ? '600' : '400',
                      boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                    title={`Switch to ${l.label} Layout`}
                  >
                    <span style={{ fontSize: '11px' }}>{l.icon}</span>
                    <span>{l.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsAdminOpen(true)}
              title="Admin Settings & Customization (Ctrl+Shift+A)"
              style={{
                background: 'none',
                border: `1px solid ${borderColor}`,
                borderRadius: '7px',
                padding: '6px 10px',
                fontSize: '12px',
                fontFamily: 'inherit',
                cursor: 'pointer',
                color: textColor,
                touchAction: 'manipulation',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>⚙</span>
              <span style={{ fontSize: '11px', fontWeight: '500' }}>Admin</span>
            </button>

            {/* Shuffle is only applicable to Tetris layout */}
            {activeLayoutId === 'tetris' && (
              <button
                onClick={refreshLayout}
                title="Shuffle Tetris Layout / Re-roll"
                style={{
                  background: 'none',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '7px',
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
            )}

            <button
              onClick={toggleTheme}
              title="Toggle Light / Dark Theme"
              style={{
                background: 'none',
                border: `1px solid ${borderColor}`,
                borderRadius: '7px',
                padding: '6px 12px',
                fontSize: '13px',
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
        )}

        {/* Dynamic Multi-Layout Strategy Switcher */}
        {activeLayoutId === 'bento' && (
          <BentoLayout
            links={links}
            isDark={isDark}
            settings={settings}
          />
        )}
        {activeLayoutId === 'dock' && (
          <AnalyticsLayout
            links={links}
            isDark={isDark}
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onSelectLayout={triggerLayoutSwitch}
            onOpenAdmin={() => setIsAdminOpen(true)}
            toggleTheme={toggleTheme}
          />
        )}
        {activeLayoutId === 'terminal' && (
          <TerminalLayout
            links={links}
            isDark={isDark}
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onSelectLayout={triggerLayoutSwitch}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        )}
        {activeLayoutId === 'nouveau' && (
          <NouveauLayout
            links={links}
            isDark={isDark}
            settings={settings}
          />
        )}
        {activeLayoutId === 'kinetic' && (
          <KineticItalicLayout
            links={links}
            isDark={isDark}
            settings={settings}
          />
        )}
        {activeLayoutId === 'tetris' && (
          <main 
            className="tetris-board" 
            key={seed} 
            style={{ 
              background: boardBg,
              '--grid-cols': cols,
              '--grid-rows': rows,
              '--grid-gap': currentTheme.gridGap || '2px',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {layout.map((piece) => (
              <TetrisPiece
                key={`${piece.id || piece.label}-${piece.cells.map(c=>`${c.x},${c.y}`).join('_')}`}
                piece={piece}
                theme={currentTheme}
                isDark={isDark}
                fallIndex={fallIndexMap[piece.id || piece.label] ?? 0}
                allLanded={allLanded}
              />
            ))}
          </main>
        )}

        {activeLayoutId !== 'dock' && (
        <footer style={{
          padding: '8px 20px',
          fontSize: '11px',
          color: currentTheme.subTextColor || (isDark ? '#888' : '#666'),
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
          textAlign: 'center',
          flexShrink: 0,
          fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
          letterSpacing: '0.2px',
        }}>
          <p>© {new Date().getFullYear()} — {settings.title || 'Khoa.vo'}</p>
        </footer>
        )}
      </div>

      {/* Dynamic Floating HUD Notification on Layout Switch */}
      {layoutHud && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 18px',
            borderRadius: '24px',
            background: isDark
              ? 'rgba(15, 23, 42, 0.92)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(0, 0, 0, 0.12)'}`,
            boxShadow: isDark
              ? '0 16px 36px -6px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.2)'
              : '0 12px 28px -4px rgba(15, 23, 42, 0.15)',
            color: isDark ? '#ffffff' : '#0f172a',
            fontSize: '12.5px',
            fontWeight: '600',
            pointerEvents: 'none',
            animation: 'hudSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#38bdf8',
            boxShadow: '0 0 8px #38bdf8',
          }} />
          <span>Active Engine: <strong style={{ color: isDark ? '#38bdf8' : '#0284c7' }}>{layoutHud.name}</strong></span>
          {layoutHud.shortcut && (
            <kbd style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '5px',
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              color: isDark ? '#94a3b8' : '#64748b',
              fontFamily: 'monospace',
              fontWeight: '700',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
            }}>
              {layoutHud.shortcut}
            </kbd>
          )}
        </div>
      )}

      {/* Admin Management Modal / Split View Dock */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        links={links}
        onSaveLinks={handleSaveLinks}
        onLivePreviewLinks={handleLivePreviewLinks}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onLivePreviewSettings={handleLivePreviewSettings}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        activeLayout={activeLayoutId}
        onSelectLayout={handleSelectLayout}
        isSplitView={isSplitView}
        onToggleSplitView={() => setIsSplitView(prev => !prev)}
        isDark={isDark}
        gridInfo={{ cols, rows }}
      />
    </div>
  );
}

export default App;
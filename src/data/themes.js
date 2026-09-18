// src/data/themes.js
// Procedural Tetris themes with distinct block textures, coloring rules, and board styles

// Pre-computed normalized coordinate lookup for all 19 tetromino orientations
const SHAPE_LOOKUP = {
  // I-piece
  '0,0|1,0|2,0|3,0': 'I',
  '0,0|0,1|0,2|0,3': 'I',
  // O-piece
  '0,0|1,0|0,1|1,1': 'O',
  // T-piece
  '0,0|1,0|2,0|1,1': 'T',
  '0,0|0,1|1,1|0,2': 'T',
  '1,0|0,1|1,1|2,1': 'T',
  '1,0|0,1|1,1|1,2': 'T',
  // L-piece
  '0,0|0,1|0,2|1,2': 'L',
  '0,0|1,0|2,0|0,1': 'L',
  '0,0|1,0|1,1|1,2': 'L',
  '2,0|0,1|1,1|2,1': 'L',
  // J-piece
  '1,0|1,1|0,2|1,2': 'J',
  '0,0|0,1|1,1|2,1': 'J',
  '0,0|1,0|0,1|0,2': 'J',
  '0,0|1,0|2,0|2,1': 'J',
  // S-piece
  '1,0|2,0|0,1|1,1': 'S',
  '0,0|0,1|1,1|1,2': 'S',
  // Z-piece
  '0,0|1,0|1,1|2,1': 'Z',
  '1,0|0,1|1,1|0,2': 'Z',
};

/**
 * Detect the Tetromino piece shape (I, O, T, L, J, S, Z) from its grid cells.
 */
export function getTetrominoShape(cells) {
  if (!cells || cells.length !== 4) return 'T';
  const minX = Math.min(...cells.map(c => c.x));
  const minY = Math.min(...cells.map(c => c.y));
  const key = cells
    .map(c => ({ x: c.x - minX, y: c.y - minY }))
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map(c => `${c.x},${c.y}`)
    .join('|');
  return SHAPE_LOOKUP[key] || 'T';
}

export const THEMES = {
  classic: {
    id: 'classic',
    name: 'Classic 1989 Arcade',
    description: 'Authentic 3D beveled blocks with official tetromino shape colors',
    boardBg: '#111115',
    pageBg: '#09090c',
    textColor: '#ffffff',
    subTextColor: '#888888',
    borderColor: '#33333e',
    style: 'beveled', // 'beveled' | 'neon' | 'gameboy' | 'glass' | 'flat'
    colorMode: 'authentic-tetris',
    dimResting: false,
    gridGap: '3px',
    swatchColors: ['#00BCD4', '#FFD600', '#9C27B0', '#00E676', '#FF1744', '#2979FF', '#FF9100'],
    pieceColors: {
      I: '#00BCD4', // Cyan
      O: '#FFD600', // Yellow
      T: '#9C27B0', // Purple
      S: '#00E676', // Green
      Z: '#FF1744', // Red
      J: '#2979FF', // Blue
      L: '#FF9100', // Orange
    }
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Deep midnight board with vibrant neon glow outlines',
    boardBg: '#0b0c16',
    pageBg: '#06060c',
    textColor: '#00f7ff',
    subTextColor: '#a371f7',
    borderColor: '#ff0077',
    style: 'neon',
    colorMode: 'custom',
    dimResting: true,
    gridGap: '4px',
    swatchColors: ['#00f7ff', '#ff0077', '#ffe600', '#7b2cbf', '#00ff88'],
  },
  gameboy: {
    id: 'gameboy',
    name: 'Retro Game Boy',
    description: 'Iconic 4-shade greenish monochrome matrix LCD',
    boardBg: '#8b956d',
    pageBg: '#9bbc0f',
    textColor: '#0f380f',
    subTextColor: '#306230',
    borderColor: '#306230',
    style: 'gameboy',
    colorMode: 'palette-solid',
    dimResting: false,
    gridGap: '2px',
    swatchColors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
    palette: ['#0f380f', '#306230', '#8bac0f', '#306230', '#0f380f', '#8bac0f'],
  },
  glass: {
    id: 'glass',
    name: 'Frosted Glass',
    description: 'Translucent acrylic panels with ambient blur and subtle borders',
    boardBg: 'rgba(25, 27, 35, 0.75)',
    pageBg: '#0f1117',
    textColor: '#f1f5f9',
    subTextColor: '#94a3b8',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    style: 'glass',
    colorMode: 'custom',
    dimResting: true,
    gridGap: '3px',
    swatchColors: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399'],
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic Pastel',
    description: 'Warm soothing pastel palette with gentle contrast',
    boardBg: '#21252b',
    pageBg: '#181a1f',
    textColor: '#f8fafc',
    subTextColor: '#94a3b8',
    borderColor: '#333842',
    style: 'flat',
    colorMode: 'palette-solid',
    dimResting: false,
    gridGap: '3px',
    swatchColors: ['#a7f3d0', '#fed7aa', '#fbcfe8', '#ddd6fe', '#bae6fd'],
    palette: ['#6ee7b7', '#fcd34d', '#f472b6', '#a78bfa', '#38bdf8', '#fb923c'],
  },
  minimal: {
    id: 'minimal',
    name: 'Monochrome Minimal',
    description: 'Clean architectural lines and high-contrast grayscale',
    boardBg: '#1a1a1a',
    pageBg: '#121212',
    textColor: '#ffffff',
    subTextColor: '#777777',
    borderColor: '#333333',
    style: 'flat',
    colorMode: 'dim-hover',
    dimResting: true,
    gridGap: '2px',
    swatchColors: ['#333333', '#666666', '#999999', '#cccccc', '#ffffff'],
  }
};

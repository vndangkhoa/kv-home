/**
 * Calculates the optimal grid dimensions (cols, rows) for N tetromino pieces.
 * Total cells = numPieces * 4.
 *
 * Finds factor pairs (cols, rows) such that cols * rows === numPieces * 4,
 * prioritizing balanced aspect ratios for desktop vs mobile.
 */
export function calculateOptimalGrid(numPieces, isMobile) {
  if (!numPieces || numPieces <= 0) {
    return isMobile ? { cols: 6, rows: 8 } : { cols: 8, rows: 6 };
  }

  const totalCells = numPieces * 4;
  const targetRatio = isMobile ? 0.75 : 1.33; // mobile prefers taller, desktop wider

  // Find all integer factor pairs (cols, rows) where cols * rows === totalCells
  const pairs = [];
  for (let c = 2; c <= totalCells; c++) {
    if (totalCells % c === 0) {
      const r = totalCells / c;
      // We need minimum width/height so tetrominoes can fit (prefer >= 2 for both)
      if (c >= 2 && r >= 2) {
        pairs.push({ cols: c, rows: r });
      }
    }
  }

  if (pairs.length === 0) {
    return isMobile ? { cols: 4, rows: numPieces } : { cols: numPieces, rows: 4 };
  }

  // Filter candidates based on viewport constraints
  let candidates = pairs;
  if (isMobile) {
    // For mobile, prefer cols between 2 and 4 so cells are wide enough for labels/icons
    const narrowMobile = pairs.filter(p => p.cols <= 4 && p.cols >= 2);
    if (narrowMobile.length > 0) {
      candidates = narrowMobile;
    } else {
      const mobileFiltered = pairs.filter(p => p.cols <= 6 && p.cols >= 2);
      if (mobileFiltered.length > 0) candidates = mobileFiltered;
    }
  } else {
    // For desktop, prefer cols >= 6 and rows >= 3 if possible
    const desktopFiltered = pairs.filter(p => p.cols >= 6 && p.rows >= 3);
    if (desktopFiltered.length > 0) candidates = desktopFiltered;
  }

  // Sort candidates by closeness to target aspect ratio
  candidates.sort((a, b) => {
    const ratioA = a.cols / a.rows;
    const ratioB = b.cols / b.rows;
    const diffA = Math.abs(ratioA - targetRatio);
    const diffB = Math.abs(ratioB - targetRatio);
    return diffA - diffB;
  });

  return candidates[0];
}

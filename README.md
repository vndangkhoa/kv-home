# Khoa.vo Portal

> A personal link portal with tetris-style grid layout.

## Overview

A responsive web portal that displays links in a tetris-inspired grid layout. Each block represents a different service or project, with animations that drop blocks from top to bottom on page load.

## Features

- **Pixel-Perfect Seamless Blocks**: Tetromino blocks are rendered as single, continuous HTML elements clipped using SVG `clipPath` and extended using CSS `calc()`. This creates a solid block appearance with no internal borders or gaps, while maintaining perfectly even gaps between different blocks.
- **Single CV Video Media**: The CV block displays a single looping video resume seamlessly clipped by the Tetris shape (no duplicate tiles).
- **Global Height-Stretched Layout**: The grid maximizes vertical viewport space globally on both desktop and mobile by dynamically stretching to fill the remaining space between the header and footer with no scrollbars.
- **Mobile Responsive Grid**: Swaps between an 8×6 grid layout (4:3 aspect ratio) on desktop and a portrait-oriented 6×8 grid layout (3:4 aspect ratio) on mobile.
- **Staggered Blinking on Mobile**: On mobile viewports, blocks pulse gently in their signature vibrant colors with deterministic staggered delays, while CV and Portfolio stay static.
- **Dark/Light Theme**: Toggle between dark and light modes.
- **Refresh Layout**: Shuffle button to regenerate the grid layout.

## Links

- portfolio - Portfolio website
- cv - Video resume
- netflix, youtube, spotify, tiktok - Media platforms
- tools, save, free, jpg, pdf - Utility links
- rm8pfix - Custom project

## Stack

- React + Vite
- CSS (no external CSS framework)

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

---

*© 2026 Khoa.vo*
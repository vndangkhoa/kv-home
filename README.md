<div align="center">

# 🕹️ KV-Port (Khoa.vo Portal)

<p><em>Where design meets intelligence. A dynamic, Tetris-inspired personal dashboard and service hub.</em></p>

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg?logo=node.js)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Features](#-key-features) • [Quick Start](#-quick-start) • [NAS Deployment](#-nas-deployment-synology--qnap) • [Docker](#-docker-deployment) • [Changelog](#-changelog)

</div>

---

## 🌟 Overview

**KV-Port** is a high-performance, responsive personal portal and app launcher featuring a procedural **Tetris-tiling layout engine**. Every card is rendered as an interlocking tetromino shape that dynamically animates into place on load, with full live administrative controls, video backgrounds, and multi-device persistence across your home lab, NAS, and cloud environments.

---

## ✨ Key Features

- 🧩 **Procedural Tetris Layout Engine**: Backtracking solver automatically computes perfect interlocking tetromino configurations based on viewport size and item count.
- 📐 **Pixel-Perfect Seamless Blocks**: Individual blocks are rendered as continuous HTML elements clipped with SVG `clipPath` and extended via CSS `calc()`, eliminating internal borders while preserving precise inter-card gutters.
- 🎬 **Video Resume & Media Blocks**: Supports embedded background videos (e.g. CV video) with HTTP 206 Partial Content range requests for smooth seeking and playback across Safari, Chrome, and iOS.
- 🛠️ **Live Admin Dashboard**: Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on macOS) or click the header menu to open the admin panel. Add, delete, reorder, change colors, upload videos, and edit links in real time.
- 🔄 **True Multi-Device Persistence**: Changes made in the Admin page are saved to a central server and instantly reflected across all machines, smartphones, and tablets.
- 📱 **Adaptive Viewport Scaling**: Transitions between an 8×6 landscape grid (4:3) on desktop and a 6×8 portrait layout (3:4) on mobile devices without vertical scrollbars.
- 🌓 **Themes & Controls**: Dark/Light mode switcher and dynamic shuffle button to re-roll layout orientations.
- 🚀 **Zero-Dependency Production Backend**: Standalone `server.js` uses native Node.js standard libraries—no external npm modules needed on your production host or NAS!

---

## 🏗️ Architecture & Project Structure

```text
kv-port/
├── server.js              # Zero-dependency production HTTP & API server
├── Dockerfile             # Multi-stage production container build
├── docker-compose.yml     # Container orchestration with persistent volumes
├── launch.sh              # Unified developer & deployment CLI script
├── dist/                  # Production build output (HTML, JS, CSS)
├── data/                  # Persistent runtime JSON database (links, auth)
├── uploads/               # Persistent uploaded media & videos
├── src/
│   ├── App.jsx            # Main application root & layout orchestration
│   ├── components/
│   │   ├── AdminModal.jsx # Full-featured administration modal
│   │   ├── Header.jsx     # Navigation bar with controls
│   │   └── ...            # Card and blueprint components
│   ├── data/              # Default starter seed data (links.json, auth.json)
│   └── utils/
│       ├── gridCalculator.js  # Dynamic column/row optimization
│       └── videoStorage.js    # IndexedDB caching utilities
└── vite.config.js         # Vite bundling configuration & dev API plugin
```

---

## 🚀 Quick Start

### 1. Using the Unified CLI (`launch.sh`)

```bash
# Start local development server
./launch.sh dev

# Access over local network
./launch.sh dev --host

# Build for production
./launch.sh build

# Run production server locally
./launch.sh start
```

### 2. Standard NPM Workflow

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```

Default dev URL: `http://localhost:5173`  
Default production URL: `http://localhost:3000`

---

## 🐳 Docker Deployment

The image is pre-built, optimized, and published to multiple container registries:

- **Docker Hub**: `vndangkhoa/kv-port:latest`
- **GitHub Container Registry (GHCR)**: `ghcr.io/vndangkhoa/kv-port:latest`
- **Forgejo Registry**: `git.khoavo.myds.me/vndangkhoa/kv-port:latest`

### Running with Docker Compose (Recommended)

Save the following as `docker-compose.yml`:

```yaml
services:
  kv-port:
    image: vndangkhoa/kv-port:latest
    container_name: kv-port
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    environment:
      - PORT=3000
      - HOST=0.0.0.0
```

Start the container:
```bash
docker compose up -d
```

### Building the Image Locally

```bash
docker build -t kv-port .
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data -v $(pwd)/uploads:/app/uploads kv-port
```

---

## 💾 NAS Deployment (Synology / QNAP)

### Method 1: Synology Container Manager (Docker)

1. Open **Container Manager** (or Docker) on DSM.
2. Go to **Project** > **Create**.
3. Point to the folder containing `docker-compose.yml` (or upload it).
4. Deploy the project! Your blocks and videos are automatically persisted in `./data` and `./uploads`.

### Method 2: Native Node.js (Zero `npm install` on NAS!)

1. Run the build locally on your development machine:
   ```bash
   ./launch.sh build
   ```
2. Copy these 4 files/folders to your NAS web folder (e.g. `/volume1/web/kv-port`):
   - `dist/`
   - `data/`
   - `uploads/`
   - `server.js`
3. Start the server via Synology Task Scheduler (triggered on boot) or SSH:
   ```bash
   node server.js
   # Or custom port:
   PORT=3000 node server.js
   ```

---

## 🔐 Admin Dashboard & APIs

Access the Admin Modal by pressing `Ctrl + Shift + A` (or `Cmd + Shift + A`) or clicking the **Admin** button in the header.

- **Default Password**: `thieugia` (can be updated directly in the Admin modal).
- **REST Endpoints**:
  - `GET /api/links`: Fetch current block layout.
  - `POST /api/links`: Save updated block layout.
  - `POST /api/upload-video`: Upload MP4/WebM video with automatic filesystem storage.
  - `POST /api/auth/verify`: Validate admin access.
  - `POST /api/auth/password`: Securely change admin password.

---

## 📝 Changelog

### [v1.1.0] - 2026-09-13

#### Added
- **Multi-Device Sync Architecture**: Integrated persistent production backend `server.js` using Node.js standard libraries (`node:http`, `node:fs`), resolving isolated browser `localStorage` drift.
- **Docker Support**: Added multi-stage `Dockerfile` and `docker-compose.yml` with persistent volume mappings for `./data` and `./uploads`.
- **Media Streaming**: Added HTTP 206 Partial Content range requests to allow native scrubbing and playback of video resume backgrounds on mobile and desktop.
- **Enhanced Admin Feedback**: Visual confirmation in Admin UI indicating whether edits synced to the central server (`✓ Saved & synced across all devices!`) or fell back to offline storage (`⚠ Saved locally only`).
- **Unified CLI Tooling**: Added `start` and automatic directory preparation inside `launch.sh`.

#### Fixed
- Fixed issue where modifications in the Admin page only took effect on the editing browser and did not replicate to other devices accessing the NAS.
- Resolved missing `/api/links` handling in static production builds.

---

### [v1.0.0] - Initial Release

- Initial release with procedural tetromino tiling grid.
- Dynamic responsive aspect-ratio switching (8×6 desktop, 6×8 mobile).
- Seamless SVG `clipPath` card geometry.
- Dark and light theme support.
- Embedded video resume tile and animated hover interactions.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by <b>Khoa.vo</b></sub>
</div>
# Changelog

All notable changes to **KV-Home** (KV-Port) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-18

### 🚀 Highlights
- **Production Grade Release**: Zero mock data; preconfigured with authentic production homelab services, official CDN vector icons, and persistent storage.
- **Synology NAS SPK Package (`kvhome`)**: One-click install package for DSM 7.0–7.2 with custom desktop icons, auto-assigned random ports, and persistent volumes.
- **Multi-Registry Distribution**: Container images pushed to Docker Hub, GitHub Container Registry (GHCR), and dual Forgejo mirrors (`git.khoavo.vndns.net` and `git.khoavo.myds.me`).

### 🧩 Engine & Layouts
- **Procedural Tetris Engine**: Dynamic interlocking tetromino tiling (I, J, L, O, S, T, Z) with smooth entrance gravity animations and SVG clip paths.
- **Multi-Layout System**:
  - **Tetris**: Classic interactive tetromino gravity engine with shuffle generator.
  - **Bento**: Modern modular dashboard with live status pings, dynamic service badges, and quick filters.
  - **Terminal (KV-OS)**: Interactive CLI with ASCII banners, theme switching, fastfetch telemetry, CRT scanlines, and keyboard shortcuts.
  - **Analytics**: Technical grid layout with metrics and live status indicators.
  - **Nouveau**: Luxury Art Nouveau aesthetic with gold foil accents and cameo seals.
  - **Kinetic**: High-energy typographic slant with holographic text decryption scramble.

### 🔐 Security & Persistence
- **Native RFC 6238 TOTP 2FA**: Zero-dependency two-factor authentication implemented with Node.js standard crypto libraries.
- **Password Protection**: Salted scrypt password hashing with constant-time equality checks and secure bearer sessions.
- **Multi-Device Data Sync**: Live sync for links, custom themes, and layout preferences saved in persistent `data/` and `uploads/` volumes.
- **Automatic Service Discovery**: Scans local Docker containers via `/var/run/docker.sock` and network ports.

### 🎨 Visual & Quality Improvements
- **Official Homelab Icons**: WalkxCode dashboard-icons integration covering 3,500+ service logos with fuzzy slug resolver.
- **Custom SPK App Icons**: Bespoke high-resolution 1024x1024 master icon rendered across 8 resolutions for Synology DSM 7.2 desktop and Package Center.
- **Code Hardening**: 100% clean ESLint report with zero errors and zero warnings; optimized React 19 rendering.

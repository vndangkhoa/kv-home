<p align="center">
  <img src="public/favicon.ico" alt="KV-Port Logo" width="100" height="100" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(139,92,246,0.3);">
</p>

<h1 align="center">🕹️ KV-Port (Tetris Portal)</h1>

<p align="center">
  <strong>The procedural Tetris-tiling personal dashboard, service hub, and homelab app launcher.</strong><br>
  Every service card is an interlocking tetromino that dynamically drops and locks into place.<br>
  <i>Built with React 19, Vite 7, and a hardened zero-dependency Node.js backend with native TOTP 2FA.</i>
</p>

<p align="center">
  <a href="https://github.com/vndangkhoa/kv-port/stargazers"><img src="https://img.shields.io/github/stars/vndangkhoa/kv-port?style=for-the-badge&logo=apachespark&color=f59e0b" alt="GitHub Stars"></a>
  <a href="https://hub.docker.com/r/vndangkhoa/kv-port"><img src="https://img.shields.io/docker/pulls/vndangkhoa/kv-port?style=for-the-badge&logo=docker&logoColor=white&label=Pulls&color=2563eb" alt="Docker Hub Pulls"></a>
  <a href="https://github.com/vndangkhoa/kv-port/pkgs/container/kv-port"><img src="https://img.shields.io/badge/GHCR-vndangkhoa%2Fkv--port-181717?style=for-the-badge&logo=github&color=059669" alt="GHCR"></a>
  <a href="https://git.khoavo.myds.me/vndangkhoa/kv-port"><img src="https://img.shields.io/badge/Forgejo-Mirror-FF5722?style=for-the-badge&logo=git" alt="Forgejo"></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-gray?style=for-the-badge" alt="License MIT"></a>
</p>

<p align="center">
  <a href="#-quick-start-30-seconds"><b>Quick Start</b></a> •
  <a href="#-why-kv-port"><b>Why KV-Port?</b></a> •
  <a href="#-competitive-comparison"><b>Comparison</b></a> •
  <a href="#-procedural-tetris-engine"><b>Tetris Engine</b></a> •
  <a href="#-security--totp-2fa"><b>Security & 2FA</b></a> •
  <a href="#-star-history"><b>Star History</b></a>
</p>

---

## ⚡ Why KV-Port?

Most homelab dashboards (like Homepage, Dashy, or Flame) use rigid grid rows and flat cards that feel like generic admin templates.

**KV-Port** transforms your service launcher into a tactile, dynamic experience:

- 🧩 **Procedural Tetris Tiling Engine**: A backtracking solver arranges cards into interlocking tetrominoes (I, J, L, O, S, T, Z) that animate and fall smoothly on page load.
- 🔐 **Native RFC 6238 TOTP 2FA**: Built directly with standard cryptographic libraries—protect your management portal without needing external authenticators like Authelia or Authentik.
- 🎬 **HTTP 206 Partial Content Video Streaming**: Embed background video loops and resume media with zero buffering across Safari, Chrome, and mobile devices.
- 🚀 **Zero-Dependency Production Backend**: The backend is written with standard Node.js libraries (`node:http`, `node:crypto`, `node:fs`). Zero third-party npm packages required at runtime!
- 🛠️ **In-Place Live Admin Mode**: Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> to add, reorder, adjust colors, and edit links with immediate multi-device synchronization.

---

## 📊 Competitive Comparison

| Feature | 🕹️ **KV-Port** | 🏠 Homepage | ⚡ Dashy | 🔥 Flame |
| :--- | :---: | :---: | :---: | :---: |
| **Visual Architecture** | **Procedural Tetris Tetrominoes** | Static Grid | Column/Row Widgets | Flat Cards |
| **Built-in TOTP 2FA** | **✅ Native RFC 6238 (Zero-Dep)** | ❌ Needs Reverse Proxy | ⚠️ Basic Auth | ⚠️ Password only |
| **Runtime Dependencies** | **⚡ Zero (Node.js Standard Libs)** | Many npm packages | Heavy Node stack | Ruby / Docker |
| **Live In-Place Editing** | **✅ Hotkey `Ctrl+Shift+A`** | ❌ Edit YAML files | ✅ GUI Editor | ✅ GUI Editor |
| **Video Background Streaming** | **✅ HTTP Range 206 Support** | ❌ Static images | ❌ Static images | ❌ Static |
| **Synology NAS Ready** | **✅ 1-Container Deployment** | ✅ Docker | ✅ Docker | ✅ Docker |

---

## 📸 Interface Preview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [🕹️ KV-Port]                             [🎲 Re-roll] [🌙 Dark] [⚙️ Admin (Ctrl+Shift+A)] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   ┌──────────────┐┌──────────────┐┌────────────────────────────┐┌──────────────┐      │
│   │ 📁 KV Files  ││ 🔮 SysVis.AI ││ 📥 KV-DL Downloader        ││ 🌐 Blog      │      │
│   │ Rust Manager ││ System AI    ││ Zero-Disk YouTube Engine   ││ Tech Notes   │      │
│   └──────┬───────┘└──────┬───────┘└─────────────┬──────────────┘└──────┬───────┘      │
│          │ ┌─────────────┴┐ ┌───────────────────┴──┐ ┌─────────────────┴────┐          │
│          │ │ 📺 Jellyfin  │ │ 🐳 Portainer Stack   │ │ 📊 Grafana Metrics   │          │
│          │ │ 4K Media     │ │ Docker Services      │ │ Cluster Monitor      │          │
│          └─┴──────────────┘ └──────────────────────┘ └──────────────────────┘          │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Procedural Tetris Engine

KV-Port computes layout geometries using an in-browser constraint solver:
1. **Dimension Analysis**: Calculates optimal board width from the client's screen ratio.
2. **Backtracking Tetromino Placement**: Fits L-shapes, T-shapes, squares, and line pieces with zero gaps.
3. **Seamless SVG Clipping**: Blocks render as continuous geometric shapes using SVG `clipPath` and CSS `calc()` to prevent awkward seam lines while keeping consistent gutters.
4. **Interactive Re-Roll**: Click the **🎲 Shuffle** button to re-roll tetromino configuration seeds instantly.

---

## 🚀 Quick Start (30 Seconds)

### Option A: Run Prebuilt Docker Container

Run KV-Port immediately on port `8001`:

```bash
docker run -d \
  --name kv-port \
  -p 8001:8001 \
  -v ./data:/app/data \
  -v ./uploads:/app/uploads \
  --restart unless-stopped \
  vndangkhoa/kv-port:latest
```

Open **`http://localhost:8001`** in your browser.

---

### Option B: Docker Compose (Recommended)

```yaml
services:
  kv-port:
    image: vndangkhoa/kv-port:latest
    container_name: kv-port
    restart: unless-stopped
    ports:
      - "8001:8001"
    volumes:
      # Persistent link data and 2FA credentials
      - ./data:/app/data
      # Uploaded media and background videos
      - ./uploads:/app/uploads
```

Start the service:
```bash
docker compose up -d
```

---

## 🔐 Security & TOTP 2FA

KV-Port is hardened for public exposure on personal domains:

- **Two-Factor Authentication**: RFC 6238 TOTP with QR Code scanner compatible with Google Authenticator, Apple Passwords, 1Password, and Authy.
- **Salted `scrypt` Passwords**: Hashes credentials with unique 16-byte random salts.
- **Side-Channel Defense**: Uses `crypto.timingSafeEqual` to defeat timing attacks.
- **Brute-Force Lockout**: Automatically locks out IP addresses for 15 minutes after 5 consecutive failed attempts.
- **Hardened HTTP Headers**: Strict CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.

---

## ⌨️ Shortcuts & Admin Navigation

| Key | Scope | Action |
| :--- | :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> | Global | Open / Close Admin Management Modal |
| <kbd>Esc</kbd> | Modal | Close active configuration dialog |
| <kbd>Space</kbd> | Canvas | Re-roll Tetris piece layout configuration |

---

## 🌟 Support & Community

If KV-Port makes your homelab feel more playful and functional:

- Give the repository a **Star ⭐** on GitHub!
- Share your dashboard on [Reddit r/selfhosted](https://reddit.com/r/selfhosted) or [r/homelab](https://reddit.com/r/homelab)
- Contribute layout algorithms or features via [GitHub Issues](https://github.com/vndangkhoa/kv-port/issues)

<p align="center">
  <a href="https://star-history.com/#vndangkhoa/kv-port&Date">
    <img src="https://api.star-history.com/svg?repos=vndangkhoa/kv-port&type=Date" alt="KV-Port Star History" width="75%">
  </a>
</p>

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete details.

Developed with ❤️ by **Khoa Vo ([@vndangkhoa](https://github.com/vndangkhoa))**.
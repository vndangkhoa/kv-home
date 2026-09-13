# Security Architecture & Hardening Guide

This document outlines the multi-layered security protections built into **Khoa.vo Portal** for safe public hosting at `https://khoavo.myds.me/`.

---

## 1. Application-Level Security

### 🔐 Two-Factor Authentication (TOTP / 2FA)
- **Standard**: Fully compliant with **RFC 6238** (Time-based One-Time Passwords).
- **Compatibility**: Works with Google Authenticator, 1Password, Apple Keychain, Bitwarden, and Authy.
- **Activation**:
  1. Log in to the Admin modal (`Ctrl+Shift+A` or click the **Admin** button in header).
  2. Navigate to the **Security & 2FA** tab.
  3. Click **Setup Two-Factor Authentication**.
  4. Scan the rendered QR code with your authenticator app (or copy the manual secret key).
  5. Enter the 6-digit code displayed in your app to activate.
- **Enforcement**: Once enabled, logging into the admin portal requires both your password and a valid 6-digit one-time code.

### 🛡️ Password Cryptography
- Passwords are encrypted using Node's native `crypto.scryptSync` with unique 16-byte cryptographic salts.
- Constant-time comparison (`crypto.timingSafeEqual`) prevents side-channel timing attacks.
- Legacy plaintext passwords in `data/auth.json` are automatically upgraded on server boot.

### 🔑 Session Tokens (HMAC-SHA256)
- Authenticated sessions receive a signed token (`<nonce>:<expiresAt>:<signature>`) valid for 24 hours.
- Server session secret is automatically generated and persisted in `data/.session_secret`.
- All mutating endpoints (`POST /api/links`, `POST /api/upload-video`, `POST /api/auth/password`, and 2FA APIs) strictly require an `Authorization: Bearer <token>` header. Unauthenticated calls receive `401 Unauthorized`.

### ⏱️ Brute-Force Rate Limiting
- The authentication endpoint (`/api/auth/verify`) tracks failed attempts per IP address in memory.
- If an IP fails 5 consecutive attempts, it is locked out for 15 minutes (`429 Too Many Requests`).
- Successful authentication immediately clears the failure counter.

### 📹 Video Upload Hardening
- Video uploads are restricted to `.mp4` and `.webm`.
- **Magic-Byte Inspection**: Uploaded buffers are inspected for binary video signatures (MP4 `ftyp` box and WebM EBML header `1A 45 DF A3`). Any file disguised as video (such as HTML or SVG scripts trying to execute Stored XSS) is rejected with `400 Bad Request`.

### 🌐 HTTP Security Headers
Every HTTP response automatically serves strict security headers:
- `Content-Security-Policy`: Restricts resource execution to trusted origins (`'self'`).
- `X-Frame-Options: DENY`: Protects against Clickjacking in iframes.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `Referrer-Policy: strict-origin-when-cross-origin`: Minimizes referrer information leakage.
- `Strict-Transport-Security`: Enforces HTTPS.
- Wildcard CORS (`Access-Control-Allow-Origin: *`) has been removed.

---

## 2. Network & Synology NAS Security (`khoavo.myds.me`)

When exposing your portal publicly via Synology DDNS (`*.myds.me`):

### Option A: Cloudflare Tunnel (Recommended)
By running `cloudflared` in Docker on your NAS:
1. **Zero Open Router Ports**: No port forwarding (80/443) needed on your home router.
2. **Hidden Home IP**: Visitors only connect to Cloudflare edge nodes, completely hiding your residential IP.
3. **Cloudflare Zero Trust**: You can add Cloudflare Access policies (e.g. require Google login or email pin) in front of sensitive subdomains.

### Option B: Direct Synology DDNS (`khoavo.myds.me`)
If using port forwarding on your home router:
1. **Never Forward DSM Ports**: Do **not** forward port `5000` or `5001` (Synology DSM web interface) to the internet! Only forward port `443` to DSM Reverse Proxy -> Portal container (`port 3000`).
2. **Enable Synology Auto-Block**:
   - Go to **DSM > Control Panel > Security > Protection**.
   - Enable **Auto-Block** (e.g. block IP after 5 login failures within 10 minutes).
3. **Configure Firewall & GeoIP**:
   - Go to **DSM > Control Panel > Security > Firewall**.
   - Create a rule to only allow traffic from your country or trusted subnets.
4. **SSL / Let's Encrypt**:
   - In **DSM > Control Panel > Security > Certificate**, ensure a valid Let's Encrypt certificate is assigned to `khoavo.myds.me`.

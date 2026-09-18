import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Paths
const distDir = path.resolve(__dirname, 'dist');
const dataDir = path.resolve(__dirname, 'data');
const uploadsDir = path.resolve(__dirname, 'uploads');
const linksFile = path.resolve(dataDir, 'links.json');
const settingsFile = path.resolve(dataDir, 'settings.json');
const authFile = path.resolve(dataDir, 'auth.json');
const sessionSecretFile = path.resolve(dataDir, '.session_secret');
const initialSettingsFile = path.resolve(__dirname, 'src/data/settings.json');

const DEFAULT_SETTINGS = {
  title: 'Khoa.vo',
  tagline: 'where design meets intelligence',
  logoUrl: '',
  themeId: 'classic',
  activeLayout: 'tetris',
  widgets: {
    clock: {
      format24: false,
      showSeconds: true,
      showGreeting: true,
      worldClocks: [
        { label: 'UTC', timezone: 'UTC' },
        { label: 'Tokyo', timezone: 'Asia/Tokyo' }
      ]
    },
    weather: {
      enabled: true,
      unit: 'celsius',
      city: 'Ho Chi Minh City',
      latitude: 10.823,
      longitude: 106.630
    },
    news: {
      topStrip: {
        enabled: true,
        feed: 'vnexpress',
        speed: 'slow',
        customUrl: ''
      },
      bottomStrip: {
        enabled: true,
        feed: 'tuoitre',
        speed: 'slow',
        customUrl: ''
      }
    }
  },
  terminal: {
    theme: 'white',
    width: 'boxed',
    fontSize: '12px',
    density: 'normal',
    crtEffect: false,
    showBanner: true,
    showExec: true,
    bannerText: 'KV HOME',
    bannerFont: 'ansi_shadow',
    bannerCustom: '',
    bannerGlow: true,
  }
};

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Session secret persistence
let SESSION_SECRET = '';
if (fs.existsSync(sessionSecretFile)) {
  try {
    SESSION_SECRET = fs.readFileSync(sessionSecretFile, 'utf-8').trim();
  } catch {
    SESSION_SECRET = '';
  }
}
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  SESSION_SECRET = crypto.randomBytes(32).toString('hex');
  try {
    fs.writeFileSync(sessionSecretFile, SESSION_SECRET, 'utf-8');
  } catch (e) {
    console.error('[Server] Warning: Failed to persist session secret:', e.message);
  }
}

// Password hashing helpers (scrypt + timingSafeEqual)
function hashPassword(password, salt) {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, finalSalt, 64).toString('hex');
  return { hash, salt: finalSalt };
}

function verifyPassword(password, hash, salt, authObj) {
  if (!password) return false;
  if (authObj && authObj.password && password === authObj.password) return true;
  if (!hash || !salt) return false;
  try {
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(testHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Seed & migrate initial data files
const initialLinksFile = path.resolve(__dirname, 'src/data/links.json');
if (!fs.existsSync(linksFile)) {
  if (fs.existsSync(initialLinksFile)) {
    fs.copyFileSync(initialLinksFile, linksFile);
    console.log('[Server] Seeded data/links.json from src/data/links.json');
  } else {
    fs.writeFileSync(linksFile, '[]', 'utf-8');
  }
}

if (!fs.existsSync(settingsFile)) {
  if (fs.existsSync(initialSettingsFile)) {
    fs.copyFileSync(initialSettingsFile, settingsFile);
    console.log('[Server] Seeded data/settings.json from src/data/settings.json');
  } else {
    fs.writeFileSync(settingsFile, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  }
}

const initialAuthFile = path.resolve(__dirname, 'src/data/auth.json');
function ensureAuthFile() {
  let authData = null;
  if (fs.existsSync(authFile)) {
    try {
      authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
    } catch (e) {
      console.error('[Server] Failed to parse auth.json:', e);
    }
  } else if (fs.existsSync(initialAuthFile)) {
    try {
      authData = JSON.parse(fs.readFileSync(initialAuthFile, 'utf-8'));
    } catch {
      authData = null;
    }
  }

  // Handle migration from legacy plaintext password
  if (!authData || !authData.passwordHash) {
    const plain = authData?.password || 'thieugia';
    const { hash, salt } = hashPassword(plain);
    authData = {
      passwordHash: hash,
      salt,
      totpEnabled: false,
      totpSecret: null,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(authFile, JSON.stringify(authData, null, 2), 'utf-8');
    console.log('[Server] Upgraded auth.json with salted cryptographic scrypt hash');
  }
  return authData;
}

ensureAuthFile();

// Data helpers
function readLinks() {
  try {
    if (fs.existsSync(linksFile)) {
      return JSON.parse(fs.readFileSync(linksFile, 'utf-8'));
    }
  } catch (err) {
    console.error('[Server] Error reading links.json:', err);
  }
  return [];
}

function writeLinks(data) {
  fs.writeFileSync(linksFile, JSON.stringify(data, null, 2), 'utf-8');
  if (fs.existsSync(initialLinksFile)) {
    try {
      fs.writeFileSync(initialLinksFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  }
}

function readSettings() {
  try {
    if (fs.existsSync(settingsFile)) {
      const parsed = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.error('[Server] Error reading settings.json:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

function writeSettings(data) {
  const current = readSettings();
  const merged = { ...current, ...data };
  fs.writeFileSync(settingsFile, JSON.stringify(merged, null, 2), 'utf-8');
  if (fs.existsSync(initialSettingsFile)) {
    try {
      fs.writeFileSync(initialSettingsFile, JSON.stringify(merged, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  }
  return merged;
}

function readAuth() {
  try {
    if (fs.existsSync(authFile)) {
      const data = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      if (data.passwordHash && data.salt) return data;
    }
  } catch (err) {
    console.error('[Server] Error reading auth.json:', err);
  }
  return ensureAuthFile();
}

function writeAuth(data) {
  fs.writeFileSync(authFile, JSON.stringify(data, null, 2), 'utf-8');
}

// -------------------------------------------------------------
// News / RSS Feed Proxy & Cache
// -------------------------------------------------------------
const NEWS_FEEDS = {
  vnexpress: 'https://vnexpress.net/rss/khoa-hoc-cong-nghe.rss',
  tuoitre: 'https://tuoitre.vn/rss/nhip-song-so.rss',
  thanhnien: 'https://thanhnien.vn/rss/cong-nghe.rss',
  vietnamnet: 'https://vietnamnet.vn/cong-nghe.rss',
  hackernews: 'https://news.ycombinator.com/rss',
  verge: 'https://www.theverge.com/rss/index.xml',
  bbc: 'https://feeds.bbci.co.uk/news/rss.xml',
  reddit: 'https://www.reddit.com/r/homelab/.rss',
  arstechnica: 'https://feeds.arstechnica.com/arstechnica/index',
};

const newsCache = new Map();
const NEWS_CACHE_TTL = 15 * 60 * 1000; // 15 mins

const HTML_ENTITIES = {
  '&aacute;': 'á', '&agrave;': 'à', '&atilde;': 'ã', '&acirc;': 'â',
  '&eacute;': 'é', '&egrave;': 'è', '&ecirc;': 'ê',
  '&iacute;': 'í', '&igrave;': 'ì',
  '&oacute;': 'ó', '&ograve;': 'ò', '&ocirc;': 'ô', '&otilde;': 'õ',
  '&uacute;': 'ú', '&ugrave;': 'ù',
  '&yacute;': 'ý',
  '&Aacute;': 'Á', '&Agrave;': 'À', '&Acirc;': 'Â',
  '&Eacute;': 'É', '&Egrave;': 'È', '&Ecirc;': 'Ê',
  '&Iacute;': 'Í', '&Igrave;': 'Ì',
  '&Oacute;': 'Ó', '&Ograve;': 'Ò', '&Ocirc;': 'Ô',
  '&Uacute;': 'Ú', '&Ugrave;': 'Ù',
  '&Yacute;': 'Ý',
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#0*39;': "'", '&#x27;': "'", '&apos;': "'", '&nbsp;': ' ',
  '&hellip;': '…', '&ndash;': '–', '&mdash;': '—',
  '&lsquo;': '‘', '&rsquo;': '’', '&ldquo;': '“', '&rdquo;': '”'
};

function cleanText(str) {
  if (!str) return '';
  let res = str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    res = res.replaceAll(entity, char);
  }
  return res.trim();
}

function parseRssItems(xml, sourceName = 'News') {
  const items = [];
  const itemMatches = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (const itemXml of itemMatches.slice(0, 20)) {
    const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkHref = itemXml.match(/<link[^>]+href=["']([^"']+)["']/i);
    const linkTag = itemXml.match(/<link[\s>]([\s\S]*?)<\/link>/i);
    const dateMatch = itemXml.match(/<pubDate[\s>]([\s\S]*?)<\/pubDate>/i) || itemXml.match(/<updated[\s>]([\s\S]*?)<\/updated>/i);

    const title = cleanText(titleMatch ? titleMatch[1] : '');
    const link = linkHref ? linkHref[1] : (linkTag ? cleanText(linkTag[1]) : '');
    const pubDateStr = dateMatch ? cleanText(dateMatch[1]) : '';

    let timeAgo = '';
    if (pubDateStr) {
      const ms = Date.now() - new Date(pubDateStr).getTime();
      if (!isNaN(ms)) {
        const mins = Math.floor(ms / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (mins < 60) timeAgo = `${Math.max(1, mins)}m ago`;
        else if (hours < 24) timeAgo = `${hours}h ago`;
        else timeAgo = `${days}d ago`;
      }
    }

    if (title && link) {
      items.push({
        title,
        link,
        source: sourceName,
        timeAgo: timeAgo || 'Recent',
        date: pubDateStr,
      });
    }
  }
  return items;
}


// -------------------------------------------------------------
// RFC 6238 / RFC 4226 TOTP Engine (Pure Node Standard Library)
// -------------------------------------------------------------
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(str) {
  const cleaned = str.toUpperCase().replace(/=+$/, '').replace(/[\s-]/g, '');
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = Buffer.alloc(Math.floor((cleaned.length * 5) / 8));
  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (val === -1) throw new Error('Invalid base32 char: ' + cleaned[i]);
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return output;
}

function generateTOTPSecret() {
  return base32Encode(crypto.randomBytes(20));
}

function verifyTOTP(token, secret, window = 1, timeStep = 30) {
  if (!token || !secret) return false;
  const cleanedToken = String(token).trim();
  if (cleanedToken.length !== 6) return false;

  try {
    const key = base32Decode(secret);
    const currentCounter = Math.floor(Date.now() / 1000 / timeStep);
    for (let i = -window; i <= window; i++) {
      const counter = currentCounter + i;
      const buf = Buffer.alloc(8);
      buf.writeBigInt64BE(BigInt(counter));
      const hmac = crypto.createHmac('sha1', key).update(buf).digest();
      const offset = hmac[hmac.length - 1] & 0x0f;
      const code = (
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)
      ) % 1000000;
      if (code.toString().padStart(6, '0') === cleanedToken) {
        return true;
      }
    }
  } catch (e) {
    console.error('[Server] TOTP verification error:', e.message);
  }
  return false;
}

// -------------------------------------------------------------
// Session Token Engine (HMAC-SHA256 Signed Tokens)
// -------------------------------------------------------------
function generateSessionToken() {
  const nonce = crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24-hour expiration
  const payload = `${nonce}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}:${sig}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split(':');
  if (parts.length !== 3) return false;
  const [nonce, expiresAtStr, sig] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const payload = `${nonce}:${expiresAt}`;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const sigBuf = Buffer.from(sig, 'hex');
  const expBuf = Buffer.from(expectedSig, 'hex');
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

// -------------------------------------------------------------
// Brute-Force Rate Limiting (In-Memory IP Bucket)
// -------------------------------------------------------------
const rateLimitMap = new Map(); // ip -> { count: number, lockUntil: number }

function getClientIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
}

function checkRateLimit(ip) {
  const record = rateLimitMap.get(ip);
  if (!record) return { locked: false };
  const now = Date.now();
  if (record.lockUntil > now) {
    const remainingSec = Math.ceil((record.lockUntil - now) / 1000);
    return { locked: true, remainingSec };
  }
  return { locked: false };
}

function recordLoginFailure(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, lockUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockUntil = now + 15 * 60 * 1000; // 15-minute lock
    console.warn(`[Security] IP ${ip} temporarily locked out for 15 minutes (5 consecutive failed attempts)`);
  }
  rateLimitMap.set(ip, record);
}

function recordLoginSuccess(ip) {
  rateLimitMap.delete(ip);
}

// -------------------------------------------------------------
// Magic-Byte Video Verification
// -------------------------------------------------------------
function isValidVideoFormat(buffer, filename) {
  if (!buffer || buffer.length < 12) return false;
  const ext = path.extname(filename || '').toLowerCase();
  if (ext !== '.mp4' && ext !== '.webm') return false;

  // MP4 check: bytes 4-7 equal 'ftyp'
  const isMp4 = buffer.subarray(4, 8).toString('ascii') === 'ftyp';
  // WebM check: 0x1A 0x45 0xDF 0xA3 (EBML Header)
  const isWebm =
    buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3;

  return (ext === '.mp4' && isMp4) || (ext === '.webm' && isWebm);
}

// Magic-Byte Image Verification (.png, .jpg, .jpeg, .webp, .svg, .ico, .gif)
function isValidImageFormat(buffer, filename) {
  if (!buffer || buffer.length < 4) return false;
  const ext = path.extname(filename || '').toLowerCase();
  const validExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.gif'];
  if (!validExts.includes(ext)) return false;

  // PNG: 89 50 4E 47
  if (ext === '.png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }
  // JPEG: FF D8 FF
  if (ext === '.jpg' || ext === '.jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  // GIF: GIF8
  if (ext === '.gif') {
    return buffer.subarray(0, 4).toString('ascii') === 'GIF8';
  }
  // WebP: RIFF....WEBP
  if (ext === '.webp') {
    return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  // ICO: 00 00 01 00
  if (ext === '.ico') {
    return buffer[0] === 0x00 && buffer[1] === 0x00 && (buffer[2] === 0x01 || buffer[2] === 0x02) && buffer[3] === 0x00;
  }
  // SVG: contains <svg
  if (ext === '.svg') {
    const head = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('utf-8').toLowerCase();
    return head.includes('<svg');
  }
  return false;
}

// -------------------------------------------------------------
// Auto-Discovery & Service Fingerprinting Engine
// -------------------------------------------------------------
const HOMELAB_CATALOG = [
  // Media
  { port: 8096, name: 'Jellyfin', subtitle: 'Media Server', group: 'media', iconSlug: 'jellyfin', color: '#AA5CC3', keywords: ['jellyfin'] },
  { port: 8920, name: 'Jellyfin (HTTPS)', subtitle: 'Media Server', group: 'media', iconSlug: 'jellyfin', color: '#AA5CC3', keywords: ['jellyfin'] },
  { port: 32400, name: 'Plex', subtitle: 'Media Server', group: 'media', iconSlug: 'plex', color: '#E5A00D', keywords: ['plex'] },
  { port: 8097, name: 'Emby', subtitle: 'Media Server', group: 'media', iconSlug: 'emby', color: '#52B54B', keywords: ['emby'] },
  { port: 8000, name: 'Audiobookshelf', subtitle: 'Audiobooks & Podcasts', group: 'media', iconSlug: 'audiobookshelf', color: '#9C5B23', keywords: ['audiobookshelf'] },
  { port: 4533, name: 'Navidrome', subtitle: 'Music Streaming', group: 'media', iconSlug: 'navidrome', color: '#4B7BEC', keywords: ['navidrome'] },
  { port: 5055, name: 'Overseerr', subtitle: 'Media Requests', group: 'media', iconSlug: 'overseerr', color: '#E5A00D', keywords: ['overseerr'] },
  { port: 5056, name: 'Jellyseerr', subtitle: 'Media Requests', group: 'media', iconSlug: 'jellyseerr', color: '#9C27B0', keywords: ['jellyseerr'] },
  { port: 8181, name: 'Tautulli', subtitle: 'Plex Statistics', group: 'media', iconSlug: 'tautulli', color: '#DBA05C', keywords: ['tautulli'] },
  { port: 8083, name: 'Calibre-Web', subtitle: 'E-Book Library', group: 'media', iconSlug: 'calibre-web', color: '#C0392B', keywords: ['calibre-web', 'calibre'] },
  { port: 5000, name: 'Kavita', subtitle: 'Digital Comics & Manga', group: 'media', iconSlug: 'kavita', color: '#6845B2', keywords: ['kavita'] },
  { port: 7601, name: 'Invidious', subtitle: 'YouTube Engine', group: 'media', iconSlug: 'invidious', color: '#E0245E', keywords: ['invidious'] },
  { port: 3241, name: 'KV-Tube', subtitle: 'YouTube Engine UI', group: 'media', iconSlug: 'youtube', color: '#FF0000', keywords: ['kv-tube', 'materialious'] },

  // Downloads & *Arr
  { port: 8080, name: 'qBittorrent', subtitle: 'BitTorrent Client', group: 'downloads', iconSlug: 'qbittorrent', color: '#2F6799', keywords: ['qbittorrent', 'qbit'] },
  { port: 8085, name: 'qBittorrent Alt', subtitle: 'BitTorrent Client', group: 'downloads', iconSlug: 'qbittorrent', color: '#2F6799', keywords: ['qbittorrent'] },
  { port: 9091, name: 'Transmission', subtitle: 'BitTorrent Client', group: 'downloads', iconSlug: 'transmission', color: '#C43427', keywords: ['transmission'] },
  { port: 8112, name: 'Deluge', subtitle: 'BitTorrent Client', group: 'downloads', iconSlug: 'deluge', color: '#2B5B84', keywords: ['deluge'] },
  { port: 8989, name: 'Sonarr', subtitle: 'TV Series Management', group: 'downloads', iconSlug: 'sonarr', color: '#00CCFF', keywords: ['sonarr'] },
  { port: 7878, name: 'Radarr', subtitle: 'Movie Management', group: 'downloads', iconSlug: 'radarr', color: '#FFC230', keywords: ['radarr'] },
  { port: 9696, name: 'Prowlarr', subtitle: 'Indexer Manager', group: 'downloads', iconSlug: 'prowlarr', color: '#EC583B', keywords: ['prowlarr'] },
  { port: 8686, name: 'Lidarr', subtitle: 'Music Management', group: 'downloads', iconSlug: 'lidarr', color: '#00BA7C', keywords: ['lidarr'] },
  { port: 8787, name: 'Readarr', subtitle: 'Book Management', group: 'downloads', iconSlug: 'readarr', color: '#E0245E', keywords: ['readarr'] },
  { port: 6767, name: 'Bazarr', subtitle: 'Subtitles Manager', group: 'downloads', iconSlug: 'bazarr', color: '#5B4EB3', keywords: ['bazarr'] },
  { port: 8081, name: 'SABnzbd', subtitle: 'Usenet Downloader', group: 'downloads', iconSlug: 'sabnzbd', color: '#F1C40F', keywords: ['sabnzbd'] },
  { port: 6800, name: 'Aria2', subtitle: 'Download Utility', group: 'downloads', iconSlug: 'aria2', color: '#3498DB', keywords: ['aria2'] },

  // Management & Containers
  { port: 9000, name: 'Portainer', subtitle: 'Docker Stack', group: 'tools', iconSlug: 'portainer', color: '#13BEF9', keywords: ['portainer'] },
  { port: 9443, name: 'Portainer (HTTPS)', subtitle: 'Docker Stack', group: 'tools', iconSlug: 'portainer', color: '#13BEF9', keywords: ['portainer'] },
  { port: 5001, name: 'Dockge', subtitle: 'Docker Compose Hub', group: 'tools', iconSlug: 'dockge', color: '#E17055', keywords: ['dockge'] },
  { port: 8888, name: 'Dozzle', subtitle: 'Container Log Viewer', group: 'tools', iconSlug: 'dozzle', color: '#F39C12', keywords: ['dozzle'] },
  { port: 9090, name: 'Cockpit', subtitle: 'Linux Server Admin', group: 'tools', iconSlug: 'cockpit', color: '#0088CE', keywords: ['cockpit'] },
  { port: 8006, name: 'Proxmox VE', subtitle: 'Virtualization Platform', group: 'tools', iconSlug: 'proxmox', color: '#E57000', keywords: ['proxmox', 'pve'] },
  { port: 5000, name: 'Synology DSM', subtitle: 'DiskStation Manager', group: 'primary', iconSlug: 'synology', color: '#2B5B84', keywords: ['synology', 'diskstation'] },

  // Monitoring & Metrics
  { port: 3000, name: 'Grafana', subtitle: 'Metrics & Dashboards', group: 'tools', iconSlug: 'grafana', color: '#F46800', keywords: ['grafana'] },
  { port: 9090, name: 'Prometheus', subtitle: 'Monitoring System', group: 'tools', iconSlug: 'prometheus', color: '#E6522C', keywords: ['prometheus'] },
  { port: 3001, name: 'Uptime Kuma', subtitle: 'Status Monitor', group: 'tools', iconSlug: 'uptime-kuma', color: '#5CD85A', keywords: ['uptime-kuma', 'kuma'] },
  { port: 19999, name: 'Netdata', subtitle: 'Real-time Monitoring', group: 'tools', iconSlug: 'netdata', color: '#00AB44', keywords: ['netdata'] },
  { port: 61208, name: 'Glances', subtitle: 'System Monitor', group: 'tools', iconSlug: 'glances', color: '#18BC9C', keywords: ['glances'] },

  // Networking, DNS & Security
  { port: 81, name: 'Nginx Proxy Manager', subtitle: 'Proxy Management', group: 'networking', iconSlug: 'nginx-proxy-manager', color: '#F58220', keywords: ['nginx-proxy-manager', 'npm'] },
  { port: 8080, name: 'Traefik Dashboard', subtitle: 'Edge Router', group: 'networking', iconSlug: 'traefik', color: '#24A1C1', keywords: ['traefik'] },
  { port: 3000, name: 'AdGuard Home', subtitle: 'Network DNS & AdBlock', group: 'networking', iconSlug: 'adguard-home', color: '#68BC71', keywords: ['adguard', 'adguard-home'] },
  { port: 80, name: 'Pi-hole', subtitle: 'DNS Ad-blocker', group: 'networking', iconSlug: 'pi-hole', color: '#F4231F', keywords: ['pi-hole', 'pihole'] },
  { port: 51821, name: 'WireGuard Easy', subtitle: 'VPN Server UI', group: 'networking', iconSlug: 'wireguard', color: '#88171A', keywords: ['wireguard', 'wg-easy'] },

  // Smart Home & IoT
  { port: 8123, name: 'Home Assistant', subtitle: 'Home Automation', group: 'primary', iconSlug: 'home-assistant', color: '#03A9F4', keywords: ['homeassistant', 'home assistant', 'hass'] },
  { port: 1880, name: 'Node-RED', subtitle: 'IoT Flow Engine', group: 'smart_home', iconSlug: 'node-red', color: '#8F0000', keywords: ['node-red', 'nodered'] },
  { port: 8080, name: 'Zigbee2MQTT', subtitle: 'Zigbee Bridge', group: 'smart_home', iconSlug: 'zigbee2mqtt', color: '#D4AF37', keywords: ['zigbee2mqtt', 'z2m'] },
  { port: 6052, name: 'ESPHome', subtitle: 'ESP Device Management', group: 'smart_home', iconSlug: 'esphome', color: '#4051B5', keywords: ['esphome'] },
  { port: 5000, name: 'Frigate NVR', subtitle: 'AI CCTV & NVR', group: 'smart_home', iconSlug: 'frigate', color: '#FF5722', keywords: ['frigate'] },

  // Cloud & Productivity
  { port: 8080, name: 'Nextcloud', subtitle: 'Private Cloud Storage', group: 'primary', iconSlug: 'nextcloud', color: '#0082C9', keywords: ['nextcloud'] },
  { port: 2283, name: 'Immich', subtitle: 'Photo & Video Backup', group: 'media', iconSlug: 'immich', color: '#4285F4', keywords: ['immich'] },
  { port: 2342, name: 'PhotoPrism', subtitle: 'AI Photo Library', group: 'media', iconSlug: 'photoprism', color: '#8E44AD', keywords: ['photoprism'] },
  { port: 8000, name: 'Paperless-ngx', subtitle: 'Document Archiver', group: 'productivity', iconSlug: 'paperless-ngx', color: '#27AE60', keywords: ['paperless', 'paperless-ngx'] },
  { port: 8080, name: 'Stirling-PDF', subtitle: 'PDF Suite', group: 'productivity', iconSlug: 'stirling-pdf', color: '#E74C3C', keywords: ['stirling-pdf', 'stirling'] },
  { port: 80, name: 'Vaultwarden', subtitle: 'Password Vault', group: 'security', iconSlug: 'vaultwarden', color: '#175DDC', keywords: ['vaultwarden', 'bitwarden'] },
  { port: 8384, name: 'Syncthing', subtitle: 'Continuous File Sync', group: 'storage', iconSlug: 'syncthing', color: '#1A82C4', keywords: ['syncthing'] },
  { port: 5230, name: 'Memos', subtitle: 'Privacy-First Notes', group: 'productivity', iconSlug: 'memos', color: '#34495E', keywords: ['memos'] },
  { port: 8080, name: 'SearXNG', subtitle: 'Metasearch Engine', group: 'tools', iconSlug: 'searxng', color: '#3A87AD', keywords: ['searxng', 'searx'] },

  // Developer & AI
  { port: 3000, name: 'Gitea / Forgejo', subtitle: 'Git Service Hub', group: 'dev_ai', iconSlug: 'gitea', color: '#609926', keywords: ['gitea', 'forgejo'] },
  { port: 8080, name: 'Open WebUI', subtitle: 'LLM Chat Interface', group: 'dev_ai', iconSlug: 'open-webui', color: '#10A37F', keywords: ['open-webui', 'ollama-webui'] },
  { port: 11434, name: 'Ollama API', subtitle: 'Local AI Inference', group: 'dev_ai', iconSlug: 'ollama', color: '#111111', keywords: ['ollama'] },
  { port: 8443, name: 'code-server', subtitle: 'VS Code in Browser', group: 'dev_ai', iconSlug: 'code-server', color: '#007ACC', keywords: ['code-server', 'vscode'] },
  { port: 3900, name: 'Garage S3', subtitle: 'Distributed Object Store', group: 'storage', iconSlug: 'server', color: '#4A69BD', keywords: ['garage'] },
  { port: 8082, name: 'TypeType', subtitle: 'Video Platform', group: 'media', iconSlug: 'youtube', color: '#6C5CE7', keywords: ['typetype'] },
];

function formatCleanTitle(raw) {
  if (!raw) return 'Unknown Service';
  let clean = raw.replace(/^\//, '').replace(/[-_]\d+$/, '');
  clean = clean.replace(/[-_]+/g, ' ');
  return clean
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function matchCatalogEntry(name, image, port, bannerTitle) {
  const searchStr = `${name || ''} ${image || ''} ${bannerTitle || ''}`.toLowerCase();
  
  // 1. Match by keyword in name, image, or banner title
  for (const item of HOMELAB_CATALOG) {
    if (item.keywords.some(k => searchStr.includes(k))) {
      return item;
    }
  }

  // 2. Match by exact standard port if available
  if (port) {
    const portMatch = HOMELAB_CATALOG.find(item => item.port === port);
    if (portMatch) return portMatch;
  }

  return null;
}

function probeTcpPort(host, port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isDone = false;
    const done = (val) => {
      if (!isDone) {
        isDone = true;
        socket.destroy();
        resolve(val);
      }
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    try {
      socket.connect(port, host);
    } catch {
      done(false);
    }
  });
}

function grabHttpBanner(host, port, isHttps = false, timeoutMs = 1200) {
  return new Promise((resolve) => {
    const client = isHttps ? https : http;
    const protocol = isHttps ? 'https' : 'http';
    try {
      const req = client.get(
        `${protocol}://${host}:${port}/`,
        {
          timeout: timeoutMs,
          rejectUnauthorized: false,
          headers: { 'User-Agent': 'KV-Port-Discovery/1.0' }
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
            if (body.length > 32768) res.destroy();
          });
          res.on('end', () => {
            const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
            const title = titleMatch ? cleanText(titleMatch[1].trim()) : '';
            const serverHeader = res.headers['server'] || '';
            const locationHeader = res.headers['location'] || '';
            resolve({ statusCode: res.statusCode, title, serverHeader, locationHeader });
          });
        }
      );
      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    } catch {
      resolve(null);
    }
  });
}

function queryDockerContainers() {
  return new Promise((resolve) => {
    const socketPath = '/var/run/docker.sock';
    if (!fs.existsSync(socketPath)) {
      return resolve([]);
    }
    try {
      const req = http.request(
        {
          socketPath,
          path: '/v1.41/containers/json',
          method: 'GET',
          headers: { Host: 'localhost' },
          timeout: 2500,
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              const containers = JSON.parse(body);
              resolve(Array.isArray(containers) ? containers : []);
            } catch {
              resolve([]);
            }
          });
        }
      );
      req.on('error', () => resolve([]));
      req.on('timeout', () => {
        req.destroy();
        resolve([]);
      });
      req.end();
    } catch {
      resolve([]);
    }
  });
}

async function runAutoDiscovery({ host = '127.0.0.1', scanDocker = true, scanPorts = true, currentLinks = [] }) {
  const discovered = [];
  const seenPorts = new Set();
  const seenNames = new Set();

  const isLocalTarget = host === '127.0.0.1' || host === 'localhost' || host === '0.0.0.0';

  // 1. Docker Socket Discovery (if enabled)
  if (scanDocker) {
    try {
      const containers = await queryDockerContainers();
      for (const c of containers) {
        const rawName = (c.Names && c.Names[0]) || '';
        const name = rawName.replace(/^\//, '');
        const image = c.Image || '';
        const ports = c.Ports || [];

        // Skip internal auxiliary containers / databases that are not web applications
        const isAuxiliary = /(postgres|mysql|mariadb|redis|dragonfly|mongo|companion|downloader|db$)/i.test(`${image} ${name}`);
        if (isAuxiliary) continue;

        // Prioritize host-accessible PublicPort
        const pubPortObj = ports.find(p => p.PublicPort);
        const hostPort = pubPortObj ? pubPortObj.PublicPort : null;
        const isHostNet = c.HostConfig?.NetworkMode === 'host';
        const port = hostPort || (isHostNet ? (ports[0]?.PrivatePort || null) : null);

        // Skip containers without reachable ports on the host
        if (!port) continue;
        if (seenPorts.has(port)) continue;

        // Skip KV-Port itself if local
        if (isLocalTarget && port === PORT) continue;

        // Try probing HTTP title if port is accessible
        let bannerTitle = '';
        if (port) {
          const isHttps = port === 443 || port === 8443 || port === 9443 || port === 8006 || port === 5001;
          const banner = await grabHttpBanner(host, port, isHttps, 600);
          if (banner?.title) bannerTitle = banner.title;
        }

        const match = matchCatalogEntry(name, image, port, bannerTitle);
        const title = (bannerTitle && bannerTitle.length < 30) ? bannerTitle : (match ? match.name : formatCleanTitle(name));
        const subtitle = match ? match.subtitle : 'Docker Service';
        const group = match ? match.group : 'tools';
        const iconSlug = match ? match.iconSlug : 'docker';
        const color = match ? match.color : '#2496ED';

        const linkUrl = port
          ? `http${(port === 443 || port === 8443 || port === 9443 || port === 8006 || port === 5001) ? 's' : ''}://${host}:${port}`
          : `http://${host}`;

        if (port) seenPorts.add(port);
        seenNames.add(title.toLowerCase());

        discovered.push({
          id: Date.now() + Math.floor(Math.random() * 100000),
          label: (match?.keywords?.[0] || name.toLowerCase().replace(/[^a-z0-9-]/g, '-')).slice(0, 24),
          title,
          subtitle,
          link: linkUrl,
          group,
          iconSlug,
          color,
          hoverColor: color,
          featured: false,
          isVideo: false,
          port,
          source: 'docker',
          containerName: name,
          imageName: image,
        });
      }
    } catch (err) {
      console.warn('[Discovery] Docker scan error:', err.message);
    }
  }

  // 2. TCP Port Probing & HTTP Banner Grabbing (if enabled)
  if (scanPorts) {
    // Collect unique ports to scan from catalog
    const portsToProbe = [...new Set(HOMELAB_CATALOG.map(c => c.port))].filter(p => !seenPorts.has(p));
    // Filter out our own port
    const candidatePorts = portsToProbe.filter(p => !(isLocalTarget && p === PORT));

    // Probe in chunks to avoid overwhelming sockets
    const chunkSize = 15;
    for (let i = 0; i < candidatePorts.length; i += chunkSize) {
      const chunk = candidatePorts.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (port) => {
        const isOpen = await probeTcpPort(host, port, 600);
        if (!isOpen) return;

        seenPorts.add(port);
        const isHttps = port === 443 || port === 8443 || port === 9443 || port === 8006 || port === 5001;
        const banner = await grabHttpBanner(host, port, isHttps, 1000);
        const bannerTitle = banner?.title || '';

        const match = matchCatalogEntry('', '', port, bannerTitle);
        const title = (bannerTitle && bannerTitle.length < 30) ? bannerTitle : (match ? match.name : `Service on :${port}`);
        const subtitle = match ? match.subtitle : 'Network Service';
        const group = match ? match.group : 'tools';
        const iconSlug = match ? match.iconSlug : 'server';
        const color = match ? match.color : '#00BCD4';

        const linkUrl = `http${isHttps ? 's' : ''}://${host}:${port}`;

        if (!seenNames.has(title.toLowerCase())) {
          seenNames.add(title.toLowerCase());
          discovered.push({
            id: Date.now() + Math.floor(Math.random() * 100000),
            label: (match?.keywords?.[0] || `port-${port}`).slice(0, 24),
            title,
            subtitle,
            link: linkUrl,
            group,
            iconSlug,
            color,
            hoverColor: color,
            featured: false,
            isVideo: false,
            port,
            source: 'port_probe',
          });
        }
      }));
    }
  }

  // 3. Mark items already existing in dashboard links
  return discovered.map(item => {
    const existing = currentLinks.find(cl => {
      if (!cl) return false;
      if (cl.link && item.link && cl.link.replace(/\/$/, '') === item.link.replace(/\/$/, '')) return true;
      if (cl.title && item.title && cl.title.trim().toLowerCase() === item.title.trim().toLowerCase()) return true;
      if (cl.label && item.label && cl.label.trim().toLowerCase() === item.label.trim().toLowerCase()) return true;
      return false;
    });

    return {
      ...item,
      alreadyExists: !!existing,
      existingId: existing?.id || null,
    };
  });
}

// -------------------------------------------------------------
// MIME & Security Headers
// -------------------------------------------------------------
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; media-src 'self' blob: data:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.open-meteo.com https://geocoding-api.open-meteo.com; frame-ancestors 'none';"
  );
}

function readBody(req, maxBytes = 100 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Payload exceeds maximum size limit (100MB)'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf-8'));
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  applySecurityHeaders(res);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  });
  res.end(JSON.stringify(data));
}

// Serve static file with Range Request support
function serveFile(req, res, filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return serveFile(req, res, path.join(filePath, 'index.html'));
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const total = stat.size;

    applySecurityHeaders(res);

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : total - 1;

      if (start >= total || end >= total) {
        res.writeHead(416, { 'Content-Range': `bytes */${total}` });
        return res.end();
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': total,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}

// Ping helper with fallback from HEAD to GET, handling self-signed certs and LAN addresses
function pingEndpoint(targetUrl) {
  return new Promise((resolve) => {
    let urlObj;
    try {
      urlObj = new URL(targetUrl);
    } catch {
      return resolve({ ok: false, error: 'INVALID_URL' });
    }
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    const start = Date.now();

    const req = client.request(urlObj, {
      method: 'HEAD',
      timeout: 2500,
      rejectUnauthorized: false,
      headers: { 'User-Agent': 'KV-Port-Ping/1.0' }
    }, (res) => {
      resolve({ ok: true, latencyMs: Date.now() - start, status: res.statusCode });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, latencyMs: 2500, error: 'TIMEOUT' });
    });

    req.on('error', () => {
      // Fallback: try GET if HEAD failed
      const getReq = client.request(urlObj, {
        method: 'GET',
        timeout: 2000,
        rejectUnauthorized: false,
        headers: { 'User-Agent': 'KV-Port-Ping/1.0' }
      }, (res) => {
        resolve({ ok: true, latencyMs: Date.now() - start, status: res.statusCode });
      });
      getReq.on('timeout', () => {
        getReq.destroy();
        resolve({ ok: false, latencyMs: 2000, error: 'TIMEOUT' });
      });
      getReq.on('error', (err) => {
        resolve({ ok: false, latencyMs: Date.now() - start, error: err.code || 'OFFLINE' });
      });
      getReq.end();
    });

    req.end();
  });
}

function getSystemStatus() {
  const cpus = os.cpus() || [];
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const uptime = os.uptime();
  const loadAvg = os.loadavg();

  return {
    uptime,
    cpuCount: cpus.length,
    cpuModel: cpus[0]?.model || 'Generic Host',
    loadAvg,
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      percent: Math.round((usedMem / totalMem) * 100)
    },
    hostname: os.hostname(),
    platform: os.platform()
  };
}

// -------------------------------------------------------------
// Request Handler
// -------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  // CORS Preflight - Restricted to same origin / safe methods
  if (req.method === 'OPTIONS') {
    applySecurityHeaders(res);
    res.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);
  const clientIp = getClientIp(req);

  // --- API Endpoints ---

  // Health check & ping probe
  if (pathname === '/api/ping' && req.method === 'GET') {
    const target = parsedUrl.searchParams.get('target');
    if (!target) {
      return sendJson(res, 400, { ok: false, error: 'Missing target parameter' });
    }
    const result = await pingEndpoint(target);
    return sendJson(res, 200, result);
  }

  // Host system telemetry status
  if (pathname === '/api/system/status' && req.method === 'GET') {
    return sendJson(res, 200, getSystemStatus());
  }

  // Live News / RSS Feed Proxy & Cache (Public Read)
  if (pathname === '/api/news' && req.method === 'GET') {
    const feedKey = (parsedUrl.searchParams.get('feed') || 'vnexpress').toLowerCase();
    const customUrl = parsedUrl.searchParams.get('url') || '';
    const targetUrl = customUrl || NEWS_FEEDS[feedKey] || NEWS_FEEDS.vnexpress;
    const sourceLabel = customUrl ? 'Custom' : (feedKey.toUpperCase());

    const cacheKey = targetUrl;
    const cached = newsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < NEWS_CACHE_TTL)) {
      return sendJson(res, 200, { items: cached.items, cached: true });
    }

    try {
      const resp = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        signal: AbortSignal.timeout(6000),
        redirect: 'follow'
      });
      if (!resp.ok) {
        throw new Error(`Feed returned HTTP ${resp.status}`);
      }
      const xml = await resp.text();
      const items = parseRssItems(xml, sourceLabel);
      newsCache.set(cacheKey, { timestamp: Date.now(), items });
      return sendJson(res, 200, { items, cached: false });
    } catch (err) {
      console.warn('[Server] Failed to fetch news feed:', targetUrl, err.message);
      if (cached) {
        return sendJson(res, 200, { items: cached.items, cached: true, stale: true });
      }
      return sendJson(res, 200, { items: [], error: 'Could not fetch feed: ' + err.message });
    }
  }

  // Weather Geocoding Search Proxy (Public Read)
  if (pathname === '/api/weather/search' && req.method === 'GET') {
    const q = parsedUrl.searchParams.get('q');
    if (!q || q.trim().length < 2) {
      return sendJson(res, 200, { results: [] });
    }
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=6&language=en&format=json`;
      const resp = await fetch(geoUrl, {
        headers: { 'User-Agent': 'kv-portal/1.0' }
      });
      if (resp.ok) {
        const data = await resp.json();
        return sendJson(res, 200, { results: data.results || [] });
      }
      return sendJson(res, 200, { results: [] });
    } catch (err) {
      return sendJson(res, 500, { error: 'Geocoding search failed: ' + err.message });
    }
  }

  // Live Weather Proxy (Public Read)
  if (pathname === '/api/weather' && req.method === 'GET') {
    const lat = parsedUrl.searchParams.get('latitude') || '10.823';
    const lon = parsedUrl.searchParams.get('longitude') || '106.63';
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
      const resp = await fetch(weatherUrl, {
        headers: { 'User-Agent': 'kv-portal/1.0' }
      });
      if (resp.ok) {
        const data = await resp.json();
        return sendJson(res, 200, data);
      }
      return sendJson(res, resp.status, { error: 'Weather upstream error' });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to fetch weather: ' + err.message });
    }
  }


  // 1. GET /api/links (Public Read)
  if (pathname === '/api/links' && req.method === 'GET') {
    return sendJson(res, 200, readLinks());
  }

  // 2. POST /api/links (Protected Admin Write)
  if (pathname === '/api/links' && req.method === 'POST') {
    const token = getBearerToken(req);
    if (!verifySessionToken(token)) {
      return sendJson(res, 401, { error: 'Unauthorized: Valid admin session token required' });
    }

    try {
      const body = await readBody(req);
      const data = JSON.parse(body);
      if (!Array.isArray(data)) {
        return sendJson(res, 400, { error: 'Payload must be an array of links' });
      }
      writeLinks(data);
      console.log(`[Server] Updated links: ${data.length} items saved.`);
      return sendJson(res, 200, { success: true, count: data.length });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid JSON payload: ' + err.message });
    }
  }

  // 3. POST /api/upload-video (Protected Admin Video Upload)
  if (pathname === '/api/upload-video' && req.method === 'POST') {
    const token = getBearerToken(req);
    if (!verifySessionToken(token)) {
      return sendJson(res, 401, { error: 'Unauthorized: Valid admin session token required' });
    }

    try {
      const body = await readBody(req);
      const { filename, base64Data } = JSON.parse(body);
      if (!base64Data) {
        return sendJson(res, 400, { error: 'Missing base64Data' });
      }

      const cleanExt = path.extname(filename || '').toLowerCase();
      if (cleanExt !== '.mp4' && cleanExt !== '.webm') {
        return sendJson(res, 400, { error: 'Invalid extension. Only .mp4 and .webm videos are permitted.' });
      }

      const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Clean, 'base64');

      // Magic byte verification to prevent Stored XSS / disguise
      if (!isValidVideoFormat(buffer, filename)) {
        return sendJson(res, 400, { error: 'Invalid file signature. Uploaded data is not a valid MP4 or WebM video.' });
      }

      const cleanName = path.basename(filename || 'video.mp4').replace(/[^a-zA-Z0-9._-]/g, '_');
      const targetName = `${Date.now()}_${cleanName}`;
      const targetPath = path.join(uploadsDir, targetName);

      fs.writeFileSync(targetPath, buffer);

      // Sync to public/uploads if running in dev environment
      const publicUploadsDir = path.resolve(__dirname, 'public/uploads');
      if (fs.existsSync(publicUploadsDir)) {
        try {
          fs.writeFileSync(path.join(publicUploadsDir, targetName), buffer);
        } catch {
          // ignore
        }
      }

      console.log(`[Server] Video uploaded: ${targetName} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
      return sendJson(res, 200, { success: true, url: `/uploads/${targetName}` });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to upload video: ' + err.message });
    }
  }

  // 4. GET /api/settings (Public Read)
  if (pathname === '/api/settings' && req.method === 'GET') {
    return sendJson(res, 200, readSettings());
  }

  // 5. POST /api/settings (Protected Admin Write)
  if (pathname === '/api/settings' && req.method === 'POST') {
    const token = getBearerToken(req);
    if (!verifySessionToken(token)) {
      return sendJson(res, 401, { error: 'Unauthorized: Valid admin session token required' });
    }

    try {
      const body = await readBody(req);
      const data = JSON.parse(body);
      const updated = writeSettings(data);
      console.log('[Server] Updated settings:', updated);
      return sendJson(res, 200, { success: true, settings: updated });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid JSON payload: ' + err.message });
    }
  }

  // 6. POST /api/upload-image (Protected Admin Image/Logo/Icon Upload)
  if (pathname === '/api/upload-image' && req.method === 'POST') {
    const token = getBearerToken(req);
    if (!verifySessionToken(token)) {
      return sendJson(res, 401, { error: 'Unauthorized: Valid admin session token required' });
    }

    try {
      const body = await readBody(req);
      const { filename, base64Data } = JSON.parse(body);
      if (!base64Data) {
        return sendJson(res, 400, { error: 'Missing base64Data' });
      }

      const cleanExt = path.extname(filename || '').toLowerCase();
      const validExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.gif'];
      if (!validExts.includes(cleanExt)) {
        return sendJson(res, 400, { error: 'Invalid extension. Permitted: ' + validExts.join(', ') });
      }

      const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Clean, 'base64');

      if (!isValidImageFormat(buffer, filename)) {
        return sendJson(res, 400, { error: 'Invalid file signature. Uploaded data is not a valid image.' });
      }

      const cleanName = path.basename(filename || 'logo.png').replace(/[^a-zA-Z0-9._-]/g, '_');
      const targetName = `${Date.now()}_${cleanName}`;
      const targetPath = path.join(uploadsDir, targetName);

      fs.writeFileSync(targetPath, buffer);

      const publicUploadsDir = path.resolve(__dirname, 'public/uploads');
      if (fs.existsSync(publicUploadsDir)) {
        try {
          fs.writeFileSync(path.join(publicUploadsDir, targetName), buffer);
        } catch {
          // ignore
        }
      }

      console.log(`[Server] Image uploaded: ${targetName} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return sendJson(res, 200, { success: true, url: `/uploads/${targetName}` });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to upload image: ' + err.message });
    }
  }

  // 7. GET /api/auth/status (Public status check)
  if (pathname === '/api/auth/status' && req.method === 'GET') {
    const auth = readAuth();
    const token = getBearerToken(req);
    const isAuthenticated = verifySessionToken(token);
    return sendJson(res, 200, {
      twoFactorEnabled: !!auth.totpEnabled,
      authenticated: isAuthenticated,
    });
  }

  // 5. POST /api/auth/verify (Password + 2FA Login with Rate Limiting)
  if (pathname === '/api/auth/verify' && req.method === 'POST') {
    const limitStatus = checkRateLimit(clientIp);
    if (limitStatus.locked) {
      return sendJson(res, 429, {
        error: `Too many failed attempts. Access locked for ${limitStatus.remainingSec} more seconds.`,
      });
    }

    try {
      const body = await readBody(req, 1024 * 64);
      const { password, otp } = JSON.parse(body);
      const auth = readAuth();

      // Check password first
      const passwordMatch = verifyPassword(password, auth.passwordHash, auth.salt, auth);
      if (!passwordMatch) {
        recordLoginFailure(clientIp);
        return sendJson(res, 401, { error: 'Invalid password' });
      }

      // Check if 2FA is active
      if (auth.totpEnabled) {
        if (!otp) {
          // Password passed, prompt client for 2FA OTP code
          return sendJson(res, 200, { twoFactorRequired: true });
        }

        const isOtpValid = verifyTOTP(otp, auth.totpSecret);
        if (!isOtpValid) {
          recordLoginFailure(clientIp);
          return sendJson(res, 401, { error: 'Invalid 2FA code. Please check your authenticator app.', twoFactorRequired: true });
        }
      }

      // Login success: reset rate limit & issue HMAC session token
      recordLoginSuccess(clientIp);
      const token = generateSessionToken();
      console.log(`[Security] Successful login from IP ${clientIp}`);
      return sendJson(res, 200, {
        success: true,
        token,
        twoFactorEnabled: !!auth.totpEnabled,
      });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid request: ' + err.message });
    }
  }

  // 6. POST /api/auth/password (Protected Password Update)
  if (pathname === '/api/auth/password' && req.method === 'POST') {
    const token = getBearerToken(req);
    if (!verifySessionToken(token)) {
      return sendJson(res, 401, { error: 'Unauthorized: Valid admin session token required' });
    }

    try {
      const body = await readBody(req, 1024 * 64);
      const { currentPassword, newPassword } = JSON.parse(body);
      if (!newPassword || newPassword.length < 4) {
        return sendJson(res, 400, { error: 'New password must be at least 4 characters long' });
      }

      const auth = readAuth();
      const match = verifyPassword(currentPassword, auth.passwordHash, auth.salt, auth);
      if (!match) {
        return sendJson(res, 401, { error: 'Current password incorrect' });
      }

      const { hash, salt } = hashPassword(newPassword);
      auth.passwordHash = hash;
      auth.salt = salt;
      auth.updatedAt = new Date().toISOString();
      writeAuth(auth);

      console.log('[Security] Admin password updated successfully.');
      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid request: ' + err.message });
    }
  }

  // 7. GET /api/auth/2fa/setup (Protected: Generate TOTP Secret & otpauth URI)
  if (pathname === '/api/auth/2fa/setup' && req.method === 'GET') {
    const token = getBearerToken(req);
    if (!verifySessionToken(token)) {
      return sendJson(res, 401, { error: 'Unauthorized: Valid admin session token required' });
    }

    const secret = generateTOTPSecret();
    const qrUri = `otpauth://totp/KhoaVoPortal:admin?secret=${secret}&issuer=KhoaVoPortal`;

    return sendJson(res, 200, {
      success: true,
      secret,
      qrUri,
    });
  }

  // 8. POST /api/auth/2fa/enable (Protected: Activate 2FA after verifying code)
  if (pathname === '/api/auth/2fa/enable' && req.method === 'POST') {
    const token = getBearerToken(req);
    if (!verifySessionToken(token)) {
      return sendJson(res, 401, { error: 'Unauthorized: Valid admin session token required' });
    }

    try {
      const body = await readBody(req, 1024 * 64);
      const { secret, otp } = JSON.parse(body);
      if (!secret || !otp) {
        return sendJson(res, 400, { error: 'Secret and OTP code are required' });
      }

      const isValid = verifyTOTP(otp, secret);
      if (!isValid) {
        return sendJson(res, 400, { error: 'Invalid 6-digit verification code. Ensure your device clock is synchronized.' });
      }

      const auth = readAuth();
      auth.totpSecret = secret;
      auth.totpEnabled = true;
      auth.updatedAt = new Date().toISOString();
      writeAuth(auth);

      console.log('[Security] 2FA / TOTP enabled successfully for Admin.');
      return sendJson(res, 200, { success: true, twoFactorEnabled: true });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid request: ' + err.message });
    }
  }

  // 9. POST /api/auth/2fa/disable (Protected: Disable 2FA with confirmation)
  if (pathname === '/api/auth/2fa/disable' && req.method === 'POST') {
    const token = getBearerToken(req);
    if (!verifySessionToken(token)) {
      return sendJson(res, 401, { error: 'Unauthorized: Valid admin session token required' });
    }

    try {
      const body = await readBody(req, 1024 * 64);
      const { password } = JSON.parse(body);
      const auth = readAuth();

      const match = verifyPassword(password, auth.passwordHash, auth.salt, auth);
      if (!match) {
        return sendJson(res, 401, { error: 'Password incorrect. Cannot disable 2FA.' });
      }

      auth.totpSecret = null;
      auth.totpEnabled = false;
      auth.updatedAt = new Date().toISOString();
      writeAuth(auth);

      console.log('[Security] 2FA / TOTP disabled.');
      return sendJson(res, 200, { success: true, twoFactorEnabled: false });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid request: ' + err.message });
    }
  }

  // 10. POST /api/discover (Protected: Auto-Discover Host Services & Containers)
  if (pathname === '/api/discover' && req.method === 'POST') {
    const token = getBearerToken(req);
    if (!verifySessionToken(token)) {
      return sendJson(res, 401, { error: 'Unauthorized: Valid admin session token required' });
    }

    try {
      const body = await readBody(req, 1024 * 64);
      const params = body ? JSON.parse(body) : {};
      const host = (params.host || '127.0.0.1').trim();
      const scanDocker = params.scanDocker !== false;
      const scanPorts = params.scanPorts !== false;

      const currentLinks = readLinks();
      console.log(`[Discovery] Starting scan for target: ${host} (Docker: ${scanDocker}, Ports: ${scanPorts})...`);

      const discovered = await runAutoDiscovery({
        host,
        scanDocker,
        scanPorts,
        currentLinks,
      });

      console.log(`[Discovery] Found ${discovered.length} candidate services on ${host}.`);
      return sendJson(res, 200, {
        success: true,
        host,
        count: discovered.length,
        services: discovered,
      });
    } catch (err) {
      console.error('[Discovery] Scan error:', err);
      return sendJson(res, 500, { error: 'Discovery scan failed: ' + err.message });
    }
  }

  // --- Static File Serving ---
  // Serve uploaded videos: /uploads/...
  if (pathname.startsWith('/uploads/')) {
    const relativePath = path.normalize(pathname.replace(/^\/uploads\//, '')).replace(/^(\.\.[/\\])+/, '');
    const uploadFile = path.resolve(uploadsDir, relativePath);
    if (uploadFile.startsWith(uploadsDir + path.sep) && fs.existsSync(uploadFile)) {
      return serveFile(req, res, uploadFile);
    }
    const publicUploadDir = path.resolve(__dirname, 'public/uploads');
    const publicUploadFile = path.resolve(publicUploadDir, relativePath);
    if (publicUploadFile.startsWith(publicUploadDir + path.sep) && fs.existsSync(publicUploadFile)) {
      return serveFile(req, res, publicUploadFile);
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Uploaded file not found');
  }

  // Serve static assets from dist/
  if (fs.existsSync(distDir)) {
    const cleanPath = pathname === '/' ? 'index.html' : pathname.slice(1);
    const normalized = path.normalize(cleanPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.resolve(distDir, normalized);

    if (!filePath.startsWith(distDir + path.sep) && filePath !== path.join(distDir, 'index.html')) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Forbidden');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return serveFile(req, res, filePath);
    }

    // SPA fallback: Return index.html for unrecognized routes
    const indexPath = path.resolve(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return serveFile(req, res, indexPath);
    }
  }

  res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Khoa.vo Portal Backend Active</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: sans-serif; padding: 40px; text-align: center; background: #111; color: #eee;">
        <h2>Khoa.vo Portal Backend Active</h2>
        <p>The <code>dist/</code> folder was not found. Run <code>./launch.sh build</code> to compile frontend assets.</p>
      </body>
    </html>
  `);
});

server.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(` Khoa.vo Portal Hardened Production Server Running`);
  console.log(` URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(` Data Directory:    ${dataDir}`);
  console.log(` Uploads Directory: ${uploadsDir}`);
  console.log(` Dist Directory:    ${distDir}`);
  console.log(` 2FA Engine:        RFC 6238 TOTP Active`);
  console.log(` Rate Limiting:     Active (5 failed attempts max)`);
  console.log(`====================================================`);
});

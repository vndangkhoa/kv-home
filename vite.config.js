import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'node:http';
import https from 'node:https';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function apiPlugin() {
  const dataDir = path.resolve(__dirname, 'data');
  const linksPath = path.resolve(dataDir, 'links.json');
  const settingsPath = path.resolve(dataDir, 'settings.json');
  const authPath = path.resolve(dataDir, 'auth.json');
  const srcLinksPath = path.resolve(__dirname, 'src/data/links.json');
  const srcSettingsPath = path.resolve(__dirname, 'src/data/settings.json');
  const srcAuthPath = path.resolve(__dirname, 'src/data/auth.json');
  const uploadsDir = path.resolve(__dirname, 'uploads');
  const publicUploadsDir = path.resolve(__dirname, 'public/uploads');
  const sessionSecretFile = path.resolve(dataDir, '.session_secret');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

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
    } catch {
      // ignore
    }
  }

  function hashPassword(password, salt) {
    const finalSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, finalSalt, 64).toString('hex');
    return { hash, salt: finalSalt };
  }

  function verifyPassword(password, auth) {
    if (!password || !auth) return false;
    // Legacy plaintext support
    if (auth.password && password === auth.password) return true;
    if (auth.passwordHash && auth.salt) {
      try {
        const testHash = crypto.scryptSync(password, auth.salt, 64).toString('hex');
        const a = Buffer.from(auth.passwordHash, 'hex');
        const b = Buffer.from(testHash, 'hex');
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
      } catch {
        return false;
      }
    }
    return false;
  }

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

  const readLinks = () => {
    try {
      if (fs.existsSync(linksPath)) {
        return JSON.parse(fs.readFileSync(linksPath, 'utf-8'));
      }
      if (fs.existsSync(srcLinksPath)) {
        return JSON.parse(fs.readFileSync(srcLinksPath, 'utf-8'));
      }
    } catch (e) {
      console.error('[Vite API] Error reading links.json:', e);
    }
    return [];
  };

  const writeLinks = (data) => {
    fs.writeFileSync(linksPath, JSON.stringify(data, null, 2), 'utf-8');
    if (fs.existsSync(srcLinksPath)) {
      try {
        fs.writeFileSync(srcLinksPath, JSON.stringify(data, null, 2), 'utf-8');
      } catch {
        // ignore
      }
    }
  };

  const readSettings = () => {
    try {
      if (fs.existsSync(settingsPath)) {
        const parsed = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      if (fs.existsSync(srcSettingsPath)) {
        const parsed = JSON.parse(fs.readFileSync(srcSettingsPath, 'utf-8'));
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('[Vite API] Error reading settings.json:', e);
    }
    return { ...DEFAULT_SETTINGS };
  };

  const writeSettings = (data) => {
    const current = readSettings();
    const merged = { ...current, ...data };
    fs.writeFileSync(settingsPath, JSON.stringify(merged, null, 2), 'utf-8');
    if (fs.existsSync(srcSettingsPath)) {
      try {
        fs.writeFileSync(srcSettingsPath, JSON.stringify(merged, null, 2), 'utf-8');
      } catch {
        // ignore
      }
    }
    return merged;
  };

  const readAuth = () => {
    try {
      if (fs.existsSync(authPath)) {
        return JSON.parse(fs.readFileSync(authPath, 'utf-8'));
      }
      if (fs.existsSync(srcAuthPath)) {
        return JSON.parse(fs.readFileSync(srcAuthPath, 'utf-8'));
      }
    } catch (e) {
      console.error('[Vite API] Error reading auth.json:', e);
    }
    return { password: 'admin' };
  };

  const writeAuth = (data) => {
    fs.writeFileSync(authPath, JSON.stringify(data, null, 2), 'utf-8');
    if (fs.existsSync(srcAuthPath)) {
      try {
        fs.writeFileSync(srcAuthPath, JSON.stringify(data, null, 2), 'utf-8');
      } catch {
        // ignore
      }
    }
  };

  // Base32 & TOTP
  const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  function base32Encode(buffer) {
    let bits = 0, value = 0, output = '';
    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      while (bits >= 5) {
        output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    return output;
  }

  function base32Decode(str) {
    const cleaned = str.toUpperCase().replace(/=+$/, '').replace(/[\s-]/g, '');
    let bits = 0, value = 0, index = 0;
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
        const code = (((hmac[offset] & 0x7f) << 24) |
          ((hmac[offset + 1] & 0xff) << 16) |
          ((hmac[offset + 2] & 0xff) << 8) |
          (hmac[offset + 3] & 0xff)) % 1000000;
        if (code.toString().padStart(6, '0') === cleanedToken) return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  function generateSessionToken() {
    const nonce = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
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
    if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
    return null;
  }

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

  // News Proxy & RSS
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
  const NEWS_CACHE_TTL = 15 * 60 * 1000;

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

  function isValidImageFormat(buffer, filename) {
    if (!buffer || buffer.length < 4) return false;
    const ext = path.extname(filename || '').toLowerCase();
    const validExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.gif'];
    if (!validExts.includes(ext)) return false;

    if (ext === '.png') {
      return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    }
    if (ext === '.jpg' || ext === '.jpeg') {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    if (ext === '.gif') {
      return buffer.subarray(0, 4).toString('ascii') === 'GIF8';
    }
    if (ext === '.webp') {
      return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    }
    if (ext === '.ico') {
      return buffer[0] === 0x00 && buffer[1] === 0x00 && (buffer[2] === 0x01 || buffer[2] === 0x02) && buffer[3] === 0x00;
    }
    if (ext === '.svg') {
      const head = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('utf-8').toLowerCase();
      return head.includes('<svg');
    }
    return false;
  }

  function readBody(req, maxBytes = 100 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      req.on('data', (chunk) => {
        size += chunk.length;
        if (size > maxBytes) {
          reject(new Error('Payload exceeds maximum size limit'));
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

  const sendJson = (res, statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
  };

  const handleApi = async (req, res, next) => {
    const url = req.url ? req.url.split('?')[0] : '';

    if (url === '/api/ping' && req.method === 'GET') {
      try {
        const parsed = new URL(req.url, 'http://localhost');
        const target = parsed.searchParams.get('target');
        if (!target) return sendJson(res, 400, { ok: false, error: 'Missing target' });
        const result = await pingEndpoint(target);
        return sendJson(res, 200, result);
      } catch (err) {
        return sendJson(res, 500, { ok: false, error: err.message });
      }
    }

    if (url === '/api/system/status' && req.method === 'GET') {
      return sendJson(res, 200, getSystemStatus());
    }

    if (url === '/api/news' && req.method === 'GET') {
      try {
        const parsed = new URL(req.url, 'http://localhost');
        const feedKey = (parsed.searchParams.get('feed') || 'vnexpress').toLowerCase();
        const customUrl = parsed.searchParams.get('url') || '';
        const targetUrl = customUrl || NEWS_FEEDS[feedKey] || NEWS_FEEDS.vnexpress;
        const sourceLabel = customUrl ? 'Custom' : feedKey.toUpperCase();

        const cacheKey = targetUrl;
        const cached = newsCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < NEWS_CACHE_TTL) {
          return sendJson(res, 200, { items: cached.items, cached: true });
        }

        let items = [];
        try {
          const resp = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/rss+xml, application/xml, text/xml, */*'
            },
            signal: AbortSignal.timeout(5000),
            redirect: 'follow'
          });
          if (resp.ok) {
            const xml = await resp.text();
            items = parseRssItems(xml, sourceLabel);
          }
        } catch (_directErr) {
          // Fallback to local server.js port 3000 if running
          try {
            const localResp = await fetch(`http://127.0.0.1:3000/api/news?${parsed.searchParams.toString()}`, {
              signal: AbortSignal.timeout(3000)
            });
            if (localResp.ok) {
              const localData = await localResp.json();
              if (Array.isArray(localData.items) && localData.items.length > 0) {
                items = localData.items;
              }
            }
          } catch {
            // ignore
          }
        }

        if (items.length > 0) {
          newsCache.set(cacheKey, { timestamp: Date.now(), items });
          return sendJson(res, 200, { items, cached: false });
        }

        if (cached && cached.items?.length > 0) {
          return sendJson(res, 200, { items: cached.items, cached: true, stale: true });
        }

        return sendJson(res, 200, { items: [], error: 'Feed temporarily unavailable' });
      } catch (err) {
        return sendJson(res, 200, { items: [], error: 'Could not fetch feed: ' + err.message });
      }
    }

    if (url === '/api/weather/search' && req.method === 'GET') {
      try {
        const parsed = new URL(req.url, 'http://localhost');
        const q = parsed.searchParams.get('q');
        if (!q || q.trim().length < 2) return sendJson(res, 200, { results: [] });
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=6&language=en&format=json`;
        const resp = await fetch(geoUrl, { headers: { 'User-Agent': 'kv-portal/1.0' } });
        if (resp.ok) {
          const data = await resp.json();
          return sendJson(res, 200, { results: data.results || [] });
        }
        return sendJson(res, 200, { results: [] });
      } catch (err) {
        return sendJson(res, 500, { error: 'Geocoding search failed: ' + err.message });
      }
    }

    if (url === '/api/weather' && req.method === 'GET') {
      try {
        const parsed = new URL(req.url, 'http://localhost');
        const lat = parsed.searchParams.get('latitude') || '10.823';
        const lon = parsed.searchParams.get('longitude') || '106.63';
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
        const resp = await fetch(weatherUrl, { headers: { 'User-Agent': 'kv-portal/1.0' } });
        if (resp.ok) {
          const data = await resp.json();
          return sendJson(res, 200, data);
        }
        return sendJson(res, resp.status, { error: 'Weather upstream error' });
      } catch (err) {
        return sendJson(res, 500, { error: 'Failed to fetch weather: ' + err.message });
      }
    }

    if (url === '/api/links') {
      if (req.method === 'GET') {
        return sendJson(res, 200, readLinks());
      }
      if (req.method === 'POST') {
        const token = getBearerToken(req);
        if (!verifySessionToken(token)) {
          return sendJson(res, 401, { error: 'Unauthorized: Valid admin token required' });
        }
        try {
          const body = await readBody(req);
          const data = JSON.parse(body);
          if (!Array.isArray(data)) return sendJson(res, 400, { error: 'Payload must be an array' });
          writeLinks(data);
          return sendJson(res, 200, { success: true, count: data.length });
        } catch (e) {
          return sendJson(res, 400, { error: 'Invalid JSON payload: ' + e.message });
        }
      }
    }

    if (url === '/api/settings') {
      if (req.method === 'GET') {
        return sendJson(res, 200, readSettings());
      }
      if (req.method === 'POST') {
        const token = getBearerToken(req);
        if (!verifySessionToken(token)) {
          return sendJson(res, 401, { error: 'Unauthorized: Valid admin session token required' });
        }
        try {
          const body = await readBody(req);
          const data = JSON.parse(body);
          const updated = writeSettings(data);
          return sendJson(res, 200, { success: true, settings: updated });
        } catch (err) {
          return sendJson(res, 400, { error: 'Invalid JSON payload: ' + err.message });
        }
      }
    }

    if (url === '/api/upload-video' && req.method === 'POST') {
      const token = getBearerToken(req);
      if (!verifySessionToken(token)) {
        return sendJson(res, 401, { error: 'Unauthorized: Valid admin token required' });
      }

      try {
        const body = await readBody(req);
        const { filename, base64Data } = JSON.parse(body);
        if (!base64Data) return sendJson(res, 400, { error: 'Missing base64Data' });

        const cleanExt = path.extname(filename || '').toLowerCase();
        if (cleanExt !== '.mp4' && cleanExt !== '.webm') {
          return sendJson(res, 400, { error: 'Invalid extension. Only .mp4 and .webm videos allowed.' });
        }

        const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Clean, 'base64');

        const cleanName = (filename || 'video.mp4').replace(/[^a-zA-Z0-9._-]/g, '_');
        const targetName = `${Date.now()}_${cleanName}`;
        fs.writeFileSync(path.join(uploadsDir, targetName), buffer);

        if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });
        try {
          fs.writeFileSync(path.join(publicUploadsDir, targetName), buffer);
        } catch {
          // ignore
        }

        return sendJson(res, 200, { success: true, url: `/uploads/${targetName}` });
      } catch (e) {
        return sendJson(res, 500, { error: 'Failed to upload video: ' + e.message });
      }
    }

    if (url === '/api/upload-image' && req.method === 'POST') {
      const token = getBearerToken(req);
      if (!verifySessionToken(token)) {
        return sendJson(res, 401, { error: 'Unauthorized: Valid admin session token required' });
      }

      try {
        const body = await readBody(req);
        const { filename, base64Data } = JSON.parse(body);
        if (!base64Data) return sendJson(res, 400, { error: 'Missing base64Data' });

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

        if (fs.existsSync(publicUploadsDir)) {
          try {
            fs.writeFileSync(path.join(publicUploadsDir, targetName), buffer);
          } catch {
            // ignore
          }
        }

        return sendJson(res, 200, { success: true, url: `/uploads/${targetName}` });
      } catch (err) {
        return sendJson(res, 500, { error: 'Failed to upload image: ' + err.message });
      }
    }

    if (url === '/api/auth/status' && req.method === 'GET') {
      const auth = readAuth();
      const token = getBearerToken(req);
      return sendJson(res, 200, {
        twoFactorEnabled: !!auth.totpEnabled,
        authenticated: verifySessionToken(token),
      });
    }

    if (url === '/api/auth/verify' && req.method === 'POST') {
      try {
        const body = await readBody(req);
        const { password, otp } = JSON.parse(body);
        const auth = readAuth();

        if (!verifyPassword(password, auth)) {
          return sendJson(res, 401, { error: 'Invalid password' });
        }

        if (auth.totpEnabled) {
          if (!otp) return sendJson(res, 200, { twoFactorRequired: true });
          if (!verifyTOTP(otp, auth.totpSecret)) {
            return sendJson(res, 401, { error: 'Invalid 2FA code. Please check your authenticator app.', twoFactorRequired: true });
          }
        }

        const token = generateSessionToken();
        return sendJson(res, 200, {
          success: true,
          token,
          twoFactorEnabled: !!auth.totpEnabled,
        });
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid request: ' + e.message });
      }
    }

    if (url === '/api/auth/password' && req.method === 'POST') {
      const token = getBearerToken(req);
      if (!verifySessionToken(token)) {
        return sendJson(res, 401, { error: 'Unauthorized: Valid admin token required' });
      }

      try {
        const body = await readBody(req);
        const { currentPassword, newPassword } = JSON.parse(body);
        if (!newPassword || newPassword.length < 4) {
          return sendJson(res, 400, { error: 'New password must be at least 4 characters long' });
        }
        const auth = readAuth();
        if (!verifyPassword(currentPassword, auth)) {
          return sendJson(res, 401, { error: 'Current password incorrect' });
        }

        const { hash, salt } = hashPassword(newPassword);
        auth.passwordHash = hash;
        auth.salt = salt;
        delete auth.password;
        writeAuth(auth);

        return sendJson(res, 200, { success: true });
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid request: ' + e.message });
      }
    }

    if (url === '/api/auth/2fa/setup' && req.method === 'GET') {
      const token = getBearerToken(req);
      if (!verifySessionToken(token)) {
        return sendJson(res, 401, { error: 'Unauthorized: Valid admin token required' });
      }
      const secret = base32Encode(crypto.randomBytes(20));
      const qrUri = `otpauth://totp/KhoaVoPortal:admin?secret=${secret}&issuer=KhoaVoPortal`;
      return sendJson(res, 200, { success: true, secret, qrUri });
    }

    if (url === '/api/auth/2fa/enable' && req.method === 'POST') {
      const token = getBearerToken(req);
      if (!verifySessionToken(token)) {
        return sendJson(res, 401, { error: 'Unauthorized: Valid admin token required' });
      }
      try {
        const body = await readBody(req);
        const { secret, otp } = JSON.parse(body);
        if (!verifyTOTP(otp, secret)) {
          return sendJson(res, 400, { error: 'Invalid verification code' });
        }
        const auth = readAuth();
        auth.totpSecret = secret;
        auth.totpEnabled = true;
        writeAuth(auth);
        return sendJson(res, 200, { success: true, twoFactorEnabled: true });
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid request: ' + e.message });
      }
    }

    if (url === '/api/auth/2fa/disable' && req.method === 'POST') {
      const token = getBearerToken(req);
      if (!verifySessionToken(token)) {
        return sendJson(res, 401, { error: 'Unauthorized: Valid admin token required' });
      }
      try {
        const body = await readBody(req);
        const { password } = JSON.parse(body);
        const auth = readAuth();
        if (!verifyPassword(password, auth)) {
          return sendJson(res, 401, { error: 'Password incorrect' });
        }
        auth.totpSecret = null;
        auth.totpEnabled = false;
        writeAuth(auth);
        return sendJson(res, 200, { success: true, twoFactorEnabled: false });
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid request: ' + e.message });
      }
    }

    next();
  };

  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(handleApi);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleApi);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    sourcemap: false,
  },
});

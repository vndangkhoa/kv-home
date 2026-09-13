import http from 'node:http';
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
const authFile = path.resolve(dataDir, 'auth.json');
const sessionSecretFile = path.resolve(dataDir, '.session_secret');

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

function verifyPassword(password, hash, salt) {
  if (!password || !hash || !salt) return false;
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
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' blob: data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
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
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
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

  // 4. GET /api/auth/status (Public status check)
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
      const passwordMatch = verifyPassword(password, auth.passwordHash, auth.salt);
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
      const match = verifyPassword(currentPassword, auth.passwordHash, auth.salt);
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

      const match = verifyPassword(password, auth.passwordHash, auth.salt);
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

  // --- Static File Serving ---
  // Serve uploaded videos: /uploads/...
  if (pathname.startsWith('/uploads/')) {
    const relativePath = path.normalize(pathname.replace(/^\/uploads\//, '')).replace(/^(\.\.[\/\\])+/, '');
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
    const normalized = path.normalize(cleanPath).replace(/^(\.\.[\/\\])+/, '');
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

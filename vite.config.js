import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function apiPlugin() {
  const dataDir = path.resolve(__dirname, 'data');
  const linksPath = path.resolve(dataDir, 'links.json');
  const authPath = path.resolve(dataDir, 'auth.json');
  const srcLinksPath = path.resolve(__dirname, 'src/data/links.json');
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
    const defaultAuth = { password: 'thieugia' };
    return defaultAuth;
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

  const sendJson = (res, statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
  };

  const handleApi = (req, res, next) => {
    const url = req.url ? req.url.split('?')[0] : '';

    if (url === '/api/links') {
      if (req.method === 'GET') {
        return sendJson(res, 200, readLinks());
      }
      if (req.method === 'POST') {
        const token = getBearerToken(req);
        if (!verifySessionToken(token)) {
          return sendJson(res, 401, { error: 'Unauthorized: Valid admin token required' });
        }
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (!Array.isArray(data)) return sendJson(res, 400, { error: 'Payload must be an array' });
            writeLinks(data);
            return sendJson(res, 200, { success: true, count: data.length });
          } catch (e) {
            return sendJson(res, 400, { error: 'Invalid JSON payload: ' + e.message });
          }
        });
        return;
      }
    }

    if (url === '/api/upload-video' && req.method === 'POST') {
      const token = getBearerToken(req);
      if (!verifySessionToken(token)) {
        return sendJson(res, 401, { error: 'Unauthorized: Valid admin token required' });
      }

      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf-8');
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
          fs.writeFileSync(path.join(publicUploadsDir, targetName), buffer);

          return sendJson(res, 200, { success: true, url: `/uploads/${targetName}` });
        } catch (e) {
          return sendJson(res, 500, { error: 'Failed to upload video: ' + e.message });
        }
      });
      return;
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
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
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
      });
      return;
    }

    if (url === '/api/auth/password' && req.method === 'POST') {
      const token = getBearerToken(req);
      if (!verifySessionToken(token)) {
        return sendJson(res, 401, { error: 'Unauthorized: Valid admin token required' });
      }

      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
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
      });
      return;
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
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
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
      });
      return;
    }

    if (url === '/api/auth/2fa/disable' && req.method === 'POST') {
      const token = getBearerToken(req);
      if (!verifySessionToken(token)) {
        return sendJson(res, 401, { error: 'Unauthorized: Valid admin token required' });
      }
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
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
      });
      return;
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
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    port: 4173,
  },
  build: {
    sourcemap: false,
  },
});

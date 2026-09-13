import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
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

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Seed initial data files if missing
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
if (!fs.existsSync(authFile)) {
  if (fs.existsSync(initialAuthFile)) {
    fs.copyFileSync(initialAuthFile, authFile);
    console.log('[Server] Seeded data/auth.json from src/data/auth.json');
  } else {
    fs.writeFileSync(authFile, JSON.stringify({ password: 'thieugia' }, null, 2), 'utf-8');
  }
}

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
  // Also keep src/data/links.json synced if in repo workspace
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
      return JSON.parse(fs.readFileSync(authFile, 'utf-8'));
    }
  } catch (err) {
    console.error('[Server] Error reading auth.json:', err);
  }
  return { password: 'thieugia' };
}

function writeAuth(data) {
  fs.writeFileSync(authFile, JSON.stringify(data, null, 2), 'utf-8');
  if (fs.existsSync(initialAuthFile)) {
    try {
      fs.writeFileSync(initialAuthFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  }
}

// MIME types
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

function readBody(req, maxBytes = 100 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Payload too large'));
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
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

// Serve static file with Range Request support (crucial for video streaming)
function serveFile(req, res, filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return serveFile(req, res, path.join(filePath, 'index.html'));
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const total = stat.size;

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : total - 1;

      if (start >= total || end >= total) {
        res.writeHead(416, { 'Content-Range': `bytes */${total}` });
        return res.end();
      }

      const chunksize = (end - start) + 1;
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

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // --- API Endpoints ---
  if (pathname === '/api/links') {
    if (req.method === 'GET') {
      return sendJson(res, 200, readLinks());
    }

    if (req.method === 'POST') {
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
  }

  if (pathname === '/api/upload-video' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { filename, base64Data } = JSON.parse(body);
      if (!base64Data) {
        return sendJson(res, 400, { error: 'Missing base64Data' });
      }

      const cleanName = (filename || 'video.mp4').replace(/[^a-zA-Z0-9._-]/g, '_');
      const targetName = `${Date.now()}_${cleanName}`;
      const targetPath = path.join(uploadsDir, targetName);

      const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Clean, 'base64');
      fs.writeFileSync(targetPath, buffer);

      // Also copy to public/uploads if running locally
      const publicUploadsDir = path.resolve(__dirname, 'public/uploads');
      if (fs.existsSync(publicUploadsDir)) {
        try {
          fs.writeFileSync(path.join(publicUploadsDir, targetName), buffer);
        } catch {
          // ignore
        }
      }

      console.log(`[Server] Uploaded video saved: ${targetName} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
      return sendJson(res, 200, { success: true, url: `/uploads/${targetName}` });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to upload video: ' + err.message });
    }
  }

  if (pathname === '/api/auth/verify' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { password } = JSON.parse(body);
      const auth = readAuth();
      if (password === auth.password) {
        return sendJson(res, 200, { success: true });
      }
      return sendJson(res, 401, { error: 'Invalid password' });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid request' });
    }
  }

  if (pathname === '/api/auth/password' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { currentPassword, newPassword } = JSON.parse(body);
      const auth = readAuth();
      if (currentPassword === auth.password) {
        writeAuth({ password: newPassword });
        console.log('[Server] Admin password updated successfully.');
        return sendJson(res, 200, { success: true });
      }
      return sendJson(res, 401, { error: 'Current password incorrect' });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid request' });
    }
  }

  // --- Static File Serving ---
  // Serve uploaded videos: /uploads/...
  if (pathname.startsWith('/uploads/')) {
    const uploadFile = path.resolve(uploadsDir, pathname.replace(/^\/uploads\//, ''));
    if (uploadFile.startsWith(uploadsDir) && fs.existsSync(uploadFile)) {
      return serveFile(req, res, uploadFile);
    }
    // Fallback: check public/uploads/
    const publicUploadFile = path.resolve(__dirname, 'public', pathname.slice(1));
    if (fs.existsSync(publicUploadFile)) {
      return serveFile(req, res, publicUploadFile);
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Uploaded file not found');
  }

  // Serve static assets from dist/
  if (fs.existsSync(distDir)) {
    let filePath = path.resolve(distDir, pathname === '/' ? 'index.html' : pathname.slice(1));
    // Security check against directory traversal
    if (!filePath.startsWith(distDir)) {
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
    <html>
      <body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h2>Khoa.vo Portal Backend Active</h2>
        <p>The <code>dist/</code> folder was not found. Run <code>npm run build</code> to generate frontend assets.</p>
      </body>
    </html>
  `);
});

server.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(` Khoa.vo Portal Production Server Running`);
  console.log(` URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(` Data Directory:    ${dataDir}`);
  console.log(` Uploads Directory: ${uploadsDir}`);
  console.log(` Dist Directory:    ${distDir}`);
  console.log(`====================================================`);
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function apiPlugin() {
  const linksPath = path.resolve(__dirname, 'src/data/links.json')
  const authPath = path.resolve(__dirname, 'src/data/auth.json')
  const uploadsDir = path.resolve(__dirname, 'public/uploads')

  const readLinks = () => {
    try {
      if (fs.existsSync(linksPath)) {
        return JSON.parse(fs.readFileSync(linksPath, 'utf-8'))
      }
    } catch (e) {
      console.error('Error reading links.json:', e)
    }
    return []
  }

  const writeLinks = (data) => {
    fs.writeFileSync(linksPath, JSON.stringify(data, null, 2), 'utf-8')
  }

  const readAuth = () => {
    try {
      if (fs.existsSync(authPath)) {
        return JSON.parse(fs.readFileSync(authPath, 'utf-8'))
      }
    } catch (e) {
      console.error('Error reading auth.json:', e)
    }
    return { password: 'thieugia' }
  }

  const writeAuth = (data) => {
    fs.writeFileSync(authPath, JSON.stringify(data, null, 2), 'utf-8')
  }

  const handleApi = (req, res, next) => {
    const url = req.url ? req.url.split('?')[0] : ''

    if (url === '/api/links') {
      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(readLinks()))
        return
      }

      if (req.method === 'POST') {
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            writeLinks(data)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, count: data.length }))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid JSON payload' }))
          }
        })
        return
      }
    }

    if (url === '/api/upload-video' && req.method === 'POST') {
      const chunks = []
      req.on('data', (chunk) => chunks.push(chunk))
      req.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf-8')
          const { filename, base64Data } = JSON.parse(body)
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
          }
          const cleanName = (filename || 'video.mp4').replace(/[^a-zA-Z0-9._-]/g, '_')
          const targetName = `${Date.now()}_${cleanName}`
          const targetPath = path.join(uploadsDir, targetName)

          const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '')
          const buffer = Buffer.from(base64Clean, 'base64')
          fs.writeFileSync(targetPath, buffer)

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true, url: `/uploads/${targetName}` }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to upload video: ' + e.message }))
        }
      })
      return
    }

    if (url === '/api/auth/verify' && req.method === 'POST') {
      let body = ''
      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        try {
          const { password } = JSON.parse(body)
          const auth = readAuth()
          if (password === auth.password) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          } else {
            res.statusCode = 401
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid password' }))
          }
        } catch (e) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid request' }))
        }
      })
      return
    }

    if (url === '/api/auth/password' && req.method === 'POST') {
      let body = ''
      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        try {
          const { currentPassword, newPassword } = JSON.parse(body)
          const auth = readAuth()
          if (currentPassword === auth.password) {
            writeAuth({ password: newPassword })
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          } else {
            res.statusCode = 401
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Current password incorrect' }))
          }
        } catch (e) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid request' }))
        }
      })
      return
    }

    next()
  }

  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(handleApi)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleApi)
    }
  }
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
})

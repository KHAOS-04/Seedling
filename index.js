import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import { registerPresenceHandlers } from './handlers/presenceHandler.js'
import { registerChatHandlers }     from './handlers/chatHandler.js'
import { registerTaskHandlers }     from './handlers/taskHandler.js'
import { registerUploadRoute }      from './handlers/uploadHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Express ──────────────────────────────────────────────────────────────────
const app = express()
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => res.send('🌱 Seedling server is running'))

registerUploadRoute(app)

// ── Socket.IO ────────────────────────────────────────────────────────────────
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  const username = socket.handshake.auth.username?.trim() || 'Anonymous'

  registerPresenceHandlers(io, socket, username)
  registerChatHandlers(io, socket, username)
  registerTaskHandlers(io, socket, username)
})

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`\n🌱 Seedling server → http://localhost:${PORT}\n`)
})

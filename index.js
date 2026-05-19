import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

// --- Express setup ---
const app = express()
app.use(cors())
app.use(express.json())

// A simple health-check route so you can visit http://localhost:3001
// in your browser and confirm the server is running.
app.get('/', (req, res) => {
  res.send('🌱 Seedling server is running!')
})

// --- HTTP + Socket.IO setup ---
// Socket.IO needs to wrap the raw HTTP server (not just Express).
// This is the standard Socket.IO setup pattern.
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Only allow our Vite frontend
    methods: ['GET', 'POST'],
  },
})

// --- Socket.IO events ---
// This block runs once for every new browser that connects.
io.on('connection', (socket) => {
  // socket.handshake.auth contains data the client sent on connect.
  // We sent { username } from App.jsx.
  const username = socket.handshake.auth.username || 'Anonymous'

  console.log(`✅ ${username} connected (socket: ${socket.id})`)

  // Send a welcome message back to just this client (not everyone).
  // socket.emit() = send to this client only
  // io.emit()     = send to ALL clients
  socket.emit('welcome', {
    message: `Welcome to Seedling, ${username}!`,
    socketId: socket.id,
  })

  // This fires when the browser tab closes, user navigates away, etc.
  socket.on('disconnect', () => {
    console.log(`❌ ${username} disconnected`)
  })
})

// --- Start listening ---
const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`\n🌱 Seedling server running on http://localhost:${PORT}`)
  console.log(`   Waiting for connections...\n`)
})

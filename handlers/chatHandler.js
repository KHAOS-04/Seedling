import { nanoid } from 'nanoid'
import db, { writeDB } from '../lib/db.js'
import { setTyping, getTypers } from '../lib/state.js'

const HISTORY_LIMIT = 50

export function registerChatHandlers(io, socket, username) {

  // ── Join room ────────────────────────────────────────────────────────────
  socket.on('room:join', ({ roomId }) => {
    // Leave every room this socket is currently in (except its private room)
    ;[...socket.rooms]
      .filter((r) => r !== socket.id)
      .forEach((r) => {
        socket.leave(r)
        setTyping(r, username, false)
        socket.to(r).emit('typing:update', { typers: getTypers(r) })
      })

    socket.join(roomId)

    // Send room history from in-memory data (no disk read needed — db.data is current)
    const history = db.data.messages
      .filter((m) => m.roomId === roomId)
      .slice(-HISTORY_LIMIT)
    socket.emit('chat:history', history)

    console.log(`[room] ${username} → #${roomId}`)
  })

  // ── Leave room ───────────────────────────────────────────────────────────
  socket.on('room:leave', ({ roomId }) => {
    socket.leave(roomId)
    setTyping(roomId, username, false)
    socket.to(roomId).emit('typing:update', { typers: getTypers(roomId) })
  })

  // ── Send message ─────────────────────────────────────────────────────────
  socket.on('chat:send', ({ roomId, text }) => {
    if (!text?.trim() || !roomId) return
    if (text.length > 2000) return

    const message = {
      id:        nanoid(),
      roomId,
      username,                      // always use server-stored username
      text:      text.trim(),
      createdAt: new Date().toISOString(),
      type:      'message',
    }

    db.data.messages.push(message)
    writeDB()                         // queued non-blocking write

    io.to(roomId).emit('chat:receive', message)
    console.log(`[msg] #${roomId} | ${username}: ${text.slice(0, 60)}`)
  })

  // ── Typing ───────────────────────────────────────────────────────────────
  socket.on('typing:start', ({ roomId }) => {
    setTyping(roomId, username, true)
    socket.to(roomId).emit('typing:update', { typers: getTypers(roomId) })
  })

  socket.on('typing:stop', ({ roomId }) => {
    setTyping(roomId, username, false)
    socket.to(roomId).emit('typing:update', { typers: getTypers(roomId) })
  })
}

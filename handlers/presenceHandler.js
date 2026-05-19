import { addUser, removeUser, getOnlineUsers } from '../lib/state.js'

export function registerPresenceHandlers(io, socket, username) {
  addUser(socket.id, username)
  io.emit('presence:update', getOnlineUsers())
  console.log(`[+] ${username} connected  (${getOnlineUsers().length} online)`)

  socket.on('disconnect', () => {
    removeUser(socket.id)
    io.emit('presence:update', getOnlineUsers())
    console.log(`[-] ${username} disconnected (${getOnlineUsers().length} online)`)
  })
}

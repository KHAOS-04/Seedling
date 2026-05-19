import { io } from 'socket.io-client'

// One socket instance shared across the whole app.
// autoConnect: false means we connect manually once the user picks a username.
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
})

export default socket

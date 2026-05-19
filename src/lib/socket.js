import { io } from 'socket.io-client'

// We create ONE socket connection for the whole app.
// Importing this file from any component gives the same instance.
const socket = io('http://localhost:3001', {
  autoConnect: false, // We connect manually after the user picks a username
})

export default socket
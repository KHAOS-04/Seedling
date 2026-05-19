import { useEffect, useState } from 'react'
import socket from '../lib/socket'

// This hook manages the socket connection lifecycle.
// Any component can call useSocket() to get connection state.
export function useSocket(username) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!username) return // Don't connect until we have a username

    // Attach the username so the server knows who this socket belongs to
    socket.auth = { username }
    socket.connect()

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    // Cleanup: remove listeners when the component unmounts
    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [username])

  return { socket, connected }
}

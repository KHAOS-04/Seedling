import { useEffect, useState } from 'react'
import socket from './lib/socket'
import UsernameModal from './components/UsernameModal'
import Sidebar from './components/Sidebar'
import ChatRoom from './components/ChatRoom'
import TaskBoard from './components/TaskBoard'

// App.jsx is the top-level shell.
// It owns the global state: username, current room, online users, tasks.
// Child components receive what they need as props.

export default function App() {
  const [username, setUsername]       = useState('')
  const [connected, setConnected]     = useState(false)
  const [currentRoom, setCurrentRoom] = useState('general')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [tasks, setTasks]             = useState([]) // for sprout pips in sidebar

  // ── Connect when username is set ──────────────────────────────────────────
  useEffect(() => {
    if (!username) return

    socket.auth = { username }
    socket.connect()

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    // Server broadcasts the updated online list whenever someone joins/leaves
    socket.on('presence:update', (users) => {
      setOnlineUsers(users)
    })

    // Keep tasks in sync for the sprout pip display in the sidebar
    socket.on('task:all', (allTasks) => setTasks(allTasks))
    socket.on('task:update', (updated) => {
      setTasks((prev) => {
        const exists = prev.find((t) => t.id === updated.id)
        return exists
          ? prev.map((t) => t.id === updated.id ? updated : t)
          : [...prev, updated]
      })
    })
    socket.on('task:removed', ({ id }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('presence:update')
      socket.off('task:all')
      socket.off('task:update')
      socket.off('task:removed')
    }
  }, [username])

  // ── Username prompt ───────────────────────────────────────────────────────
  if (!username) {
    return <UsernameModal onJoin={setUsername} />
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-purple-50 overflow-hidden">

      {/* Left sidebar */}
      <Sidebar
        currentRoom={currentRoom}
        onRoomChange={setCurrentRoom}
        onlineUsers={onlineUsers}
        username={username}
        tasks={tasks}
        connected={connected}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 rounded-l-3xl overflow-hidden shadow-sm border-l border-purple-100">
        {currentRoom === 'tasks' ? (
          <TaskBoard username={username} />
        ) : (
          <ChatRoom roomId={currentRoom} username={username} />
        )}
      </main>
    </div>
  )
}

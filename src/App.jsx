import { useEffect, useState } from 'react'
import socket from './lib/socket'
import UsernameModal from './components/UsernameModal'
import Sidebar       from './components/Sidebar'
import ChatRoom      from './components/ChatRoom'
import TaskBoard     from './components/TaskBoard'

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE NOTE
//
// App.jsx owns ALL global socket listeners (presence, tasks).
// Child components receive data as props and emit events only.
//
// ChatRoom is the sole exception — it manages room-scoped listeners
// (chat:history, chat:receive, typing:update) that must reset on room change.
//
// WHY: socket.off('event', fn) removes only that exact function reference.
// Without named refs, socket.off('event') wipes ALL listeners for that event
// across every component — the root cause of the previous bugs.
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [username,    setUsername]    = useState('')
  const [connected,   setConnected]   = useState(false)
  const [currentRoom, setCurrentRoom] = useState('general')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [tasks,       setTasks]       = useState([])

  // Connect once the user has chosen a name
  useEffect(() => {
    if (!username) return

    socket.auth = { username }
    socket.connect()

    // ── Named handler refs ─────────────────────────────────────────────────
    const onConnect    = ()      => setConnected(true)
    const onDisconnect = ()      => setConnected(false)
    const onPresence   = (users) => setOnlineUsers(users)
    const onTaskAll    = (list)  => setTasks(list)

    const onTaskUpdate = (updated) =>
      setTasks((prev) =>
        prev.some((t) => t.id === updated.id)
          ? prev.map((t) => (t.id === updated.id ? updated : t))
          : [...prev, updated]
      )

    const onTaskRemoved = ({ id }) =>
      setTasks((prev) => prev.filter((t) => t.id !== id))

    socket.on('connect',         onConnect)
    socket.on('disconnect',      onDisconnect)
    socket.on('presence:update', onPresence)
    socket.on('task:all',        onTaskAll)
    socket.on('task:update',     onTaskUpdate)
    socket.on('task:removed',    onTaskRemoved)

    return () => {
      socket.off('connect',         onConnect)
      socket.off('disconnect',      onDisconnect)
      socket.off('presence:update', onPresence)
      socket.off('task:all',        onTaskAll)
      socket.off('task:update',     onTaskUpdate)
      socket.off('task:removed',    onTaskRemoved)
    }
  }, [username])

  if (!username) return <UsernameModal onJoin={setUsername} />

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F7FF]">
      <Sidebar
        currentRoom={currentRoom}
        onRoomChange={setCurrentRoom}
        onlineUsers={onlineUsers}
        username={username}
        tasks={tasks}
        connected={connected}
      />
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-white rounded-tl-3xl border-l border-purple-100 shadow-sm">
        {currentRoom === 'tasks' ? (
          <TaskBoard username={username} tasks={tasks} />
        ) : (
          <ChatRoom roomId={currentRoom} username={username} />
        )}
      </main>
    </div>
  )
}

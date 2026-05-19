import Avatar from './Avatar'

const ROOMS = [
  { id: 'general', emoji: '💬', label: 'general' },
  { id: 'design',  emoji: '🎨', label: 'design'  },
  { id: 'backend', emoji: '⚙️',  label: 'backend' },
]

// Sprout pips: show task completion progress per user
function SproutPips({ filled }) {
  return (
    <div className="flex gap-[3px] mt-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-[5px] h-[5px] rounded-full transition-all duration-300 ${
            i < filled ? 'bg-purple-500' : 'bg-purple-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function Sidebar({
  currentRoom,
  onRoomChange,
  onlineUsers,
  username,
  tasks,
  connected,
}) {
  // Derived: completed tasks per user (for sprout pips)
  function doneCount(user) {
    return Math.min(tasks.filter((t) => t.assignee === user && t.column === 'done').length, 5)
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full bg-white border-r border-purple-100 select-none">

      {/* ── Logo ── */}
      <div className="px-4 py-4 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="text-base font-bold text-purple-700">Seedling</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${connected ? 'bg-green-400' : 'bg-pink-400'}`} />
          <span className="text-[10px] text-purple-400">{connected ? 'Connected' : 'Reconnecting...'}</span>
        </div>
      </div>

      {/* ── Rooms ── */}
      <div className="px-2 pt-4">
        <p className="px-2 mb-1.5 text-[10px] font-bold text-purple-300 uppercase tracking-widest">Rooms</p>
        <nav className="flex flex-col gap-0.5">
          {ROOMS.map((room) => (
            <button
              key={room.id}
              onClick={() => onRoomChange(room.id)}
              className={`
                w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-2
                transition-all duration-150 font-medium
                ${currentRoom === room.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-purple-400 hover:bg-purple-50 hover:text-purple-600'}
              `}
            >
              <span>{room.emoji}</span>
              <span># {room.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ── Workspace ── */}
      <div className="px-2 pt-3">
        <p className="px-2 mb-1.5 text-[10px] font-bold text-purple-300 uppercase tracking-widest">Workspace</p>
        <button
          onClick={() => onRoomChange('tasks')}
          className={`
            w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-2
            transition-all duration-150 font-medium
            ${currentRoom === 'tasks'
              ? 'bg-yellow-100 text-yellow-700'
              : 'text-purple-400 hover:bg-yellow-50 hover:text-yellow-600'}
          `}
        >
          <span>🗂</span>
          <span>Task board</span>
        </button>
      </div>

      {/* ── Online users ── */}
      <div className="flex-1 overflow-y-auto px-2 pt-4">
        <p className="px-2 mb-1.5 text-[10px] font-bold text-purple-300 uppercase tracking-widest">
          Online · {onlineUsers.length}
        </p>
        <div className="flex flex-col gap-0.5">
          {onlineUsers.map((u) => (
            <div key={u.username} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-purple-50 transition-colors">
              <div className="relative flex-shrink-0">
                <Avatar username={u.username} />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-purple-800 truncate">
                  {u.username}
                  {u.username === username && <span className="text-purple-300 font-normal ml-1">(you)</span>}
                </p>
                <SproutPips filled={doneCount(u.username)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Current user footer ── */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-purple-100 bg-purple-50">
        <div className="flex items-center gap-2">
          <Avatar username={username} size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-purple-700 truncate">{username}</p>
            <p className="text-[10px] text-purple-400">Active now</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

import { useEffect, useState } from 'react'
import socket from '../lib/socket'

// TaskBoard receives `tasks` as a prop — App.jsx owns all task socket listeners.
// This component only EMITS events (task:getAll, task:create, task:move, task:delete).
// It never calls socket.on() for task events — that would cause duplicates.

const COLUMNS = [
  { id: 'todo',  label: 'To do',       emoji: '📋',
    colBg: 'bg-blue-50',   colBorder: 'border-blue-100',   countCls: 'bg-blue-100 text-blue-600',   dropRing: 'ring-blue-300'   },
  { id: 'doing', label: 'In progress', emoji: '⚡',
    colBg: 'bg-yellow-50', colBorder: 'border-yellow-100', countCls: 'bg-yellow-100 text-yellow-600', dropRing: 'ring-yellow-300' },
  { id: 'done',  label: 'Done',        emoji: '✅',
    colBg: 'bg-green-50',  colBorder: 'border-green-100',  countCls: 'bg-green-100 text-green-600',  dropRing: 'ring-green-300'  },
]

const COLORS = {
  purple: { card: 'bg-purple-50 border-purple-200', title: 'text-purple-700', badge: 'bg-purple-100 text-purple-600', dot: '#EDE9FF' },
  pink:   { card: 'bg-pink-50   border-pink-200',   title: 'text-pink-700',   badge: 'bg-pink-100   text-pink-600',   dot: '#FCE7F3' },
  yellow: { card: 'bg-yellow-50 border-yellow-200', title: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-600', dot: '#FEF9C3' },
  blue:   { card: 'bg-blue-50   border-blue-200',   title: 'text-blue-700',   badge: 'bg-blue-100   text-blue-600',   dot: '#DBEAFE' },
}

// ── TaskCard ──────────────────────────────────────────────────────────────────
function TaskCard({ task, dragging, onDragStart, onDragEnd, onDelete }) {
  const c = COLORS[task.color] ?? COLORS.purple
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`
        group relative border rounded-2xl p-3 select-none
        cursor-grab active:cursor-grabbing
        hover:shadow-sm hover:-translate-y-0.5
        transition-all duration-150
        ${c.card}
        ${dragging ? 'opacity-40' : 'opacity-100'}
      `}
    >
      <p className={`text-sm font-medium leading-snug pr-5 ${c.title}`}>{task.title}</p>
      <div className="flex items-center justify-between mt-2 gap-1">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
          {task.assignee}
        </span>
        {task.dueDate && (
          <span className="text-[10px] text-purple-400">{task.dueDate}</span>
        )}
      </div>
      {/* Delete button on hover */}
      <button
        onClick={() => onDelete(task.id)}
        className="
          absolute top-2 right-2 w-5 h-5 rounded-full
          border border-pink-200 bg-white text-pink-400 text-xs font-bold
          opacity-0 group-hover:opacity-100
          flex items-center justify-center
          hover:bg-pink-100 transition-all duration-150
        "
      >×</button>
    </div>
  )
}

// ── AddTaskForm ───────────────────────────────────────────────────────────────
function AddTaskForm({ column, username, onAdd, onCancel }) {
  const [title,    setTitle]    = useState('')
  const [assignee, setAssignee] = useState(username)
  const [color,    setColor]    = useState('purple')
  const [dueDate,  setDueDate]  = useState('')

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), assignee, color, dueDate, column })
  }

  return (
    <form onSubmit={submit} className="bg-white border border-purple-200 rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
      <input autoFocus type="text" placeholder="Task title..." value={title}
        onChange={(e) => setTitle(e.target.value)} maxLength={80}
        className="text-sm text-purple-900 placeholder-purple-300 bg-purple-50 rounded-xl px-3 py-2 border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-200 w-full" />
      <input type="text" placeholder="Assignee" value={assignee}
        onChange={(e) => setAssignee(e.target.value)} maxLength={20}
        className="text-xs text-purple-700 bg-purple-50 rounded-xl px-3 py-2 border border-purple-100 focus:outline-none w-full" />
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
        className="text-xs text-purple-500 bg-purple-50 rounded-xl px-3 py-2 border border-purple-100 focus:outline-none w-full" />
      {/* Color picker */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-purple-400">Color:</span>
        {Object.entries(COLORS).map(([name, c]) => (
          <button key={name} type="button" onClick={() => setColor(name)}
            className={`w-5 h-5 rounded-full border-2 transition-transform ${color === name ? 'scale-125 border-purple-400' : 'border-transparent'}`}
            style={{ background: c.dot }} />
        ))}
      </div>
      <div className="flex gap-2 mt-0.5">
        <button type="submit" disabled={!title.trim()}
          className="flex-1 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 disabled:opacity-40 transition-colors">
          Add task
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 py-1.5 rounded-xl bg-purple-50 text-purple-500 text-xs font-semibold hover:bg-purple-100 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 toast-enter">
      <div className="bg-pink-50 border border-pink-200 text-pink-700 text-sm font-medium px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 whitespace-nowrap">
        <span>🌱</span><span>{message}</span>
      </div>
    </div>
  )
}

// ── TaskBoard ─────────────────────────────────────────────────────────────────
export default function TaskBoard({ username, tasks }) {
  const [addingTo,   setAddingTo]  = useState(null)
  const [draggingId, setDragging]  = useState(null)
  const [dragOverId, setDragOver]  = useState(null)
  const [toast,      setToast]     = useState(null)

  // Request current task list on mount
  // Response ('task:all') is handled by App.jsx and passed as `tasks` prop
  useEffect(() => {
    socket.emit('task:getAll')

    // task:rejected is user-specific — fine to handle here
    const onRejected = ({ reason }) => setToast(reason)
    socket.on('task:rejected', onRejected)
    return () => socket.off('task:rejected', onRejected)
  }, [])

  const activeCount = tasks.filter(
    (t) => t.assignee === username && t.column !== 'done'
  ).length

  function handleAdd(data) {
    socket.emit('task:create', data)
    setAddingTo(null)
  }

  function handleDelete(id) {
    socket.emit('task:delete', { id })
  }

  // Drag handlers
  function onDragStart(e, id) {
    setDragging(id)
    e.dataTransfer.effectAllowed = 'move'
  }
  function onDragEnd()          { setDragging(null); setDragOver(null) }
  function onDragOver(e, colId) { e.preventDefault(); setDragOver(colId) }
  function onDragLeave()        { setDragOver(null) }

  function onDrop(e, colId) {
    e.preventDefault()
    setDragOver(null)
    if (!draggingId) return
    const task = tasks.find((t) => t.id === draggingId)
    if (!task || task.column === colId) { setDragging(null); return }
    // Emit move — server broadcasts task:update → App.jsx updates tasks prop
    socket.emit('task:move', { id: draggingId, column: colId })
    setDragging(null)
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex-shrink-0 px-5 py-3.5 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🗂</span>
          <div>
            <h2 className="text-sm font-bold text-purple-800">Task board</h2>
            <p className="text-xs text-purple-400">Shared with the whole team</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
          activeCount >= 5
            ? 'bg-pink-50 border-pink-200 text-pink-600'
            : 'bg-purple-50 border-purple-100 text-purple-500'
        }`}>
          {activeCount} / 5 active
        </span>
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-hidden p-4 flex gap-3">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.column === col.id)
          const isOver   = dragOverId === col.id

          return (
            <div
              key={col.id}
              onDragOver={(e) => onDragOver(e, col.id)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, col.id)}
              className={`
                flex-1 flex flex-col rounded-2xl border overflow-hidden
                transition-all duration-150
                ${col.colBg} ${col.colBorder}
                ${isOver ? `ring-2 ${col.dropRing} ring-offset-1 scale-[1.01]` : ''}
              `}
            >
              {/* Column header */}
              <div className={`flex-shrink-0 px-3 py-2.5 border-b flex items-center justify-between ${col.colBg} ${col.colBorder}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{col.emoji}</span>
                  <span className="text-xs font-bold text-purple-700">{col.label}</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${col.countCls}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    dragging={draggingId === task.id}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDelete={handleDelete}
                  />
                ))}

                {addingTo === col.id ? (
                  <AddTaskForm
                    column={col.id}
                    username={username}
                    onAdd={handleAdd}
                    onCancel={() => setAddingTo(null)}
                  />
                ) : (
                  <button
                    onClick={() => setAddingTo(col.id)}
                    className="
                      w-full py-2 rounded-xl text-xs text-purple-400
                      border-2 border-dashed border-purple-200
                      hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50
                      transition-all duration-150
                    "
                  >
                    + Add task
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}

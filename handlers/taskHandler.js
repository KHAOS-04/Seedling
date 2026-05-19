import { nanoid } from 'nanoid'
import db, { writeDB } from '../lib/db.js'

const MAX_ACTIVE = 5

export function registerTaskHandlers(io, socket, username) {

  // ── Get all tasks ────────────────────────────────────────────────────────
  socket.on('task:getAll', () => {
    socket.emit('task:all', db.data.tasks)
  })

  // ── Create task ──────────────────────────────────────────────────────────
  socket.on('task:create', ({ title, assignee, color, dueDate, column }) => {
    if (!title?.trim()) return

    const active = db.data.tasks.filter(
      (t) => t.assignee === assignee && t.column !== 'done'
    ).length

    if (active >= MAX_ACTIVE) {
      socket.emit('task:rejected', {
        reason: `${assignee} already has ${MAX_ACTIVE} active tasks. Finish one first! 🌱`,
      })
      return
    }

    const task = {
      id:        nanoid(),
      title:     title.trim(),
      assignee:  assignee || username,
      color:     color    || 'purple',
      dueDate:   dueDate  || null,
      column:    column   || 'todo',
      createdAt: new Date().toISOString(),
      createdBy: username,
    }

    db.data.tasks.push(task)
    writeDB()
    io.emit('task:update', task)
    console.log(`[task+] "${task.title}" → ${task.assignee}`)
  })

  // ── Move task ────────────────────────────────────────────────────────────
  socket.on('task:move', ({ id, column }) => {
    if (!id || !column) return
    const task = db.data.tasks.find((t) => t.id === id)
    if (!task) return

    task.column      = column
    task.lastMovedBy = username
    task.lastMovedAt = new Date().toISOString()
    writeDB()
    io.emit('task:update', task)
    console.log(`[task~] "${task.title}" → ${column}`)
  })

  // ── Delete task ──────────────────────────────────────────────────────────
  socket.on('task:delete', ({ id }) => {
    if (!id) return
    const idx = db.data.tasks.findIndex((t) => t.id === id)
    if (idx === -1) return
    const [removed] = db.data.tasks.splice(idx, 1)
    writeDB()
    io.emit('task:removed', { id })
    console.log(`[task-] "${removed.title}"`)
  })
}

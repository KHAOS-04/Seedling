import { useEffect, useRef, useState } from 'react'
import socket from '../lib/socket'
import MessageBubble   from './MessageBubble'
import TypingIndicator from './TypingIndicator'

const ROOM_META = {
  general: { emoji: '💬', label: 'general', desc: 'Chat with everyone'  },
  design:  { emoji: '🎨', label: 'design',  desc: 'Design discussions'  },
  backend: { emoji: '⚙️',  label: 'backend', desc: 'Backend & tech talk' },
}

const TYPING_STOP_DELAY = 2000
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export default function ChatRoom({ roomId, username }) {
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [typers,    setTypers]    = useState([])
  const [uploading, setUploading] = useState(false)

  const bottomRef   = useRef(null)
  const typingTimer = useRef(null)
  const isTyping    = useRef(false)
  const fileRef     = useRef(null)

  // ── Room-scoped socket listeners ──────────────────────────────────────────
  // Re-registers whenever roomId changes (room switch).
  // Named functions → socket.off removes only these exact handlers.
  useEffect(() => {
    setMessages([])   // clear immediately to prevent flash of previous room
    setTypers([])
    isTyping.current = false

    socket.emit('room:join', { roomId })

    const onHistory = (hist) => setMessages(hist)

    const onReceive = (msg) => {
      if (msg.roomId !== roomId) return   // guard: only accept current room's messages
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev  // dedupe
        return [...prev, msg]
      })
    }

    const onTyping = ({ typers: t }) =>
      setTypers((t ?? []).filter((u) => u !== username))

    socket.on('chat:history',  onHistory)
    socket.on('chat:receive',  onReceive)
    socket.on('typing:update', onTyping)

    return () => {
      socket.off('chat:history',  onHistory)
      socket.off('chat:receive',  onReceive)
      socket.off('typing:update', onTyping)
      clearTimeout(typingTimer.current)
      if (isTyping.current) {
        socket.emit('typing:stop', { roomId })
        isTyping.current = false
      }
      socket.emit('room:leave', { roomId })
    }
  }, [roomId]) // username is intentionally not in deps — it never changes after login

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send text message ─────────────────────────────────────────────────────
  function sendMessage(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return
    socket.emit('chat:send', { roomId, text })
    setInput('')
    stopTyping()
  }

  // ── Typing indicator ──────────────────────────────────────────────────────
  function handleInputChange(e) {
    setInput(e.target.value)
    if (!isTyping.current) {
      isTyping.current = true
      socket.emit('typing:start', { roomId })
    }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(stopTyping, TYPING_STOP_DELAY)
  }

  function stopTyping() {
    clearTimeout(typingTimer.current)
    if (isTyping.current) {
      isTyping.current = false
      socket.emit('typing:stop', { roomId })
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── File upload ───────────────────────────────────────────────────────────
  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''     // reset so same file can be uploaded again

    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res  = await fetch(`${SERVER_URL}/upload`, { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) {
        socket.emit('chat:send', { roomId, text: data.url })
      }
    } catch {
      alert('File upload failed. Make sure the server is running.')
    } finally {
      setUploading(false)
    }
  }

  const roomMeta = ROOM_META[roomId] ?? { emoji: '💬', label: roomId, desc: '' }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex-shrink-0 px-5 py-3.5 border-b border-purple-100 flex items-center gap-3">
        <span className="text-xl">{roomMeta.emoji}</span>
        <div>
          <h2 className="text-sm font-bold text-purple-800"># {roomMeta.label}</h2>
          <p className="text-xs text-purple-400">{roomMeta.desc}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">{roomMeta.emoji}</div>
            <p className="text-sm font-semibold text-purple-600">Welcome to #{roomMeta.label}</p>
            <p className="text-xs text-purple-400 mt-1">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.username === username} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator row */}
      <div className="flex-shrink-0 px-5 h-6 flex items-center">
        <TypingIndicator typers={typers} />
      </div>

      {/* Input row */}
      <form onSubmit={sendMessage} className="flex-shrink-0 px-4 pb-4 flex items-end gap-2">

        {/* File upload button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Attach file"
          className="
            w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
            bg-yellow-50 border border-yellow-200 text-yellow-600
            hover:bg-yellow-100 active:scale-95
            disabled:opacity-40
            transition-all duration-150
          "
        >
          {uploading ? (
            <div className="w-3.5 h-3.5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          )}
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />

        {/* Text input */}
        <div className="
          flex-1 bg-purple-50 border border-purple-200 rounded-2xl
          flex items-end gap-2 px-4 py-2.5
          focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100
          transition-all duration-200
        ">
          <textarea
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${roomMeta.label}...`}
            className="flex-1 bg-transparent resize-none text-sm text-purple-900 placeholder-purple-300 focus:outline-none leading-relaxed max-h-24"
            style={{ scrollbarWidth: 'none' }}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!input.trim()}
          className="
            w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
            bg-purple-600 text-white
            hover:bg-purple-700 active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  )
}

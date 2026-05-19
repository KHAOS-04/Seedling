// state.js — in-memory state that only lives while the server is running.
// Presence and typing don't need to persist to disk.

// socketId → { username }
const onlineMap = new Map()

export function addUser(socketId, username) {
  onlineMap.set(socketId, { username })
}

export function removeUser(socketId) {
  onlineMap.delete(socketId)
}

// Returns unique users (handles same name in multiple tabs)
export function getOnlineUsers() {
  const seen  = new Set()
  const users = []
  for (const { username } of onlineMap.values()) {
    if (!seen.has(username)) {
      seen.add(username)
      users.push({ username })
    }
  }
  return users
}

// roomId → Set of usernames currently typing
const typingMap = new Map()

export function setTyping(roomId, username, isTyping) {
  if (!typingMap.has(roomId)) typingMap.set(roomId, new Set())
  const set = typingMap.get(roomId)
  if (isTyping) set.add(username)
  else          set.delete(username)
}

export function getTypers(roomId) {
  return [...(typingMap.get(roomId) ?? [])]
}

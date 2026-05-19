# Seedling — Phase 1: Installation Guide

## What's new in Phase 1
- Full app layout (sidebar + main content area)
- Real-time chat across 3 rooms
- Task board with drag-and-drop
- 5-task cap (server-enforced)
- Typing indicators
- Online user presence with sprout pips
- Message history (persisted to db.json)

---

## Step 1 — Install the new server dependencies

Open Terminal 1 (your server terminal). Stop the server first (Ctrl+C), then:

```
cd server
npm install nanoid lowdb
```

What these do:
- `nanoid` — generates unique IDs for messages and tasks (e.g. "V1StGXR8_Z5jdHi6B-myT")
- `lowdb` — reads/writes a `db.json` file, our simple database

After installing, restart the server:
```
npm run dev
```

You should still see: `🌱 Seedling server running on http://localhost:3001`

---

## Step 2 — Copy all new files into place

Here is exactly what to copy and where.

### Frontend files (inside client/src/)

**Replace** `client/src/App.jsx` — the main app shell
**Replace** `client/src/index.css` — global styles + animations

**Create** `client/src/lib/socket.js` — the Socket.IO client instance
**Create** `client/src/hooks/useSocket.js` — connection lifecycle hook

**Create** these component files inside `client/src/components/`:
- `UsernameModal.jsx` — first-time name entry
- `Sidebar.jsx` — left nav with rooms, users, sprouts
- `MessageBubble.jsx` — renders one chat message
- `TypingIndicator.jsx` — animated "Ana is typing..."
- `ChatRoom.jsx` — full chat panel
- `TaskBoard.jsx` — kanban board

### Backend files (inside server/)

**Replace** `server/index.js` — the updated server entry point

**Create** `server/lib/db.js` — lowdb database setup
**Create** `server/lib/state.js` — in-memory presence tracking

**Create** these handler files inside `server/handlers/`:
- `chatHandler.js` — chat + typing + room events
- `taskHandler.js` — task CRUD + 5-cap enforcement
- `presenceHandler.js` — online users

### Folder structure after Phase 1

```
seedling/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ChatRoom.jsx
│       │   ├── MessageBubble.jsx
│       │   ├── Sidebar.jsx
│       │   ├── TaskBoard.jsx
│       │   ├── TypingIndicator.jsx
│       │   └── UsernameModal.jsx
│       ├── hooks/
│       │   └── useSocket.js
│       ├── lib/
│       │   └── socket.js
│       ├── App.jsx
│       └── index.css
│
└── server/
    ├── handlers/
    │   ├── chatHandler.js
    │   ├── presenceHandler.js
    │   └── taskHandler.js
    ├── lib/
    │   ├── db.js
    │   └── state.js
    ├── db.json            ← auto-created on first run
    └── index.js
```

---

## Step 3 — Add `db.json` to .gitignore

In your `seedling/` root, create (or open) `.gitignore` and add:

```
node_modules/
server/db.json
server/uploads/
```

`db.json` will be auto-created the first time the server runs.

---

## Step 4 — Run both servers

**Terminal 1 (server):**
```
cd server
npm run dev
```

**Terminal 2 (frontend):**
```
cd client
npm run dev
```

Open http://localhost:5173

---

## Step 5 — Test everything

### Test 1: Username + connection
1. Open http://localhost:5173
2. Enter a username (e.g. "Ana")
3. You should see the full layout — sidebar on the left, chat on the right
4. The sidebar should show "Ana (you)" in the online list
5. Server terminal should log: `✅ Ana is online. Total: 1`

### Test 2: Real-time chat
1. Open a **second browser tab** at http://localhost:5173
2. Enter a different username (e.g. "Ben")
3. Both users should now appear in the sidebar's online list
4. From Ana's tab, type a message in #general and send it
5. It should appear in **Ben's tab instantly** — no refresh
6. Server terminal logs: `💬 [general] Ana: [your message]`

### Test 3: Typing indicator
1. In Ana's tab, start typing (don't send)
2. In Ben's tab, you should see "Ana is typing..." with bouncing dots
3. Stop typing for 2 seconds → indicator disappears

### Test 4: Room switching
1. In Ana's tab, click "# design" in the sidebar
2. Send a message — it stays in #design
3. Switch back to #general — that message should NOT be there
4. Both rooms maintain separate histories

### Test 5: Task board
1. Click "🗂 Task board" in the sidebar
2. Click "+ Add task" in the "To do" column
3. Fill in title, assignee (use "Ana"), pick a color, click "Add task"
4. The task should appear on the board
5. In Ben's tab, switch to the task board — the task should already be there
6. Drag the task from "To do" to "In progress" in one tab — it moves in the other tab instantly

### Test 6: 5-task cap
1. Add 5 tasks all assigned to "Ana" (any column except Done)
2. Try to add a 6th — you should see a pink toast: "Ana already has 5 active tasks. Finish one first! 🌱"
3. Move one task to "Done" — now you can add another

### Test 7: Persistence
1. Add a few messages and tasks
2. Stop the server (Ctrl+C in Terminal 1)
3. Open `server/db.json` — you should see your messages and tasks
4. Restart the server (`npm run dev`)
5. Refresh the browser — chat history reloads when you rejoin a room

### Test 8: Sprout pips
1. Create tasks assigned to "Ana" and move some to "Done"
2. Look at Ana's entry in the sidebar's online list
3. Each completed task fills one pip (up to 5)

---

## Troubleshooting

**"Cannot find package 'nanoid'" or "'lowdb'"**
→ Run `npm install nanoid lowdb` in the `server/` folder (not client/).

**"ERR_REQUIRE_ESM" error**
→ Make sure `server/package.json` has `"type": "module"`. This is required for lowdb v6+.

**Tasks not showing in the second tab**
→ The second tab needs to navigate to the task board AFTER connecting. The `task:getAll` event fires when `TaskBoard.jsx` mounts. Check the server console for `task:getAll` being received.

**Messages appearing twice**
→ You have a duplicate socket listener. Check that every `useEffect` that registers a socket listener has a corresponding cleanup: `return () => { socket.off('event') }`.

**"db.json not found" error**
→ lowdb creates it automatically. If you see this, check that `server/lib/db.js` is in the right place and that the path `join(__dirname, '..', 'db.json')` resolves to `server/db.json`.

**Drag and drop not working**
→ Make sure the `draggable` attribute is on the TaskCard div and that `onDragOver` has `e.preventDefault()`. Without preventDefault, the browser blocks the drop.

**Typing indicator showing your own typing**
→ `TypingIndicator.jsx` filters out `username` from the typers list. Check that the `username` prop is being passed correctly from `ChatRoom`.

---

## What you just built (distributed systems perspective)

```
Client A (Ana's browser)                Server (Node.js)              Client B (Ben's browser)
────────────────────────────            ────────────────              ────────────────────────────

User types message
→ socket.emit('chat:send')  ────────►  receives 'chat:send'
                                        validates input
                                        saves to db.json
                                        io.to(room).emit('chat:receive')
                                                          ◄────────── receives 'chat:receive'
receives 'chat:receive' ◄───────────                                  React re-renders message list
React re-renders message list
```

This is event-driven communication. The server is the coordinator.
No client talks directly to another — all communication is mediated.
This is also what makes it a distributed system: independent processes
coordinating via a shared protocol (Socket.IO events) over a network.
```

---

## Phase 1 complete ✅

Next phase: **Phase 2 — File attachments in chat**
(Upload a file via the paperclip button → appears as a download card in all browsers)

Before continuing, confirm:
- [ ] Chat works in all 3 rooms
- [ ] Task board syncs between browser tabs
- [ ] Typing indicator appears and disappears correctly
- [ ] 5-task cap shows the toast
- [ ] Presence list updates when tabs open/close

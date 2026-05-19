# 🌱 Seedling — Real-Time Collaborative Workspace

> A cute, cozy productivity app for student teams. Real-time chat, shared task board, and file sharing — all in one pastel workspace.

Built as an academic prototype for a **Parallel and Distributed Computing** course, demonstrating:
- Client-Server architecture
- Event-Driven communication via Socket.IO
- Real-time synchronization across concurrent users

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 Real-time chat | Three persistent rooms: #general, #design, #backend |
| 🗂 Shared task board | Kanban board (To Do / In Progress / Done) synced across all users |
| 🔒 5-task cap | Each person can have max 5 active tasks — enforced on the server |
| ⌨️ Typing indicators | "Kia is typing..." appears in real time for other users |
| 🟢 Online presence | See who's online with green dots, updated instantly |
| 🌱 Sprout pips | Tiny progress indicators that fill as you complete tasks |
| 📎 File sharing | Attach files in chat — appears as a download card for everyone |
| 💾 Message history | Chat messages persist across refreshes via JSON file database |

---

## 🏗️ Architecture

### Overview

```
Browser (Kia)        Browser (Kaye)        Browser (AJ)
     │                     │                     │
     └─────────────────────┼─────────────────────┘
                           │  WebSocket (Socket.IO)
                     ┌─────▼──────┐
                     │  Node.js   │
                     │  Express   │
                     │ Socket.IO  │
                     └─────┬──────┘
                           │
                     ┌─────▼──────┐
                     │  db.json   │
                     │  (lowdb)   │
                     └────────────┘
```

### Distributed Systems Concepts

**Client-Server Architecture**
Three browser clients connect to one centralized Node.js server. The server is the single source of truth — it validates all data and decides what gets broadcast to whom.

**Event-Driven Communication**
No polling. No page refreshes. Every action emits a named Socket.IO event:
- `chat:send` → server saves it → broadcasts `chat:receive` to the room
- `task:move` → server updates db.json → broadcasts `task:update` to all clients
- All clients react to events asynchronously — this is event-driven architecture.

**Real-Time Synchronization**
When Kaye drags a task card, it moves on Kia's and AJ's boards in under 100ms. Socket.IO's room system ensures events only reach the right clients.

**Concurrency**
Node.js handles multiple simultaneous socket connections via its event loop. Concurrent database writes are serialized through a write queue to prevent data corruption.

### File Structure

```
seedling/
├── client/                      ← React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Avatar.jsx        ← Reusable avatar with per-user color
│   │   │   ├── ChatRoom.jsx      ← Real-time chat panel
│   │   │   ├── MessageBubble.jsx ← Single message (text or file)
│   │   │   ├── Sidebar.jsx       ← Rooms, online users, sprout pips
│   │   │   ├── TaskBoard.jsx     ← Kanban board with drag-and-drop
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── UsernameModal.jsx ← Username entry screen
│   │   ├── lib/
│   │   │   ├── socket.js         ← Single Socket.IO client instance
│   │   │   └── avatarColor.js    ← Deterministic color helper
│   │   ├── App.jsx               ← Root component, owns global listeners
│   │   ├── index.css             ← Tailwind + custom animations
│   │   └── main.jsx              ← React entry point
│   ├── index.html
│   ├── tailwind.config.js        ← Pastel color palette
│   ├── vite.config.js
│   └── package.json
│
├── server/                      ← Node.js backend (Express + Socket.IO)
│   ├── handlers/
│   │   ├── chatHandler.js        ← Chat messages, room join/leave, typing
│   │   ├── presenceHandler.js    ← Online users tracking
│   │   ├── taskHandler.js        ← Task CRUD + 5-cap enforcement
│   │   └── uploadHandler.js      ← File upload via multer
│   ├── lib/
│   │   ├── db.js                 ← lowdb JSON database + write queue
│   │   └── state.js              ← In-memory presence + typing state
│   ├── uploads/                  ← Uploaded files stored here
│   ├── index.js                  ← Server entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 💻 Local Setup (VS Code on Windows)

### Prerequisites

Install these once — you only need to do this the first time.

**1. Node.js (v18 or higher)**
Download from https://nodejs.org — choose the **LTS** version.
After installing, verify in a terminal:
```
node --version
npm --version
```
Both should show version numbers.

**2. VS Code**
Download from https://code.visualstudio.com

**3. Git** (for GitHub submission)
Download from https://git-scm.com/download/win

---

### Running the Project

> You need **two terminals open at the same time** in VS Code.
> Open the terminal with **Ctrl + `** (backtick). Click the **+** button to open a second one.

**Step 1 — Open the project folder in VS Code**
```
File → Open Folder → select the seedling/ folder
```

**Step 2 — Install server dependencies**

In Terminal 1:
```
cd server
npm install
```

**Step 3 — Install client dependencies**

In Terminal 2:
```
cd client
npm install
```

**Step 4 — Start the server**

In Terminal 1:
```
cd server
npm run dev
```

You should see:
```
🌱 Seedling server → http://localhost:3001
```

**Step 5 — Start the frontend**

In Terminal 2:
```
cd client
npm run dev
```

You should see:
```
➜  Local: http://localhost:5173/
```

**Step 6 — Open the app**

Go to http://localhost:5173 in your browser.

---

### Testing with Multiple Users (Kia, Kaye, AJ)

Open **three separate browser tabs** (or use different browsers/incognito windows):
1. Tab 1 → http://localhost:5173 → Enter name "Kia"
2. Tab 2 → http://localhost:5173 → Enter name "Kaye"
3. Tab 3 → http://localhost:5173 → Enter name "AJ"

All three should appear in each other's sidebar. Messages and task changes should appear on all tabs instantly.

---

## 🐙 GitHub Setup

**Step 1 — Initialize Git**

In the VS Code terminal (from the `seedling/` root folder):
```
git init
git add .
git commit -m "Initial commit: Seedling distributed collaboration app"
```

**Step 2 — Create a GitHub repository**

1. Go to https://github.com → New repository
2. Name it `seedling` (or anything you like)
3. Set it to **Public** or **Private**
4. Do NOT check "Add README" — you already have one
5. Click Create repository

**Step 3 — Push to GitHub**

Copy the commands GitHub shows you, e.g.:
```
git remote add origin https://github.com/YOUR_USERNAME/seedling.git
git branch -M main
git push -u origin main
```

**Recommended .gitignore** is already included in the project. It excludes:
- `node_modules/` (too large — reinstalled via npm install)
- `server/db.json` (auto-generated)
- `server/uploads/*` (user files)
- `.env` files (contain secrets)

---

## 🚀 Free Hosting Guide

> Deploy so Kia, Kaye, and AJ can test from different computers.

### Backend → Render (free)

1. Go to https://render.com → Sign up with GitHub
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Root directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add environment variable:
   - Key: `CLIENT_URL`
   - Value: your Vercel frontend URL (you'll get this in the next step — come back and set it)
6. Click **Deploy**
7. Copy your Render URL (e.g. `https://seedling-xxxx.onrender.com`)

> ⚠️ Free Render instances sleep after 15 minutes of inactivity. The first load after sleeping takes ~30 seconds. This is fine for demos.

### Frontend → Vercel (free)

1. Go to https://vercel.com → Sign up with GitHub
2. Click **New Project** → Import your repo
3. Configure:
   - **Root directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   - Key: `VITE_SERVER_URL`
   - Value: your Render backend URL (e.g. `https://seedling-xxxx.onrender.com`)
5. Click **Deploy**
6. Go back to Render and update `CLIENT_URL` to your Vercel URL

### After Deployment

Share the Vercel URL with Kia, Kaye, and AJ. They open it in any browser and test simultaneously — no local setup needed.

> ⚠️ Socket.IO on Render's free tier works but may time out on long-idle sessions. Refresh if the connection drops.

---

## 👥 Team Testing Guide

**Local (same computer, three tabs):**
- All three users open http://localhost:5173 and enter their names
- Test: send a message → appears in all tabs
- Test: drag a task → moves on all boards simultaneously
- Test: start typing → other tabs show the typing indicator

**Remote (deployed on Vercel + Render):**
- Each person opens the Vercel URL on their own computer/phone
- Same tests apply — all changes appear in real time across the world

**What to verify for the course demo:**
1. ✅ Three users online simultaneously — sidebar shows all three
2. ✅ Message in #general appears for all three users instantly
3. ✅ Typing "Kia is typing..." appears on Kaye and AJ's screens
4. ✅ Kaye creates a task — it appears on Kia and AJ's board immediately
5. ✅ AJ drags a task to Done — moves for everyone simultaneously
6. ✅ 5-task cap: adding a 6th task shows the pink toast
7. ✅ Kia closes her tab — she disappears from the online list

---

## 🔧 Troubleshooting

### "npm install" fails
- Make sure you're in the right folder (`cd server` then `npm install`, then `cd ../client` then `npm install`)
- Try deleting `node_modules/` and running `npm install` again

### CORS error in browser console
- The server must be running on port 3001
- Make sure `client/.env.local` has `VITE_SERVER_URL=http://localhost:3001`
- Restart both servers after any `.env` change

### Messages not appearing / tasks not syncing
- Open browser DevTools (F12) → Console tab → look for socket errors
- Make sure BOTH terminals are running (server + client)
- Try a hard refresh: Ctrl+Shift+R

### "Port already in use" error
- Another app is using port 3001 or 5173
- On Windows, find and kill it: `netstat -ano | findstr :3001`
- Or change the port in `server/index.js` and `client/src/lib/socket.js`

### db.json errors on server start
- Delete `server/db.json` — it will be recreated automatically
- This happens if the server crashed mid-write. Safe to delete during development.

### Render deployment: WebSocket not connecting
- Make sure you added the CORS environment variable `CLIENT_URL` on Render
- Socket.IO on Render requires no extra configuration — it uses the default HTTP upgrade

### Vercel deployment: blank page
- Check that `VITE_SERVER_URL` environment variable is set to your Render URL
- Make sure the Render service is awake (visit its URL directly first)

---

## 🎓 Academic Notes

### Why this is a distributed system

A distributed system is any system where multiple independent processes communicate over a network to accomplish a shared goal. Seedling qualifies because:

- **Independent processes:** Each browser tab is an independent process with its own memory and execution context
- **Network communication:** All coordination happens via WebSocket messages over TCP/IP
- **Shared state:** The task board and chat history are shared state that all clients read and modify
- **Concurrency:** Multiple users can emit events simultaneously — the server processes them concurrently

### Key distributed computing concepts demonstrated

| Concept | Where in Seedling |
|---|---|
| Client-Server model | React browsers ↔ Node.js server |
| Event-Driven architecture | Socket.IO emit/on pattern |
| Pub/Sub pattern | `io.to(roomId).emit()` — server publishes to a room |
| Real-time synchronization | Task board updates propagate to all clients in <100ms |
| Concurrency | Multiple simultaneous socket connections handled by Node.js event loop |
| Fault tolerance | Auto-reconnect: Socket.IO reconnects if the connection drops |
| Eventual consistency | Write queue ensures all writes complete in order |

---

## 👨‍💻 Team

Built for Parallel and Distributed Computing course.

Team members: Kia Soguilon, Kaye Emperado, Anothny Joseph

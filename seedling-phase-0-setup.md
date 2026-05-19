# Seedling — Phase 0: Setup & Scaffold

## What you'll have by the end
- Two terminals running side by side in VS Code
- A pastel React page at http://localhost:5173
- A Node.js server at http://localhost:3001
- A "Connected to server!" message proving Socket.IO works

---

## Step 1 — Install prerequisites

Before anything else, verify you have Node.js installed.

Open VS Code. Press **Ctrl + `** (backtick) to open the terminal.

Type this and press Enter:
```
node --version
```

You should see something like `v18.x.x` or higher.
If you see "command not found" — download Node.js from https://nodejs.org (choose the LTS version), install it, then restart VS Code.

Also check npm:
```
npm --version
```
You should see `9.x.x` or higher. npm comes bundled with Node.js.

---

## Step 2 — Create the project folder

In the terminal, navigate to wherever you keep your projects (e.g. Desktop):
```
cd Desktop
```

Create the main project folder:
```
mkdir seedling
cd seedling
```

You're now inside the `seedling/` folder. Everything we build lives here.

---

## Step 3 — Create the frontend (React + Vite)

Still in the terminal, run:
```
npm create vite@latest client -- --template react
```

When it finishes, move into the client folder and install dependencies:
```
cd client
npm install
```

Now install Tailwind CSS and its dependencies:
```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Install the Socket.IO client library:
```
npm install socket.io-client
```

Now open the `seedling/` folder in VS Code:
```
cd ..
code .
```

VS Code will open with the full project. You should see a `client/` folder in the Explorer panel on the left.

---

## Step 4 — Configure Tailwind CSS

In VS Code, open `client/tailwind.config.js` and **replace everything** with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50:  '#EDE9FF',
          100: '#D4CCFF',
          200: '#C4B5FD',
          400: '#A78BFA',
          600: '#7C3AED',
          700: '#5B21B6',
          900: '#2E1065',
        },
        pink: {
          50:  '#FCE7F3',
          100: '#FBCFE8',
          200: '#F9A8D4',
          400: '#F472B6',
          700: '#BE185D',
          900: '#831843',
        },
        yellow: {
          50:  '#FEF9C3',
          100: '#FEF08A',
          200: '#FDE68A',
          400: '#FACC15',
          700: '#A16207',
          900: '#78350F',
        },
        blue: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          400: '#60A5FA',
          700: '#1D4ED8',
          900: '#1E3A8A',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

Now open `client/src/index.css` and **replace everything** with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #F8F7FF;
  font-family: 'Inter', system-ui, sans-serif;
}

/* Smooth scrollbar for chat */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #C4B5FD;
  border-radius: 4px;
}

/* Slide-in animation for new messages */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-enter {
  animation: slideUp 0.2s ease-out;
}
```

---

## Step 5 — Create the socket connection file

Inside `client/src/`, create a new folder called `lib/`.

Inside `client/src/lib/`, create a file called `socket.js` and paste:

```js
import { io } from 'socket.io-client'

// This creates ONE socket connection for the entire app.
// We create it once here and import it wherever we need it.
// The URL points to our Node.js server running on port 3001.
const socket = io('http://localhost:3001', {
  autoConnect: false, // We'll manually connect after the user picks a username
})

export default socket
```

**Why `autoConnect: false`?**
We don't want to connect before we know the user's name. We'll connect manually once they enter their username.

---

## Step 6 — Replace App.jsx with the scaffold

Open `client/src/App.jsx` and **replace everything** with:

```jsx
import { useEffect, useState } from 'react'
import socket from './lib/socket'

function App() {
  const [connected, setConnected] = useState(false)
  const [username, setUsername] = useState('')
  const [inputName, setInputName] = useState('')

  // This runs once when the component mounts.
  // We set up Socket.IO event listeners here.
  useEffect(() => {
    // When the socket successfully connects to the server
    socket.on('connect', () => {
      console.log('Connected! Socket ID:', socket.id)
      setConnected(true)
    })

    // When the socket disconnects (server stops, network issue, etc.)
    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    // IMPORTANT: Clean up listeners when the component unmounts.
    // Without this, you'd get duplicate listeners on re-render.
    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, []) // Empty array = run once on mount only

  function handleJoin(e) {
    e.preventDefault()
    if (!inputName.trim()) return
    setUsername(inputName.trim())
    // Now we connect to the server, passing the username
    socket.auth = { username: inputName.trim() }
    socket.connect()
  }

  // If not joined yet, show the username prompt
  if (!username) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm border border-purple-200 shadow-sm">
          <div className="text-center mb-6">
            <span className="text-4xl">🌱</span>
            <h1 className="text-2xl font-bold text-purple-700 mt-2">Seedling</h1>
            <p className="text-sm text-purple-400 mt-1">
              A cozy workspace for your team
            </p>
          </div>
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Pick a display name..."
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-3 rounded-2xl border border-purple-200 bg-purple-50
                         text-purple-900 placeholder-purple-300 text-sm
                         focus:outline-none focus:ring-2 focus:ring-purple-300
                         transition-all duration-200"
            />
            <button
              type="submit"
              disabled={!inputName.trim()}
              className="w-full py-3 rounded-2xl bg-purple-600 text-white font-medium text-sm
                         hover:bg-purple-700 active:scale-[0.98]
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              Enter Seedling
            </button>
          </form>
        </div>
      </div>
    )
  }

  // If joined, show the main layout placeholder
  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 text-center border border-purple-200">
        <span className="text-4xl">🌱</span>
        <h2 className="text-xl font-bold text-purple-700 mt-3">
          Welcome, {username}!
        </h2>
        <p className={`text-sm mt-2 font-medium ${connected ? 'text-green-600' : 'text-pink-500'}`}>
          {connected ? '● Connected to server' : '○ Connecting...'}
        </p>
        <p className="text-xs text-purple-300 mt-4">
          Main layout coming in Phase 1
        </p>
      </div>
    </div>
  )
}

export default App
```

---

## Step 7 — Create the backend server

Open a **new terminal** in VS Code by clicking the **+** button in the terminal panel.

Create the server folder:
```
mkdir server
cd server
npm init -y
```

Install backend dependencies:
```
npm install express socket.io cors
npm install -D nodemon
```

What each package does:
- `express` — web server framework
- `socket.io` — real-time WebSocket library
- `cors` — allows the browser on port 5173 to talk to the server on port 3001
- `nodemon` — auto-restarts the server when you save a file (dev only)

Now open `server/package.json` and find the `"scripts"` section. Replace it with:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
},
```

Also add `"type": "module"` so we can use modern `import` syntax. The full `package.json` should look like:

```json
{
  "name": "seedling-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "socket.io": "^4.7.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## Step 8 — Create the server entry point

Inside the `server/` folder, create `index.js`:

```js
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

// --- Express setup ---
const app = express()
app.use(cors())
app.use(express.json())

// A simple health-check route so you can visit http://localhost:3001
// in your browser and confirm the server is running.
app.get('/', (req, res) => {
  res.send('🌱 Seedling server is running!')
})

// --- HTTP + Socket.IO setup ---
// Socket.IO needs to wrap the raw HTTP server (not just Express).
// This is the standard Socket.IO setup pattern.
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Only allow our Vite frontend
    methods: ['GET', 'POST'],
  },
})

// --- Socket.IO events ---
// This block runs once for every new browser that connects.
io.on('connection', (socket) => {
  // socket.handshake.auth contains data the client sent on connect.
  // We sent { username } from App.jsx.
  const username = socket.handshake.auth.username || 'Anonymous'

  console.log(`✅ ${username} connected (socket: ${socket.id})`)

  // Send a welcome message back to just this client (not everyone).
  // socket.emit() = send to this client only
  // io.emit()     = send to ALL clients
  socket.emit('welcome', {
    message: `Welcome to Seedling, ${username}!`,
    socketId: socket.id,
  })

  // This fires when the browser tab closes, user navigates away, etc.
  socket.on('disconnect', () => {
    console.log(`❌ ${username} disconnected`)
  })
})

// --- Start listening ---
const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`\n🌱 Seedling server running on http://localhost:${PORT}`)
  console.log(`   Waiting for connections...\n`)
})
```

---

## Step 9 — Run both servers

You need **two terminals open at the same time** in VS Code.

**Terminal 1 — Backend:**
```
cd server
npm run dev
```

You should see:
```
🌱 Seedling server running on http://localhost:3001
   Waiting for connections...
```

**Terminal 2 — Frontend:**
```
cd client
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173 in your browser.

---

## Step 10 — Test it

1. You should see the Seedling username prompt (purple pastel card).
2. Type any name and click "Enter Seedling".
3. You should see "Welcome, [name]! ● Connected to server"
4. Check **Terminal 1** (the server). You should see: `✅ [name] connected`
5. Open a **second browser tab** at http://localhost:5173, enter a different name.
6. Check the server terminal — you should see two connected lines.
7. Close one tab — you should see a disconnected line.

**That is your first working distributed system: two browser clients connected to one Node.js server via WebSocket.**

---

## Troubleshooting

**"Cannot find module" error in server terminal**
→ Make sure `"type": "module"` is in `server/package.json`. Then restart with `npm run dev`.

**CORS error in browser console**
→ Check that the `origin` in `server/index.js` exactly matches `http://localhost:5173` (no trailing slash).

**Tailwind classes not working (everything is unstyled)**
→ Confirm `tailwind.config.js` has the right `content` paths. Stop Vite (`Ctrl+C`) and run `npm run dev` again.

**"Connected to server" never appears**
→ Make sure the server is running in Terminal 1 before you open the browser. Check Terminal 1 for any error messages.

**Port already in use**
→ Another app is using port 3001 or 5173. Stop it, or change the port number in both `server/index.js` and `client/src/lib/socket.js` to match.

---

## What you just built

```
Your laptop (one machine, two processes):

Browser tabs           Node.js Server
(http://5173)    ←→   (http://3001)
   React               Express
   Vite                Socket.IO
   Socket.IO client    In-memory state
```

This is a Client-Server distributed architecture. The clients (browsers) are independent processes. The server is an independent process. They communicate over a network protocol (WebSocket) defined by Socket.IO. When you open a third tab, a third independent process joins — no changes needed on the server. That scalability is what makes this a distributed pattern.

---

## Phase 0 complete ✅

Next up: **Phase 1 — Main layout + chat in one room.**

Confirm Phase 0 is working (connected message, server logs) before we continue.

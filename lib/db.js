// db.js — JSON file database using lowdb
//
// All writes go through writeDB() which queues them so
// two simultaneous socket events never corrupt the file.

import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath    = join(__dirname, '..', 'db.json')

const defaultData = { messages: [], tasks: [] }

const adapter = new JSONFile(dbPath)
export const db = new Low(adapter, defaultData)

// Load from disk once on startup
await db.read()
db.data = db.data ?? defaultData
await db.write()

// Serial write queue — prevents race conditions when events fire simultaneously
let writeQueue = Promise.resolve()
export function writeDB() {
  writeQueue = writeQueue
    .then(() => db.write())
    .catch((err) => console.error('[db] write error:', err))
  return writeQueue
}

export default db

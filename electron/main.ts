import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Database from 'better-sqlite3'

// ✅ Proper ESM __filename / __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const require = createRequire(import.meta.url)

// ✅ Now path is available
const dbPath = path.join(process.cwd(), 'connectman.db')
const db = new Database(dbPath)

// Collections table - for grouping servers
db.prepare(`
  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run()

// Servers table - each server belongs to a collection
db.prepare(`
  CREATE TABLE IF NOT EXISTS servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collectionId INTEGER NOT NULL,
    name TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER DEFAULT 22,
    username TEXT NOT NULL,
    password TEXT,
    privateKey TEXT,
    connectionType TEXT DEFAULT 'ssh',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(collectionId) REFERENCES collections(id) ON DELETE CASCADE
  )
`).run()

// SSH Sessions table - for tracking active connections
db.prepare(`
  CREATE TABLE IF NOT EXISTS sshSessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serverId INTEGER NOT NULL,
    sessionId TEXT UNIQUE,
    status TEXT DEFAULT 'disconnected',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(serverId) REFERENCES servers(id) ON DELETE CASCADE
  )
`).run()

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send(
      'main-process-message',
      new Date().toLocaleString()
    )
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// ===== COLLECTION HANDLERS =====

// Create a new collection
ipcMain.handle('collection:create', (_, { name, description }) => {
  try {
    const result = db.prepare(`
      INSERT INTO collections (name, description)
      VALUES (?, ?)
    `).run(name, description || '')
    return { success: true, id: result.lastInsertRowid }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

// Get all collections
ipcMain.handle('collection:getAll', () => {
  try {
    return db.prepare(`SELECT * FROM collections ORDER BY createdAt DESC`).all()
  } catch (err: any) {
    return { error: err.message }
  }
})

// Delete collection (cascades to delete all servers in it)
ipcMain.handle('collection:delete', (_, collectionId: number) => {
  try {
    db.prepare(`DELETE FROM collections WHERE id = ?`).run(collectionId)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

// Update collection
ipcMain.handle('collection:update', (_, { id, name, description }) => {
  try {
    db.prepare(`
      UPDATE collections 
      SET name = ?, description = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, description || '', id)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

// ===== SERVER HANDLERS =====

// Create a new server in a collection
ipcMain.handle('server:create', (_, { collectionId, name, host, port, username, password, privateKey, connectionType }) => {
  try {
    const result = db.prepare(`
      INSERT INTO servers (collectionId, name, host, port, username, password, privateKey, connectionType)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(collectionId, name, host, port || 22, username, password || null, privateKey || null, connectionType || 'ssh')
    return { success: true, id: result.lastInsertRowid }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

// Get all servers in a collection
ipcMain.handle('server:getByCollection', (_, collectionId: number) => {
  try {
    return db.prepare(`SELECT * FROM servers WHERE collectionId = ? ORDER BY createdAt DESC`).all(collectionId)
  } catch (err: any) {
    return { error: err.message }
  }
})

// Get a single server
ipcMain.handle('server:getById', (_, serverId: number) => {
  try {
    return db.prepare(`SELECT * FROM servers WHERE id = ?`).get(serverId)
  } catch (err: any) {
    return { error: err.message }
  }
})

// Delete a server
ipcMain.handle('server:delete', (_, serverId: number) => {
  try {
    db.prepare(`DELETE FROM servers WHERE id = ?`).run(serverId)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

// Update a server
ipcMain.handle('server:update', (_, { id, name, host, port, username, password, privateKey, connectionType }) => {
  try {
    db.prepare(`
      UPDATE servers
      SET name = ?, host = ?, port = ?, username = ?, password = ?, privateKey = ?, connectionType = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, host, port || 22, username, password || null, privateKey || null, connectionType || 'ssh', id)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

// ✅ Proper error handling
app.whenReady()
  .then(createWindow)
  .catch(err => {
    console.error('Startup error:', err)
  })

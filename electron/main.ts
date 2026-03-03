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

db.prepare(`
  CREATE TABLE IF NOT EXISTS servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    host TEXT,
    username TEXT,
    port INTEGER
  )
`).run()

db.prepare(`
  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`).run()

db.prepare(`
  CREATE TABLE IF NOT EXISTS servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER,
    name TEXT,
    host TEXT,
    username TEXT,
    port INTEGER,
    FOREIGN KEY(collection_id) REFERENCES collections(id)
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

ipcMain.handle('add-server', (_, server) => {
  db.prepare(`
    INSERT INTO servers (name, host, username, port)
    VALUES (?, ?, ?, ?)
  `).run(server.name, server.host, server.username, server.port)

  return true
})

ipcMain.handle('get-servers', () => {
  return db.prepare(`SELECT * FROM servers`).all()
})


// Add collection
ipcMain.handle('collections:add', (_, name: string) => {
  db.prepare(`
    INSERT INTO collections (name)
    VALUES (?)
  `).run(name)

  return true
})

// Get collections
ipcMain.handle('collections:get', () => {
  return db.prepare(`SELECT * FROM collections`).all()
})

// Delete collection
ipcMain.handle('collections:delete', (_, id: number) => {
  db.prepare(`DELETE FROM collections WHERE id = ?`).run(id)
  db.prepare(`DELETE FROM servers WHERE collection_id = ?`).run(id)
  return true
})

// ✅ Proper error handling
app.whenReady()
  .then(createWindow)
  .catch(err => {
    console.error('Startup error:', err)
  })
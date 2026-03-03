import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { initializeDatabase, runQuery, runQuerySingle, runQueryExecute } from './database'
import { createSSHConnection, executeCommand, closeSSHConnection, isSessionConnected, getAllActiveSessions } from './ssh'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  initializeDatabase().then(() => {
    console.log('Database initialized')
  }).catch(err => {
    console.error('Failed to initialize database:', err)
  })
  createWindow()
})

// Database IPC Handlers
ipcMain.handle('db:addServer', async (event, server) => {
  try {
    const sql = `
      INSERT INTO servers (name, host, port, username, password, privateKey, connectionType)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    await runQueryExecute(sql, [
      server.name,
      server.host,
      server.port || 22,
      server.username,
      server.password || null,
      server.privateKey || null,
      server.connectionType || 'ssh'
    ])
    return { success: true }
  } catch (err) {
    throw err
  }
})

ipcMain.handle('db:getServers', async () => {
  try {
    const sql = 'SELECT * FROM servers ORDER BY createdAt DESC'
    return await runQuery(sql)
  } catch (err) {
    throw err
  }
})

ipcMain.handle('db:deleteServer', async (event, serverId) => {
  try {
    const sql = 'DELETE FROM servers WHERE id = ?'
    await runQueryExecute(sql, [serverId])
    return { success: true }
  } catch (err) {
    throw err
  }
})

ipcMain.handle('db:updateServer', async (event, serverId, server) => {
  try {
    const sql = `
      UPDATE servers 
      SET name = ?, host = ?, port = ?, username = ?, password = ?, privateKey = ?, connectionType = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    await runQueryExecute(sql, [
      server.name,
      server.host,
      server.port || 22,
      server.username,
      server.password || null,
      server.privateKey || null,
      server.connectionType || 'ssh',
      serverId
    ])
    return { success: true }
  } catch (err) {
    throw err
  }
})

// Collections IPC Handlers
ipcMain.handle('db:addCollection', async (event, collection) => {
  try {
    const sql = 'INSERT INTO collections (name, description) VALUES (?, ?)'
    await runQueryExecute(sql, [collection.name, collection.description || ''])
    return { success: true }
  } catch (err) {
    throw err
  }
})

ipcMain.handle('db:getCollections', async () => {
  try {
    const sql = 'SELECT * FROM collections ORDER BY createdAt DESC'
    return await runQuery(sql)
  } catch (err) {
    throw err
  }
})

ipcMain.handle('db:deleteCollection', async (event, collectionId) => {
  try {
    const sql = 'DELETE FROM collections WHERE id = ?'
    await runQueryExecute(sql, [collectionId])
    return { success: true }
  } catch (err) {
    throw err
  }
})

// Requests IPC Handlers
ipcMain.handle('db:addRequest', async (event, request) => {
  try {
    const sql = `
      INSERT INTO requests (collectionId, name, method, url, headers, body, params, auth)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    await runQueryExecute(sql, [
      request.collectionId,
      request.name,
      request.method || 'GET',
      request.url,
      JSON.stringify(request.headers || {}),
      request.body || '',
      JSON.stringify(request.params || {}),
      JSON.stringify(request.auth || {})
    ])
    return { success: true }
  } catch (err) {
    throw err
  }
})

ipcMain.handle('db:getRequests', async (event, collectionId) => {
  try {
    const sql = 'SELECT * FROM requests WHERE collectionId = ? ORDER BY createdAt DESC'
    return await runQuery(sql, [collectionId])
  } catch (err) {
    throw err
  }
})

// SSH IPC Handlers
ipcMain.handle('ssh:connect', async (event, sessionId, config) => {
  try {
    await createSSHConnection(config, sessionId)
    return { success: true, sessionId }
  } catch (err) {
    throw err
  }
})

ipcMain.handle('ssh:executeCommand', async (event, sessionId, command) => {
  try {
    const output = await executeCommand(sessionId, command)
    return { success: true, output }
  } catch (err) {
    throw err
  }
})

ipcMain.handle('ssh:disconnect', async (event, sessionId) => {
  try {
    await closeSSHConnection(sessionId)
    return { success: true }
  } catch (err) {
    throw err
  }
})

ipcMain.handle('ssh:isConnected', async (event, sessionId) => {
  return { connected: isSessionConnected(sessionId) }
})

ipcMain.handle('ssh:getActiveSessions', async () => {
  return { sessions: getAllActiveSessions() }
})

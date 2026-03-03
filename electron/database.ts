import sqlite3 from 'sqlite3'
import path from 'path'
import { app } from 'electron'

const dbPath = path.join(app.getPath('userData'), 'connectman.db')

let db: sqlite3.Database

export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err)
      } else {
        createTables()
          .then(() => resolve())
          .catch(reject)
      }
    })
  })
}

function createTables(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS servers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          host TEXT NOT NULL,
          port INTEGER DEFAULT 22,
          username TEXT,
          password TEXT,
          privateKey TEXT,
          connectionType TEXT DEFAULT 'ssh',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      db.run(`
        CREATE TABLE IF NOT EXISTS collections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      db.run(`
        CREATE TABLE IF NOT EXISTS requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          collectionId INTEGER NOT NULL,
          name TEXT NOT NULL,
          method TEXT DEFAULT 'GET',
          url TEXT,
          headers TEXT,
          body TEXT,
          params TEXT,
          auth TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(collectionId) REFERENCES collections(id)
        )
      `)

      db.run(`
        CREATE TABLE IF NOT EXISTS requestHistory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          requestId INTEGER,
          method TEXT,
          url TEXT,
          statusCode INTEGER,
          responseTime INTEGER,
          responseBody TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(requestId) REFERENCES requests(id)
        )
      `, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
}

export function getDatabase(): sqlite3.Database {
  return db
}

export function runQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows as T[])
      }
    })
  })
}

export function runQuerySingle<T>(sql: string, params: any[] = []): Promise<T | null> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve((row as T) || null)
      }
    })
  })
}

export function runQueryExecute(sql: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

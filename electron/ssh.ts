import { Client } from 'ssh2'
import fs from 'fs'

interface SSHConfig {
  host: string
  port: number
  username: string
  password?: string
  privateKey?: string
}

interface SSHSession {
  client: Client
  connected: boolean
}

const activeSessions = new Map<string, SSHSession>()

export function createSSHConnection(config: SSHConfig, sessionId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = new Client()

    const connectionConfig: any = {
      host: config.host,
      port: config.port,
      username: config.username,
    }

    if (config.privateKey) {
      try {
        connectionConfig.privateKey = fs.readFileSync(config.privateKey)
      } catch (err) {
        return reject(new Error(`Failed to read private key: ${err}`))
      }
    } else if (config.password) {
      connectionConfig.password = config.password
    }

    client.on('error', (err) => {
      activeSessions.delete(sessionId)
      reject(err)
    })

    client.on('end', () => {
      activeSessions.delete(sessionId)
    })

    client.on('close', () => {
      activeSessions.delete(sessionId)
    })

    client.connect(connectionConfig)
      .on('ready', () => {
        activeSessions.set(sessionId, { client, connected: true })
        resolve()
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

export function executeCommand(sessionId: string, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const session = activeSessions.get(sessionId)
    if (!session || !session.connected) {
      return reject(new Error('SSH session not connected'))
    }

    let output = ''
    let errorOutput = ''

    session.client.exec(command, (err, stream) => {
      if (err) return reject(err)

      stream.on('close', (code) => {
        if (code === 0) {
          resolve(output)
        } else {
          reject(new Error(errorOutput || `Command failed with exit code ${code}`))
        }
      })

      stream.on('data', (data) => {
        output += data.toString()
      })

      stream.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })
    })
  })
}

export function closeSSHConnection(sessionId: string): Promise<void> {
  return new Promise((resolve) => {
    const session = activeSessions.get(sessionId)
    if (session) {
      session.client.end()
      activeSessions.delete(sessionId)
    }
    resolve()
  })
}

export function isSessionConnected(sessionId: string): boolean {
  const session = activeSessions.get(sessionId)
  return session ? session.connected : false
}

export function getAllActiveSessions(): string[] {
  return Array.from(activeSessions.keys())
}

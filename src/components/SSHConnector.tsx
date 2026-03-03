import React, { useState, useEffect } from 'react'
import SSHTerminal from './SSHTerminal'

interface Server {
  id: number
  name: string
  host: string
  port: number
  username: string
  password?: string
  privateKey?: string
  connectionType: string
}

interface SSHConnectorProps {
  servers: Server[]
  onConnect: (server: Server) => void
}

interface ActiveSession {
  sessionId: string
  server: Server
}

export default function SSHConnector({ servers, onConnect }: SSHConnectorProps) {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [connectingServerId, setConnectingServerId] = useState<number | null>(null)

  const handleConnect = async (server: Server) => {
    if (server.connectionType === 'http' || !['ssh', 'both'].includes(server.connectionType)) {
      alert('This server is not configured for SSH')
      return
    }

    setConnectingServerId(server.id)
    const sessionId = `${server.id}-${Date.now()}`

    try {
      const result = await window.ipcRenderer.invoke('ssh:connect', sessionId, {
        host: server.host,
        port: server.port || 22,
        username: server.username,
        password: server.password,
        privateKey: server.privateKey,
      })

      if (result.success) {
        setActiveSessions((prev) => [...prev, { sessionId, server }])
        onConnect(server)
      }
    } catch (err) {
      alert(`Failed to connect: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setConnectingServerId(null)
    }
  }

  const handleCloseSession = async (sessionId: string) => {
    try {
      await window.ipcRenderer.invoke('ssh:disconnect', sessionId)
      setActiveSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
    } catch (err) {
      console.error('Failed to close session:', err)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card border-b border-border p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Available Servers</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {servers.length > 0 ? (
            servers.map((server) => (
              <div
                key={server.id}
                className="flex items-center justify-between p-3 bg-background border border-border rounded hover:border-primary-500 transition"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-text-primary">{server.name}</h4>
                  <p className="text-xs text-text-secondary">
                    {server.host}:{server.port || 22} • {server.username}
                  </p>
                </div>
                <button
                  onClick={() => handleConnect(server)}
                  disabled={connectingServerId === server.id}
                  className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-semibold"
                >
                  {connectingServerId === server.id ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            ))
          ) : (
            <p className="text-text-secondary text-sm">No servers available</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeSessions.length > 0 ? (
          <div className="h-full flex flex-col">
            <div className="flex gap-2 p-2 bg-card border-b border-border overflow-x-auto">
              {activeSessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded text-xs text-text-primary whitespace-nowrap"
                >
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>{session.server.name}</span>
                  <button
                    onClick={() => handleCloseSession(session.sessionId)}
                    className="ml-1 hover:text-danger-500 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-hidden p-2 bg-background">
              {activeSessions[0] && (
                <SSHTerminal
                  key={activeSessions[0].sessionId}
                  sessionId={activeSessions[0].sessionId}
                  serverName={activeSessions[0].server.name}
                  onClose={() => handleCloseSession(activeSessions[0].sessionId)}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted">
            <p>Select a server and click "Connect" to start an SSH session</p>
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useState } from 'react'

interface Server {
  id: number
  collectionId: number
  name: string
  host: string
  port: number
  username: string
  password?: string
  privateKey?: string
  connectionType: string
}

interface ServerDetailProps {
  server: Server | null
  onConnect: (server: Server) => void
  onDelete: (serverId: number) => void
  onRefresh: () => void
}

export default function ServerDetail({ server, onConnect, onDelete, onRefresh }: ServerDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!server) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="text-center">
          <div className="text-4xl mb-4 text-text-muted">○</div>
          <h3 className="text-xl text-text-primary mb-2">No Server Selected</h3>
          <p className="text-text-secondary">
            Select a server from the list to view details and connect
          </p>
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${server.name}"?`)) {
      try {
        setIsDeleting(true)
        await window.ipcRenderer.invoke('server:delete', server.id)
        onDelete(server.id)
        onRefresh()
      } catch (err) {
        alert(`Failed to delete server: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-background p-6 overflow-auto">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">{server.name}</h2>
            <p className="text-text-secondary">
              {server.host}:{server.port}
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-2 bg-danger-500 text-white rounded hover:bg-danger-700 transition disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card p-4 rounded border border-border">
          <label className="block text-text-secondary text-xs uppercase mb-2">Host</label>
          <p className="text-text-primary font-mono">{server.host}</p>
        </div>

        <div className="bg-card p-4 rounded border border-border">
          <label className="block text-text-secondary text-xs uppercase mb-2">Port</label>
          <p className="text-text-primary font-mono">{server.port}</p>
        </div>

        <div className="bg-card p-4 rounded border border-border">
          <label className="block text-text-secondary text-xs uppercase mb-2">Username</label>
          <p className="text-text-primary font-mono">{server.username}</p>
        </div>

        <div className="bg-card p-4 rounded border border-border">
          <label className="block text-text-secondary text-xs uppercase mb-2">Auth Type</label>
          <p className="text-text-primary font-mono">
            {server.password ? 'Password' : 'Key'}
          </p>
        </div>

        <div className="bg-card p-4 rounded border border-border col-span-2">
          <label className="block text-text-secondary text-xs uppercase mb-2">Connection Type</label>
          <p className="text-text-primary font-mono">{server.connectionType.toUpperCase()}</p>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <button
          onClick={() => onConnect(server)}
          className="w-full px-6 py-3 bg-primary-500 text-white rounded font-semibold hover:bg-primary-600 transition text-lg"
        >
          Connect via SSH
        </button>
      </div>
    </div>
  )
}

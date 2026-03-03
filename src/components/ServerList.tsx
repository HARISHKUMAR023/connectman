import { useEffect, useState } from "react"
import AddServerModal from "./AddServerModal"
import SSHConnector from "./SSHConnector"

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

export default function ServerList() {
  const [servers, setServers] = useState<Server[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [view, setView] = useState<"list" | "ssh">("list")

  useEffect(() => {
    loadServers()
  }, [])

  const loadServers = async () => {
    try {
      const data = await window.ipcRenderer.invoke("db:getServers")
      setServers(data || [])
    } catch (err) {
      console.error("Failed to load servers:", err)
    }
  }

  const handleDeleteServer = async (serverId: number) => {
    if (window.confirm("Are you sure you want to delete this server?")) {
      try {
        await window.ipcRenderer.invoke("db:deleteServer", serverId)
        loadServers()
      } catch (err) {
        console.error("Failed to delete server:", err)
      }
    }
  }

  const handleAddServer = () => {
    loadServers()
    setIsModalOpen(false)
  }

  if (view === "ssh") {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-border p-4 bg-card">
          <button
            onClick={() => setView("list")}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition text-sm"
          >
            ← Back to Servers
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <SSHConnector servers={servers} onConnect={() => {}} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Servers</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setView("ssh")}
            className="px-4 py-2 bg-secondary-700 text-text-primary rounded hover:bg-secondary-600 transition text-sm font-semibold"
          >
            SSH Terminal
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition text-sm font-semibold"
          >
            + Add Server
          </button>
        </div>
      </div>

      {servers.length > 0 ? (
        <div className="grid gap-4">
          {servers.map((server) => (
            <div
              key={server.id}
              className="bg-card p-4 rounded border border-border hover:border-primary-500 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary text-lg">{server.name}</h3>
                  <p className="text-text-secondary text-sm">
                    {server.host}:{server.port}
                  </p>
                  <p className="text-text-muted text-xs mt-1">
                    {server.username} • {server.connectionType}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteServer(server.id)}
                    className="px-3 py-1 bg-danger-500 text-white rounded hover:bg-danger-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">No servers added yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition"
          >
            Add Your First Server
          </button>
        </div>
      )}

      <AddServerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddServer} />
    </div>
  )
}

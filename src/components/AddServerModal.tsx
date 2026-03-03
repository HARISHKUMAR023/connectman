import { useState } from "react"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave?: (server: any) => void
}

export default function AddServerModal({ isOpen, onClose, onSave }: Props) {
  const [name, setName] = useState("")
  const [host, setHost] = useState("")
  const [port, setPort] = useState("22")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [connectionType, setConnectionType] = useState("ssh")
  const [authType, setAuthType] = useState("password")

  if (!isOpen) return null

  const saveServer = async () => {
    if (!name.trim() || !host.trim() || !username.trim()) {
      alert("Please fill in all required fields")
      return
    }

    const server = {
      name: name.trim(),
      host: host.trim(),
      port: parseInt(port) || 22,
      username: username.trim(),
      password: authType === "password" ? password : null,
      privateKey: authType === "key" ? password : null,
      connectionType,
    }

    try {
      await window.ipcRenderer.invoke("db:addServer", server)
      setName("")
      setHost("")
      setPort("22")
      setUsername("")
      setPassword("")
      setConnectionType("ssh")
      setAuthType("password")
      onClose()
      onSave?.(server)
    } catch (err) {
      alert(`Failed to save server: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-card p-6 rounded w-96 border border-border max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold text-text-primary mb-4">Add Server</h2>

        <div className="space-y-3">
          <input
            placeholder="Server Name"
            className="w-full p-2 bg-background border border-border rounded text-text-primary focus:outline-none focus:border-primary-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Host/IP Address"
            className="w-full p-2 bg-background border border-border rounded text-text-primary focus:outline-none focus:border-primary-500"
            value={host}
            onChange={(e) => setHost(e.target.value)}
          />

          <input
            placeholder="Port"
            type="number"
            className="w-full p-2 bg-background border border-border rounded text-text-primary focus:outline-none focus:border-primary-500"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />

          <input
            placeholder="Username"
            className="w-full p-2 bg-background border border-border rounded text-text-primary focus:outline-none focus:border-primary-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <select
            className="w-full p-2 bg-background border border-border rounded text-text-primary focus:outline-none focus:border-primary-500"
            value={connectionType}
            onChange={(e) => setConnectionType(e.target.value)}
          >
            <option value="ssh">SSH Only</option>
            <option value="http">HTTP Only</option>
            <option value="both">Both SSH & HTTP</option>
          </select>

          <div className="bg-background p-3 rounded border border-border">
            <label className="text-sm text-text-secondary mb-2 block">Authentication Type</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="password"
                  checked={authType === "password"}
                  onChange={(e) => setAuthType(e.target.value)}
                  className="cursor-pointer"
                />
                <span className="text-sm text-text-secondary">Password</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="key"
                  checked={authType === "key"}
                  onChange={(e) => setAuthType(e.target.value)}
                  className="cursor-pointer"
                />
                <span className="text-sm text-text-secondary">Private Key</span>
              </label>
            </div>
            <input
              placeholder={authType === "password" ? "Password" : "Private Key Path"}
              type={authType === "password" ? "password" : "text"}
              className="w-full p-2 bg-card border border-border rounded text-text-primary focus:outline-none focus:border-primary-500 mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary-700 text-text-primary rounded hover:bg-secondary-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={saveServer}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition font-semibold"
          >
            Save Server
          </button>
        </div>
      </div>
    </div>
  )
}

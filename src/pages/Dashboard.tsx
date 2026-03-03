import { useState } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import ServerDetail from "../components/ServerDetail"
import AddServerModal from "../components/AddServerModal"
import SSHConnector from "../components/SSHConnector"

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

export default function Dashboard() {
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null)
  const [isAddServerModalOpen, setIsAddServerModalOpen] = useState(false)
  const [view, setView] = useState<"detail" | "ssh">("detail")
  const [collectionsRefresh, setCollectionsRefresh] = useState(0)

  const handleSelectServer = (server: Server) => {
    setSelectedServer(server)
    setSelectedCollectionId(server.collectionId)
    setView("detail")
  }

  const handleConnect = (server: Server) => {
    setSelectedServer(server)
    setView("ssh")
  }

  const handleAddServer = (collectionId: number) => {
    setSelectedCollectionId(collectionId)
    setIsAddServerModalOpen(true)
  }

  const handleServerDeleted = () => {
    setSelectedServer(null)
    setCollectionsRefresh((prev) => prev + 1)
  }

  const handleRefresh = () => {
    setCollectionsRefresh((prev) => prev + 1)
  }

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <Sidebar 
        onSelectServer={handleSelectServer}
        onCollectionsChanged={handleRefresh}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {view === "detail" && (
          <>
            {selectedServer ? (
              <ServerDetail
                server={selectedServer}
                onConnect={handleConnect}
                onDelete={handleServerDeleted}
                onRefresh={handleRefresh}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-background p-6">
                <div className="text-center">
                  <div className="text-6xl mb-4 text-primary-500">○</div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">
                    Select a Server
                  </h3>
                  <p className="text-text-secondary mb-6">
                    Choose a server from the collection tree to view details and connect
                  </p>
                  {selectedCollectionId && (
                    <button
                      onClick={() => handleAddServer(selectedCollectionId)}
                      className="px-6 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition font-semibold"
                    >
                      + Add Server to Collection
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {view === "ssh" && selectedServer && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-border p-4 bg-card flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                SSH Terminal - {selectedServer.name}
              </h3>
              <button
                onClick={() => setView("detail")}
                className="px-4 py-2 bg-secondary-700 text-text-primary rounded hover:bg-secondary-600 transition text-sm"
              >
                Back to Details
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SSHConnector
                servers={[selectedServer]}
                onConnect={handleConnect}
              />
            </div>
          </div>
        )}

        <AddServerModal
          isOpen={isAddServerModalOpen}
          onClose={() => setIsAddServerModalOpen(false)}
          collectionId={selectedCollectionId || undefined}
          onSave={() => {
            setIsAddServerModalOpen(false)
            handleRefresh()
          }}
        />
      </div>
    </div>
  )
}

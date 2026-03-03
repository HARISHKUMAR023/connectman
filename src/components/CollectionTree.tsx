import React, { useEffect, useState } from 'react'

interface Server {
  id: number
  collectionId: number
  name: string
  host: string
  port: number
  username: string
}

interface Collection {
  id: number
  name: string
  description: string
}

interface CollectionTreeProps {
  collections: Collection[]
  selectedCollectionId: number | null
  onSelectCollection: (collectionId: number) => void
  onSelectServer: (server: Server) => void
  onDeleteCollection: (collectionId: number) => void
}

export default function CollectionTree({
  collections,
  selectedCollectionId,
  onSelectCollection,
  onSelectServer,
  onDeleteCollection,
}: CollectionTreeProps) {
  const [expandedCollections, setExpandedCollections] = useState<Set<number>>(new Set())
  const [servers, setServers] = useState<Map<number, Server[]>>(new Map())

  useEffect(() => {
    const loadServers = async () => {
      const serversMap = new Map<number, Server[]>()
      for (const collection of collections) {
        try {
          const result = await window.ipcRenderer.invoke(
            'server:getByCollection',
            collection.id
          )
          serversMap.set(collection.id, result || [])
        } catch (err) {
          console.error(`Failed to load servers for collection ${collection.id}:`, err)
        }
      }
      setServers(serversMap)
    }

    loadServers()
  }, [collections])

  const toggleExpanded = (collectionId: number) => {
    const newExpanded = new Set(expandedCollections)
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId)
    } else {
      newExpanded.add(collectionId)
    }
    setExpandedCollections(newExpanded)
  }

  return (
    <div className="space-y-2">
      {collections.map((collection) => (
        <div key={collection.id}>
          <div className="flex items-center justify-between p-2 hover:bg-hover rounded cursor-pointer group">
            <div
              className="flex items-center flex-1"
              onClick={() => {
                onSelectCollection(collection.id)
                toggleExpanded(collection.id)
              }}
            >
              <span className="mr-2 text-primary-500">
                {expandedCollections.has(collection.id) ? '▼' : '▶'}
              </span>
              <span
                className={`font-medium ${
                  selectedCollectionId === collection.id
                    ? 'text-primary-500'
                    : 'text-text-primary hover:text-primary-500'
                }`}
              >
                {collection.name}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteCollection(collection.id)
              }}
              className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 bg-danger-500 text-white rounded hover:bg-danger-700 transition"
              title="Delete collection"
            >
              ×
            </button>
          </div>

          {expandedCollections.has(collection.id) && (
            <div className="ml-4 space-y-1">
              {(servers.get(collection.id) || []).map((server) => (
                <div
                  key={server.id}
                  onClick={() => onSelectServer(server)}
                  className="flex items-center gap-2 p-2 hover:bg-hover rounded cursor-pointer text-sm text-text-secondary hover:text-primary-500 transition"
                >
                  <span className="text-xs text-text-muted">●</span>
                  <div className="flex-1 truncate">
                    <div className="font-medium">{server.name}</div>
                    <div className="text-xs text-text-muted">{server.host}:{server.port}</div>
                  </div>
                </div>
              ))}
              {(!servers.get(collection.id) || servers.get(collection.id)!.length === 0) && (
                <div className="text-xs text-text-muted p-2">No servers</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

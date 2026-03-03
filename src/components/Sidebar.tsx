import React, { useEffect, useState } from 'react'
import CollectionModal from './CollectionModal'
import CollectionTree from './CollectionTree'

interface Collection {
  id: number
  name: string
  description: string
}

interface Request {
  id: number
  collectionId: number
  name: string
  method: string
  url: string
}

interface SidebarProps {
  onSelectRequest?: (request: Request) => void
  onCollectionsChanged?: () => void
}

export default function Sidebar({ onSelectRequest, onCollectionsChanged }: SidebarProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null)

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      const result = await window.ipcRenderer.invoke('db:getCollections')
      setCollections(result || [])
    } catch (err) {
      console.error('Failed to load collections:', err)
    }
  }

  const handleAddCollection = async (collection: { name: string; description: string }) => {
    try {
      await window.ipcRenderer.invoke('db:addCollection', collection)
      setIsModalOpen(false)
      loadCollections()
      onCollectionsChanged?.()
    } catch (err) {
      console.error('Failed to add collection:', err)
    }
  }

  const handleDeleteCollection = async (collectionId: number) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await window.ipcRenderer.invoke('db:deleteCollection', collectionId)
        loadCollections()
        onCollectionsChanged?.()
      } catch (err) {
        console.error('Failed to delete collection:', err)
      }
    }
  }

  const handleAddRequest = (collectionId: number) => {
    console.log('Add request to collection:', collectionId)
    // This will be handled in the main Dashboard component
  }

  const handleSelectRequest = (request: Request) => {
    onSelectRequest?.(request)
  }

  return (
    <div className="w-80 bg-sidebar h-full p-5 flex flex-col border-r border-border">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">ConnectMan</h1>
        <p className="text-xs text-text-secondary mt-1">API & SSH Manager</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-1 px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition font-semibold text-sm"
        >
          + Collection
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Collections
          </h3>
          {collections.length > 0 ? (
            <CollectionTree
              collections={collections}
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={setSelectedCollectionId}
              onSelectRequest={handleSelectRequest}
              onDeleteCollection={handleDeleteCollection}
              onAddRequest={handleAddRequest}
            />
          ) : (
            <div className="text-sm text-text-muted p-3 text-center">
              No collections yet. Create one to get started!
            </div>
          )}
        </div>
      </div>

      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCollection}
      />
    </div>
  )
}

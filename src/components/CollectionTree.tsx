import React, { useEffect, useState } from 'react'

interface Request {
  id: number
  name: string
  method: string
  url: string
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
  onSelectRequest: (request: Request) => void
  onDeleteCollection: (collectionId: number) => void
  onAddRequest: (collectionId: number) => void
}

export default function CollectionTree({
  collections,
  selectedCollectionId,
  onSelectCollection,
  onSelectRequest,
  onDeleteCollection,
  onAddRequest,
}: CollectionTreeProps) {
  const [expandedCollections, setExpandedCollections] = useState<Set<number>>(new Set())
  const [requests, setRequests] = useState<Map<number, Request[]>>(new Map())

  useEffect(() => {
    const loadRequests = async () => {
      const requestsMap = new Map<number, Request[]>()
      for (const collection of collections) {
        try {
          const result = await window.ipcRenderer.invoke(
            'db:getRequests',
            collection.id
          )
          requestsMap.set(collection.id, result || [])
        } catch (err) {
          console.error(`Failed to load requests for collection ${collection.id}:`, err)
        }
      }
      setRequests(requestsMap)
    }

    loadRequests()
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

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-blue-400'
      case 'POST':
        return 'text-green-400'
      case 'PUT':
        return 'text-orange-400'
      case 'DELETE':
        return 'text-red-400'
      case 'PATCH':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
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
            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onAddRequest(collection.id)
                }}
                className="text-xs px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600"
                title="Add request"
              >
                +
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteCollection(collection.id)
                }}
                className="text-xs px-2 py-1 bg-danger-500 text-white rounded hover:bg-danger-700"
                title="Delete collection"
              >
                ×
              </button>
            </div>
          </div>

          {expandedCollections.has(collection.id) && (
            <div className="ml-4 space-y-1">
              {(requests.get(collection.id) || []).map((request) => (
                <div
                  key={request.id}
                  onClick={() => onSelectRequest(request)}
                  className="flex items-center gap-2 p-2 hover:bg-hover rounded cursor-pointer group text-sm"
                >
                  <span className={`font-semibold ${getMethodColor(request.method)}`}>
                    {request.method.toUpperCase()}
                  </span>
                  <span className="text-text-secondary truncate flex-1">
                    {request.name}
                  </span>
                </div>
              ))}
              {(!requests.get(collection.id) || requests.get(collection.id)!.length === 0) && (
                <div className="text-xs text-text-muted p-2">No requests</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

import React, { useState } from 'react'

interface CollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (collection: { name: string; description: string }) => void
  initialData?: { name: string; description: string } | null
}

export default function CollectionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CollectionModalProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), description: description.trim() })
      setName('')
      setDescription('')
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          {initialData ? 'Edit Collection' : 'New Collection'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name"
              className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Collection description"
              className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-primary-500 resize-none h-24"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-secondary-700 text-text-primary rounded hover:bg-secondary-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

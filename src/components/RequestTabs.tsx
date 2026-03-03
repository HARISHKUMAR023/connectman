import React, { useState } from 'react'

interface RequestTabsProps {
  params: Record<string, string>
  headers: Record<string, string>
  body: string
  onParamsChange: (params: Record<string, string>) => void
  onHeadersChange: (headers: Record<string, string>) => void
  onBodyChange: (body: string) => void
}

type TabType = 'params' | 'headers' | 'body' | 'auth'

export default function RequestTabs({
  params,
  headers,
  body,
  onParamsChange,
  onHeadersChange,
  onBodyChange,
}: RequestTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('params')

  const addParam = () => {
    onParamsChange({ ...params, [`param${Object.keys(params).length + 1}`]: '' })
  }

  const updateParam = (key: string, value: string) => {
    const newParams = { ...params }
    delete newParams[key]
    newParams[value] = params[key]
    onParamsChange(newParams)
  }

  const removeParam = (key: string) => {
    const newParams = { ...params }
    delete newParams[key]
    onParamsChange(newParams)
  }

  const addHeader = () => {
    onHeadersChange({ ...headers, [`header${Object.keys(headers).length + 1}`]: '' })
  }

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    const newHeaders = { ...headers }
    delete newHeaders[oldKey]
    newHeaders[newKey] = value
    onHeadersChange(newHeaders)
  }

  const removeHeader = (key: string) => {
    const newHeaders = { ...headers }
    delete newHeaders[key]
    onHeadersChange(newHeaders)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border bg-card">
        {(['params', 'headers', 'body', 'auth'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'params' && (
          <>
            <button
              onClick={addParam}
              className="w-full px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition text-sm"
            >
              + Add Parameter
            </button>
            <div className="space-y-2">
              {Object.entries(params).map(([key, value]) => (
                <div key={key} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => updateParam(key, e.target.value)}
                    placeholder="Key"
                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-primary-500"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateParam(key, e.target.value)}
                    placeholder="Value"
                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-primary-500"
                  />
                  <button
                    onClick={() => removeParam(key)}
                    className="px-2 py-1 bg-danger-500 text-white rounded hover:bg-danger-700 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'headers' && (
          <>
            <button
              onClick={addHeader}
              className="w-full px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition text-sm"
            >
              + Add Header
            </button>
            <div className="space-y-2">
              {Object.entries(headers).map(([key, value]) => (
                <div key={key} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => updateHeader(key, e.target.value, value)}
                    placeholder="Header Name"
                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-primary-500"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateHeader(key, key, e.target.value)}
                    placeholder="Header Value"
                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-primary-500"
                  />
                  <button
                    onClick={() => removeHeader(key)}
                    className="px-2 py-1 bg-danger-500 text-white rounded hover:bg-danger-700 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'body' && (
          <textarea
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Request body (JSON, XML, etc.)"
            className="w-full h-full bg-background border border-border rounded px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:border-primary-500 resize-none"
          />
        )}

        {activeTab === 'auth' && (
          <div className="text-text-secondary text-sm">
            <p>Authentication settings will be available here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

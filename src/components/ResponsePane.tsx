import React, { useState } from 'react'

interface Response {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
}

interface ResponsePaneProps {
  response: Response | null
  isLoading: boolean
}

type TabType = 'body' | 'headers'

export default function ResponsePane({ response, isLoading }: ResponsePaneProps) {
  const [activeTab, setActiveTab] = useState<TabType>('body')

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400'
    if (status >= 300 && status < 400) return 'text-blue-400'
    if (status >= 400 && status < 500) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="h-96 flex flex-col bg-card border-t border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-text-primary">Response</h3>
          {response && (
            <>
              <span className={`text-sm font-mono ${getStatusColor(response.status)}`}>
                {response.status} {response.statusText}
              </span>
              <span className="text-xs text-text-secondary">{response.time}ms</span>
            </>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-text-secondary">Loading...</span>
          </div>
        </div>
      )}

      {response && !isLoading && (
        <>
          <div className="flex border-b border-border bg-background">
            {(['body', 'headers'] as TabType[]).map((tab) => (
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

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'body' && (
              <pre className="text-xs text-text-primary font-mono whitespace-pre-wrap break-words">
                {response.body}
              </pre>
            )}

            {activeTab === 'headers' && (
              <div className="space-y-2 text-sm">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="flex gap-4">
                    <span className="text-primary-500 font-mono min-w-max">{key}:</span>
                    <span className="text-text-secondary font-mono break-all">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!response && !isLoading && (
        <div className="flex-1 flex items-center justify-center text-text-muted">
          <p className="text-sm">Make a request to see the response here</p>
        </div>
      )}
    </div>
  )
}

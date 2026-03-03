import React, { useState, useEffect } from 'react'
import RequestTabs from './RequestTabs'
import ResponsePane from './ResponsePane'

interface Request {
  id?: number
  collectionId?: number
  name: string
  method: string
  url: string
  headers: Record<string, string>
  body: string
  params: Record<string, string>
  auth: Record<string, any>
}

interface Response {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
}

interface RequestBuilderProps {
  request?: Request | null
  onRequestChange?: (request: Request) => void
}

export default function RequestBuilder({ request, onRequestChange }: RequestBuilderProps) {
  const [method, setMethod] = useState(request?.method || 'GET')
  const [url, setUrl] = useState(request?.url || '')
  const [params, setParams] = useState<Record<string, string>>(request?.params || {})
  const [headers, setHeaders] = useState<Record<string, string>>(request?.headers || {})
  const [body, setBody] = useState(request?.body || '')
  const [response, setResponse] = useState<Response | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (request) {
      setMethod(request.method)
      setUrl(request.url)
      setParams(request.params || {})
      setHeaders(request.headers || {})
      setBody(request.body || '')
    }
  }, [request])

  useEffect(() => {
    onRequestChange?.({
      name: request?.name || 'Untitled Request',
      method,
      url,
      headers,
      body,
      params,
      auth: {},
    })
  }, [method, url, params, headers, body, onRequestChange, request])

  const handleSend = async () => {
    if (!url.trim()) {
      alert('Please enter a URL')
      return
    }

    setIsLoading(true)
    try {
      // Build the full URL with query parameters
      const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`)
      Object.entries(params).forEach(([key, value]) => {
        urlObj.searchParams.append(key, value)
      })

      const startTime = Date.now()
      const fetchResponse = await fetch(urlObj.toString(), {
        method,
        headers,
        body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
      })

      const responseBody = await fetchResponse.text()
      const endTime = Date.now()

      const responseHeaders: Record<string, string> = {}
      fetchResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      setResponse({
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: endTime - startTime,
      })
    } catch (err) {
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        body: `Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`,
        time: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-card border-b border-border p-4 space-y-4">
        {/* URL Input Row */}
        <div className="flex gap-3">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded text-text-primary focus:outline-none focus:border-primary-500 font-semibold w-24"
          >
            {methods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter request URL (e.g., https://api.example.com/endpoint)"
            className="flex-1 px-3 py-2 bg-background border border-border rounded text-text-primary focus:outline-none focus:border-primary-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="px-6 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      {/* Tabs and Response */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <RequestTabs
            params={params}
            headers={headers}
            body={body}
            onParamsChange={setParams}
            onHeadersChange={setHeaders}
            onBodyChange={setBody}
          />
        </div>
      </div>

      {/* Response Pane */}
      <ResponsePane response={response} isLoading={isLoading} />
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'

interface SSHTerminalProps {
  sessionId: string
  serverName: string
  onClose: () => void
}

interface TerminalLine {
  text: string
  type: 'output' | 'error' | 'input' | 'info'
}

export default function SSHTerminal({ sessionId, serverName, onClose }: SSHTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      text: `Connected to ${serverName}`,
      type: 'info',
    },
  ])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(true)
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  useEffect(() => {
    // Check connection status
    const checkConnection = async () => {
      try {
        const result = await window.ipcRenderer.invoke('ssh:isConnected', sessionId)
        setIsConnected(result.connected)
      } catch (err) {
        console.error('Failed to check connection:', err)
      }
    }

    const interval = setInterval(checkConnection, 2000)
    return () => clearInterval(interval)
  }, [sessionId])

  const handleExecuteCommand = async () => {
    if (!input.trim()) return

    // Add input line to terminal
    setLines((prev) => [...prev, { text: `$ ${input}`, type: 'input' }])
    const command = input
    setInput('')

    try {
      const result = await window.ipcRenderer.invoke('ssh:executeCommand', sessionId, command)
      if (result.success) {
        const outputLines = result.output.split('\n').filter((line: string) => line.length > 0)
        setLines((prev) => [
          ...prev,
          ...outputLines.map((line: string) => ({ text: line, type: 'output' as const })),
        ])
      }
    } catch (err) {
      setLines((prev) => [
        ...prev,
        {
          text: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          type: 'error',
        },
      ])
    }
  }

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400'
      case 'info':
        return 'text-cyan-400'
      case 'input':
        return 'text-green-400'
      default:
        return 'text-terminal-text'
    }
  }

  return (
    <div className="flex flex-col h-full bg-terminal rounded">
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-semibold text-text-primary">{serverName}</span>
          <span className="text-xs text-text-secondary">{sessionId}</span>
        </div>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-danger-500 transition"
          title="Close terminal"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {lines.map((line, idx) => (
          <div key={idx} className={`font-mono text-xs ${getLineColor(line.type)}`}>
            {line.text}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {isConnected && (
        <div className="border-t border-border bg-card p-3">
          <div className="flex gap-2">
            <span className="text-xs text-text-secondary pt-1.5 font-mono">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleExecuteCommand()}
              placeholder="Enter command..."
              autoFocus
              className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs text-terminal-text font-mono focus:outline-none focus:border-primary-500"
            />
            <button
              onClick={handleExecuteCommand}
              disabled={!input.trim()}
              className="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 transition text-xs"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="border-t border-border bg-danger-900 p-3 text-center">
          <p className="text-xs text-danger-300">SSH connection lost</p>
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { config } from '../utils/config'

const ConnectionTester = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [apiUrl, setApiUrl] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const testConnection = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || config.base_api_url
      setApiUrl(API_BASE_URL)

      try {
        // Test basic connection to Laravel server
        const response = await fetch('http://localhost:8000/api/test-public', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setConnectionStatus('connected')
          setError(null)
        } else {
          setConnectionStatus('error')
          setError(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (err) {
        setConnectionStatus('error')
        setError(err.message)
      }
    }

    testConnection()
  }, [])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-50 border-green-200 text-green-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✅'
      case 'error': return '❌'
      default: return '🔄'
    }
  }

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getStatusColor()}`}>
      <h3 className="text-sm font-medium mb-2">
        {getStatusIcon()} API Connection Status
      </h3>
      <div className="text-xs space-y-1">
        <div><strong>Status:</strong> {connectionStatus}</div>
        <div><strong>API URL:</strong> {apiUrl}</div>
        <div><strong>Target:</strong> http://localhost:8000/api/</div>
        {error && <div><strong>Error:</strong> {error}</div>}
      </div>

      {connectionStatus === 'error' && (
        <div className="mt-3 text-xs">
          <strong>Troubleshooting:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Check if Laravel server is running on port 8000</li>
            <li>Verify CORS settings in Laravel</li>
            <li>Check if Windows Firewall is blocking the connection</li>
            <li>Try accessing http://127.0.0.1:8000/api/test-public directly in browser</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ConnectionTester
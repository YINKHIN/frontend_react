import React, { useState } from 'react'
import api from '../utils/api'

const ApiTester = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})

  const testEndpoint = async (endpoint, name) => {
    setLoading(prev => ({ ...prev, [name]: true }))
    try {
      const response = await api.get(endpoint)
      setResults(prev => ({ ...prev, [name]: { success: true, data: response.data } }))
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: false, 
          error: error.response?.data || error.message,
          status: error.response?.status
        } 
      }))
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }))
    }
  }

  const token = localStorage.getItem('token')
  
  // Only show in demo mode
  if (!token || !token.startsWith('demo-token-')) {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-blue-800 mb-3">
        🧪 API Authentication Tests
      </h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={() => testEndpoint('/test-public', 'public')}
          disabled={loading.public}
          className="btn-secondary text-xs mr-2"
        >
          {loading.public ? 'Testing...' : 'Test Public'}
        </button>
        
        <button
          onClick={() => testEndpoint('/test-auth', 'auth')}
          disabled={loading.auth}
          className="btn-secondary text-xs mr-2"
        >
          {loading.auth ? 'Testing...' : 'Test Auth'}
        </button>
        
        <button
          onClick={() => testEndpoint('/test-admin', 'admin')}
          disabled={loading.admin}
          className="btn-secondary text-xs mr-2"
        >
          {loading.admin ? 'Testing...' : 'Test Admin'}
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {Object.entries(results).map(([name, result]) => (
          <div key={name} className="bg-white p-2 rounded border">
            <div className="font-medium">
              {name.toUpperCase()}: {result.success ? '✅ Success' : '❌ Failed'}
              {result.status && ` (${result.status})`}
            </div>
            <pre className="text-xs mt-1 overflow-x-auto">
              {JSON.stringify(result.success ? result.data : result.error, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApiTester
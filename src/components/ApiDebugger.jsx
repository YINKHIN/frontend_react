import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supplierService } from '../services/supplierService'
import { config } from '../utils/config'

const ApiDebugger = () => {
  const { user, token } = useAuth()
  const [debugInfo, setDebugInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const testSuppliers = async () => {
    setLoading(true)
    setDebugInfo(null)
    
    try {
      console.log('Testing suppliers API...')
      console.log('Config:', config)
      console.log('User:', user)
      console.log('Token:', token ? 'Present' : 'Missing')
      
      const result = await supplierService.getAll()
      console.log('Suppliers result:', result)
      
      setDebugInfo({
        success: true,
        data: result,
        message: 'Suppliers loaded successfully'
      })
    } catch (error) {
      console.error('Suppliers error:', error)
      setDebugInfo({
        success: false,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        message: 'Failed to load suppliers'
      })
    } finally {
      setLoading(false)
    }
  }

  const testDirectAPI = async () => {
    setLoading(true)
    setDebugInfo(null)
    
    try {
      const response = await fetch(`${config.base_api_url}suppliers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })
      
      const data = await response.json()
      
      setDebugInfo({
        success: response.ok,
        status: response.status,
        data: data,
        message: response.ok ? 'Direct API call successful' : 'Direct API call failed'
      })
    } catch (error) {
      setDebugInfo({
        success: false,
        error: error.message,
        message: 'Direct API call error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">API Debugger</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="font-semibold mb-2">Authentication Status</h3>
          <div className="text-sm space-y-1">
            <p>User: {user ? user.name : 'Not logged in'}</p>
            <p>Token: {token ? '✅ Present' : '❌ Missing'}</p>
            <p>API URL: {config.base_api_url}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={testSuppliers}
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Suppliers Service'}
          </button>
          
          <button
            onClick={testDirectAPI}
            disabled={loading}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Direct API Call'}
          </button>
        </div>
      </div>

      {debugInfo && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Debug Results</h3>
          <div className={`p-4 rounded ${debugInfo.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className="font-medium mb-2">{debugInfo.message}</p>
            
            {debugInfo.status && (
              <p className="text-sm mb-2">Status: {debugInfo.status}</p>
            )}
            
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">View Raw Data</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApiDebugger
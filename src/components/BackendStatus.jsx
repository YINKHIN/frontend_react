import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import api from '../utils/api'

const BackendStatus = () => {
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkBackendStatus = async () => {
    setIsChecking(true)
    setError(null)
    
    try {
      // Try to reach the health endpoint
      const response = await api.get('/system/health')
      if (response.status === 200 && response.data) {
        setStatus('connected')
      } else {
        setStatus('error')
        setError('Unexpected response from server')
      }
    } catch (err) {
      setStatus('error')
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('Cannot connect to Laravel API. Please ensure it\'s running on http://localhost:8000')
      } else if (err.response?.status === 404) {
        setError('Health endpoint not found. Please check Laravel API routes.')
      } else if (err.response?.status === 500) {
        setError('Laravel server error. Check Laravel logs for details.')
      } else {
        setError(err.response?.data?.message || err.message || 'Unknown error occurred')
      }
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkBackendStatus()
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-yellow-50 border-yellow-200'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Backend Connected'
      case 'error':
        return 'Backend Connection Failed'
      default:
        return 'Checking Backend...'
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2 font-medium text-gray-900">{getStatusText()}</span>
        </div>
        <button
          onClick={checkBackendStatus}
          disabled={isChecking}
          className="btn-secondary text-xs px-2 py-1"
        >
          {isChecking ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-gray-600">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-3 text-sm text-gray-600">
          <strong>Quick Fix:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Ensure Laravel API is running: <code className="bg-gray-200 px-1 rounded">php artisan serve</code></li>
            <li>Check CORS configuration in Laravel</li>
            <li>Verify API routes are properly defined</li>
          </ol>
        </div>
      )}
      
      {status === 'connected' && (
        <div className="mt-2 text-sm text-green-700">
          ✅ Backend is running and accessible. You can now use all features.
        </div>
      )}
    </div>
  )
}

export default BackendStatus

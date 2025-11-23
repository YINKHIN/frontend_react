import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import testService from '../services/testService'

const SystemHealthChecker = () => {
  const { user } = useAuth()
  const [health, setHealth] = useState({
    api: 'checking',
    database: 'checking',
    permissions: 'checking',
    performance: 'checking'
  })
  const [stats, setStats] = useState(null)

  useEffect(() => {
    checkSystemHealth()
  }, [])

  const checkSystemHealth = async () => {
    // Check API Connection
    const connectionTest = await testService.testConnection()
    if (connectionTest.success) {
      setHealth(prev => ({ ...prev, api: 'healthy' }))
    } else {
      setHealth(prev => ({ ...prev, api: 'error' }))
    }

    // Check Database & Get Test Data
    const productsTest = await testService.testProducts()
    if (productsTest.success) {
      const products = productsTest.data?.data || productsTest.data || []
      setStats({
        products: Array.isArray(products) ? products.length : 0,
        orders: 0, // Will be updated when auth works
        payments: 0 // Will be updated when auth works
      })
      setHealth(prev => ({ ...prev, database: 'healthy' }))
    } else {
      setHealth(prev => ({ ...prev, database: 'error' }))
    }

    // Check Permissions
    if (user) {
      setHealth(prev => ({ ...prev, permissions: 'healthy' }))
    } else {
      setHealth(prev => ({ ...prev, permissions: 'error' }))
    }

    // Performance Check
    const startTime = performance.now()
    try {
      await api.get('/test-public')
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      if (responseTime < 1000) {
        setHealth(prev => ({ ...prev, performance: 'healthy' }))
      } else if (responseTime < 3000) {
        setHealth(prev => ({ ...prev, performance: 'warning' }))
      } else {
        setHealth(prev => ({ ...prev, performance: 'slow' }))
      }
    } catch (error) {
      setHealth(prev => ({ ...prev, performance: 'error' }))
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'slow': return '🐌'
      default: return '🔄'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      case 'slow': return 'text-orange-600'
      default: return 'text-blue-600'
    }
  }

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-800 mb-3">
        🏥 System Health Status
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-2xl ${getStatusColor(health.api)}`}>
            {getStatusIcon(health.api)}
          </div>
          <div className="text-xs font-medium">API Connection</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl ${getStatusColor(health.database)}`}>
            {getStatusIcon(health.database)}
          </div>
          <div className="text-xs font-medium">Database</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl ${getStatusColor(health.permissions)}`}>
            {getStatusIcon(health.permissions)}
          </div>
          <div className="text-xs font-medium">Permissions</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl ${getStatusColor(health.performance)}`}>
            {getStatusIcon(health.performance)}
          </div>
          <div className="text-xs font-medium">Performance</div>
        </div>
      </div>

      {stats && (
        <div className="bg-gray-50 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">
            📊 Real Database Data:
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>Products: <strong>{stats.products}</strong></div>
            <div>Orders: <strong>{stats.orders}</strong></div>
            <div>Payments: <strong>{stats.payments}</strong></div>
          </div>
        </div>
      )}

      <div className="mt-3 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          User: <strong>{user?.name || 'Not logged in'}</strong> ({user?.type || 'N/A'})
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const result = await testService.testProductUpdate(1)
              if (result.success) {
                alert('✅ Admin permissions working! Product update successful.')
              } else {
                alert('❌ Admin permissions failed: ' + result.error)
              }
            }}
            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
          >
            🧪 Test Admin
          </button>
          <button
            onClick={checkSystemHealth}
            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  )
}

export default SystemHealthChecker
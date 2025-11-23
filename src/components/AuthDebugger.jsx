import React from 'react'
import { useAuth } from '../context/AuthContext'

const AuthDebugger = () => {
  const { user } = useAuth()
  
  const token = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')
  
  // Only show in demo mode
  if (!token || !token.startsWith('demo-token-')) {
    return null
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-red-800 mb-2">
        🐛 Auth Debug Info
      </h3>
      <div className="text-xs text-red-700 space-y-1">
        <div><strong>Token:</strong> {token}</div>
        <div><strong>User Type:</strong> {user?.type}</div>
        <div><strong>User Name:</strong> {user?.name}</div>
        <div><strong>Stored User:</strong> {storedUser}</div>
        <div><strong>Token Valid:</strong> {token && token.startsWith('demo-token-') ? '✅ Yes' : '❌ No'}</div>
      </div>
    </div>
  )
}

export default AuthDebugger
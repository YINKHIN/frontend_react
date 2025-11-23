import React from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'

const RoleSwitcher = () => {
  const { user, updateUser } = useAuth()

  const roles = [
    { value: 'admin', label: '👑 Admin', description: 'Full system access' },
    { value: 'manager', label: '👔 Manager', description: 'Management level access' },
    { value: 'sales_staff', label: '💰 Sales Staff', description: 'Sales focused permissions' },
    { value: 'inventory_staff', label: '📦 Inventory Staff', description: 'Inventory focused permissions' },
    { value: 'user', label: '👤 User', description: 'Read-only access' }
  ]

  const handleRoleChange = (newRole) => {
    const roleInfo = roles.find(r => r.value === newRole)
    updateUser({ type: newRole })
    toast.success(`Switched to ${roleInfo.label}`)
  }

  // Only show in demo mode
  const token = localStorage.getItem('token')
  if (!token || !token.startsWith('demo-token-')) {
    return null
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">
        🧪 Demo Mode - Role Switcher
      </h3>
      <p className="text-xs text-yellow-700 mb-3">
        Current role: <strong>{user?.type}</strong>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => handleRoleChange(role.value)}
            className={`p-2 text-xs rounded border transition-colors ${
              user?.type === role.value
                ? 'bg-yellow-200 border-yellow-400 text-yellow-900'
                : 'bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-100'
            }`}
            title={role.description}
          >
            {role.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default RoleSwitcher
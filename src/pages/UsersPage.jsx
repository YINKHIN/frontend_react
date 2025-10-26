import { useState } from 'react'
import { Plus, Search, Edit, Trash2, User, Shield, Crown, Users, ShoppingCart, Package, Eye } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUsers, useDeleteUser } from '../hooks/useUsers'
import LoadingSpinner from '../components/LoadingSpinner'
import UserModal from '../components/UserModal'
import { formatDate, getUserRoleDisplay, getImageUrl } from '../utils/helper'
import { config } from '../utils/config'

// Function to get role-specific colors and icons
const getRoleColors = (userType) => {
  const roleColors = {
    admin: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-lg font-bold',
    manager: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600 shadow-lg font-bold',
    sales: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 shadow-lg font-bold',
    staff_sale: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 shadow-lg font-bold', // Fallback
    inventory: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg font-bold',
    inventory_staff: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg font-bold', // Fallback
    user: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-600 shadow-lg font-semibold'
  }
  return roleColors[userType] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-600 shadow-lg font-semibold'
}

const getRoleIcon = (userType) => {
  const roleIcons = {
    admin: Crown,
    manager: Shield,
    sales: ShoppingCart,
    staff_sale: ShoppingCart, // Fallback
    inventory: Package,
    inventory_staff: Package, // Fallback
    user: User
  }
  const IconComponent = roleIcons[userType] || User
  return <IconComponent className="w-4 h-4 mr-1.5 text-white" />
}

const UsersPage = () => {
  const { hasPermission } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')

  const { data: usersResponse, isLoading, error } = useUsers()
  const deleteUser = useDeleteUser()

  // Handle different API response formats
  const users = usersResponse?.data?.data || usersResponse?.data || usersResponse || []

  // Only admins can access this page
  if (!hasPermission('manage_users')) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to manage users</p>
      </div>
    )
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleView = (user) => {
    setSelectedUser(user)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDelete = async (user) => {
    setSelectedUser(user)
    if (window.confirm(`Are you sure you want to delete "${user.name}"?`)) {
      try {
        await deleteUser.mutateAsync(user.id)
      } catch (error) {
        console.error('Delete failed:', error)
      } finally {
        setSelectedUser(null)
      }
    } else {
      setSelectedUser(null)
    }
  }

  if (isLoading) return <LoadingSpinner className="h-64" />
  if (error) return <div className="text-red-600">Error loading users</div>

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage system users and permissions</p>
        </div>
        <button onClick={handleCreate} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        {/* Role Color Legend */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">🎨 User Role Colors & Permissions:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { type: 'admin', label: 'Administrator', desc: 'Full Access' },
              { type: 'manager', label: 'Manager', desc: 'Read Only' },
              { type: 'sales', label: 'Sales Staff', desc: 'Orders & Payments' },
              { type: 'inventory', label: 'Inventory Staff', desc: 'Products & Stock' },
              { type: 'user', label: 'User', desc: 'View Only' }
            ].map(role => (
              <div key={role.type} className="text-center">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm border-2 ${getRoleColors(role.type)} mb-1`}>
                  {getRoleIcon(role.type)}
                  {role.label}
                </span>
                <div className="text-xs text-gray-500">{role.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-head">User</th>
                <th className="table-head">Email</th>
                <th className="table-head">Role</th>
                <th className="table-head">Created</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-gray-200">
                        {(user.image || user.profile?.image) ? (
                          <img 
                            src={user.image_url || user.profile?.image_url || getImageUrl(user.image || user.profile?.image, config.base_image_url)}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-primary-600 flex items-center justify-center ${(user.image || user.profile?.image) ? 'hidden' : ''}`}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 space-y-0.5">
                          {(user.phone || user.profile?.phone) && (
                            <div>📞 {user.phone || user.profile?.phone}</div>
                          )}
                          {(user.address || user.profile?.address) && (
                            <div className="truncate max-w-48">📍 {user.address || user.profile?.address}</div>
                          )}
                          {!(user.phone || user.profile?.phone) && !(user.address || user.profile?.address) && (
                            <div>No contact info</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-900">{user.email}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border-2 ${getRoleColors(user.type || user.user_type)}`}>
                      {getRoleIcon(user.type || user.user_type)}
                      {getUserRoleDisplay(user.type || user.user_type)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(user)}
                        className="text-gray-400 hover:text-gray-600"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete"
                        disabled={deleteUser.isLoading}
                      >
                        {deleteUser.isLoading && selectedUser?.id === user.id ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first user'}
            </p>
          </div>
        )}
      </div>

      {modalOpen && (
        <UserModal
          user={selectedUser}
          mode={modalMode}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

export default UsersPage
import { Navigate } from 'react-router-dom'
import LoadingSpinner from './LoadingSpinner'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check permissions if specified
  if (requiredPermissions.length > 0 && !hasPermission(requiredPermissions)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}

export { ProtectedRoute }

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import api from '../utils/api'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        
        if (token && user) {
          const parsedUser = JSON.parse(user)
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: parsedUser, token }
          })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Always use real API login - demo mode disabled
      // const isDemoLogin = credentials.email === 'admin@example.com' && credentials.password === 'password'
      
      if (false) { // Demo mode disabled
        // Demo login without backend
        const demoUser = {
          id: 1,
          name: 'Demo Admin',
          email: 'admin@example.com',
          type: 'admin'
        }
        const demoToken = 'demo-token-' + Date.now()
        
        localStorage.setItem('token', demoToken)
        localStorage.setItem('user', JSON.stringify(demoUser))
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: demoUser, token: demoToken }
        })
        
        toast.success(`Welcome back, ${demoUser.name}!`)
        return { success: true }
      }
      
      // Try backend login
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        // Handle different Laravel API response formats
        let user, token
        
        if (response.data.data) {
          // Format: { success: true, data: { user: {...}, token: "..." } }
          user = response.data.data.user
          token = response.data.data.token
        } else {
          // Format: { success: true, user: {...}, access_token: "..." }
          user = response.data.user
          token = response.data.access_token || response.data.token
        }
        
        // Map database user types to frontend user types
        const mapUserType = (dbType) => {
          const typeMapping = {
            'sales': 'staff_sale',
            'inventory': 'inventory_staff',
            'admin': 'admin',
            'manager': 'manager',
            'user': 'user'
          }
          return typeMapping[dbType] || dbType
        }
        
        // Normalize user object - convert user_type to type for consistency
        const rawType = user.type || user.user_type || 'user'
        const normalizedUser = {
          ...user,
          type: mapUserType(rawType)
        }
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(normalizedUser))
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: normalizedUser, token }
        })
        
        toast.success(`Welcome back, ${normalizedUser.name}!`)
        return { success: true }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
        const message = response.data.message || 'Login failed'
        return { success: false, message }
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      let message = 'Login failed. Please try again.'
      
      if (error.code === 'ERR_NETWORK') {
        message = 'Cannot connect to server. Please ensure the Laravel API is running on http://localhost:8000'
      } else if (error.response?.status === 401) {
        message = 'Invalid email or password. Please check your credentials.'
      } else if (error.response?.status === 422) {
        message = 'Please check your input and try again.'
      } else if (error.response?.status >= 500) {
        message = 'Server error. Please try again later.'
      } else if (error.response?.data?.message) {
        message = error.response.data.message
      }
      
      return { success: false, message }
    }
  }, [dispatch])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }, [dispatch])

  const updateUser = useCallback((userData) => {
    const updatedUser = { ...state.user, ...userData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }, [state.user, dispatch])

  const hasPermission = useCallback((requiredPermissions) => {
    if (!state.user) return false
    
    const userType = state.user.type
    const permissions = {
      admin: ['view', 'create', 'read', 'update', 'delete', 'manage_users'],
      manager: ['view', 'read', 'update'],
      staff_sale: ['view', 'read', 'create_order', 'update_order', 'create_payment', 'update_payment'],
      inventory_staff: ['view', 'read', 'create', 'update', 'delete', 'create_product', 'update_product', 'create_import', 'update_import'],
      user: ['view', 'read']
    }

    const userPermissions = permissions[userType] || []
    
    if (Array.isArray(requiredPermissions)) {
      return requiredPermissions.some(permission => userPermissions.includes(permission))
    }
    
    return userPermissions.includes(requiredPermissions)
  }, [state.user])

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
    updateUser,
    hasPermission,
  }), [state, login, logout, updateUser, hasPermission])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

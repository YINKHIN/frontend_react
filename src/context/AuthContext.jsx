import { createContext, useContext, useReducer, useEffect } from 'react'
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

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Check if this is a demo login
      const isDemoLogin = credentials.email === 'admin@example.com' && credentials.password === 'password'
      
      if (isDemoLogin) {
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
        
        // Normalize user object - convert user_type to type for consistency
        const normalizedUser = {
          ...user,
          type: user.type || user.user_type || 'user'
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
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  const hasPermission = (requiredPermissions) => {
    if (!state.user) return false
    
    const userType = state.user.type
    const permissions = {
      admin: ['create', 'read', 'update', 'delete', 'manage_users'],
      manager: ['read'],
      staff_sale: ['read', 'create_order', 'update_order', 'create_payment', 'update_payment'],
      inventory_staff: ['read', 'create_product', 'update_product', 'create_import', 'update_import'],
      user: ['read']
    }

    const userPermissions = permissions[userType] || []
    
    if (Array.isArray(requiredPermissions)) {
      return requiredPermissions.some(permission => userPermissions.includes(permission))
    }
    
    return userPermissions.includes(requiredPermissions)
  }

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    hasPermission,
  }

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
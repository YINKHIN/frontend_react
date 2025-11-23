import api from '../utils/api'

// Simple test service that bypasses authentication
export const testService = {
  // Test basic API connection
  testConnection: async () => {
    try {
      const response = await api.get('/test-public')
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Test simple product operations without auth
  testProducts: async () => {
    try {
      const response = await api.get('/simple/products')
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Test simple product update without auth
  testProductUpdate: async (id) => {
    try {
      const response = await api.put(`/simple/products/${id}`, {
        name: 'Updated Product',
        price: 150
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Test authenticated endpoints
  testAuthEndpoints: async () => {
    const results = {}
    
    // Test auth endpoint
    try {
      const authResponse = await api.get('/test-auth')
      results.auth = { success: true, data: authResponse.data }
    } catch (error) {
      results.auth = { success: false, error: error.message }
    }

    // Test admin endpoint
    try {
      const adminResponse = await api.get('/test-admin')
      results.admin = { success: true, data: adminResponse.data }
    } catch (error) {
      results.admin = { success: false, error: error.message }
    }

    return results
  }
}

export default testService
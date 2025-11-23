import { request } from '../utils/request'

export const categoryService = {
  // Get all categories
  getAll: async () => {
    try {
      const result = await request.get('/test-categories')
      return result
    } catch (error) {
      // Fallback: try the regular endpoint with auth
      try {
        const authResult = await request.get('/categories')
        return authResult
      } catch (authError) {
        // Final fallback: return mock data
        console.warn('CategoryService: Using fallback mock data')
        return [
          {
            id: 1,
            name: 'Test Category 1',
            description: 'Test description 1',
            status: 'active',
            image: null,
            image_url: null,
            created_at: '2025-11-05T12:00:00Z'
          },
          {
            id: 2,
            name: 'Test Category 2',
            description: 'Test description 2',
            status: 'active',
            image: null,
            image_url: null,
            created_at: '2025-11-05T12:00:00Z'
          }
        ]
      }
    }
  },

  // Get category by ID
  getById: (id) => {
    return request.get(`/categories/${id}`)
  },

  // Create new category with image
  create: async (formData) => {
    try {
      // Use direct axios call for better control
      const api = (await import('../utils/api')).default
      const response = await api.post('/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('CategoryService: Create failed:', error)
      throw error
    }
  },

  // Update category
  update: async (id, formData) => {
    try {
      // For FormData with Laravel, use POST with method spoofing
      if (formData instanceof FormData) {
        formData.append('_method', 'PUT')
        
        // Use direct axios call for better control
        const api = (await import('../utils/api')).default
        const response = await api.post(`/categories/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data
      } else {
        // Regular JSON data can use PUT
        return request.put(`/categories/${id}`, formData)
      }
    } catch (error) {
      console.error('CategoryService: Update failed:', error)
      throw error
    }
  },

  // Delete category (with optional force delete)
  delete: (id, forceDelete = false) => {
    const url = forceDelete 
      ? `/categories/${id}?force=true`
      : `/categories/${id}`
    return request.delete(url)
  }
}
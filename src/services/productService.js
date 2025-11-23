import { request, uploadRequest } from '../utils/request'
import { config } from '../utils/config'

// Demo data for when backend is not available
const getDemoProducts = () => {
  return Promise.resolve({
    data: [
      {
        id: 1,
        pro_name: 'Laptop Dell XPS 13',
        pro_description: 'High-performance ultrabook with Intel Core i7',
        category_id: 1,
        brand_id: 1,
        upis: 1200,
        sup: 1500,
        qty: 25,
        reorder_point: 10,
        reorder_quantity: 20,
        batch_number: 'BATCH001',
        expiration_date: '2025-12-31',
        status: 'active',
        image_url: null,
        category: { id: 1, name: 'Laptops' },
        brand: { id: 1, name: 'Dell' },
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        pro_name: 'iPhone 15 Pro',
        pro_description: 'Latest iPhone with A17 Pro chip',
        category_id: 2,
        brand_id: 2,
        upis: 999,
        sup: 1199,
        qty: 15,
        reorder_point: 5,
        reorder_quantity: 10,
        batch_number: 'BATCH002',
        expiration_date: null,
        status: 'active',
        image_url: null,
        category: { id: 2, name: 'Smartphones' },
        brand: { id: 2, name: 'Apple' },
        created_at: '2024-01-02T00:00:00Z'
      },
      {
        id: 3,
        pro_name: 'Samsung Galaxy S24',
        pro_description: 'Premium Android smartphone',
        category_id: 2,
        brand_id: 3,
        upis: 899,
        sup: 1099,
        qty: 8,
        reorder_point: 10,
        reorder_quantity: 15,
        batch_number: 'BATCH003',
        expiration_date: null,
        status: 'active',
        image_url: null,
        category: { id: 2, name: 'Smartphones' },
        brand: { id: 3, name: 'Samsung' },
        created_at: '2024-01-03T00:00:00Z'
      },
      {
        id: 4,
        pro_name: 'MacBook Air M3',
        pro_description: 'Apple laptop with M3 chip',
        category_id: 1,
        brand_id: 2,
        upis: 1099,
        sup: 1299,
        qty: 12,
        reorder_point: 8,
        reorder_quantity: 12,
        batch_number: 'BATCH004',
        expiration_date: null,
        status: 'active',
        image_url: null,
        created_at: '2024-01-04T00:00:00Z'
      },
      {
        id: 5,
        pro_name: 'Wireless Mouse',
        pro_description: 'Ergonomic wireless mouse',
        category_id: 3,
        brand_id: 4,
        upis: 25,
        sup: 35,
        qty: 15,
        reorder_point: 20,
        reorder_quantity: 30,
        batch_number: 'BATCH005',
        expiration_date: null,
        status: 'active',
        image_url: null,
        created_at: '2024-01-05T00:00:00Z'
      },
      {
        id: 6,
        pro_name: 'USB-C Cable',
        pro_description: 'High-speed USB-C charging cable',
        category_id: 3,
        brand_id: 4,
        upis: 10,
        sup: 15,
        qty: 3,
        reorder_point: 15,
        reorder_quantity: 25,
        batch_number: 'BATCH006',
        expiration_date: null,
        status: 'active',
        image_url: null,
        created_at: '2024-01-06T00:00:00Z'
      }
    ]
  })
}

// Check if using demo mode
const isDemoMode = () => {
  const token = localStorage.getItem('token')
  return token && token.startsWith('demo-token-')
}

export const productService = {
  getAll: (params) => {
    const demoMode = isDemoMode()
    
    if (demoMode) {
      return getDemoProducts()
    }
    return request.get('/products', params)
  },
  getById: (id) => {
    if (isDemoMode()) {
      return getDemoProducts().then(response => {
        const product = response.data.find(p => p.id === parseInt(id))
        return { data: product }
      })
    }
    return request.get(`/products/${id}`)
  },
  create: (data) => {
    if (isDemoMode()) {
      // Simulate successful creation
      return Promise.resolve({ 
        data: { 
          id: Date.now(), 
          ...data, 
          created_at: new Date().toISOString() 
        } 
      })
    }
    // Use uploadRequest for FormData, regular request for JSON
    if (data instanceof FormData) {
      return uploadRequest('/products', data).then(response => response.data)
    }
    return request.post('/products', data)
  },
  update: (id, data) => {
    if (isDemoMode()) {
      // Simulate successful update
      return Promise.resolve({ 
        data: { 
          id: parseInt(id), 
          ...data, 
          updated_at: new Date().toISOString() 
        } 
      })
    }
    // Use uploadRequest for FormData, regular request for JSON
    if (data instanceof FormData) {
      // Laravel requires _method field for PUT with FormData
      data.append('_method', 'PUT')
      return uploadRequest(`/products/${id}`, data).then(response => response.data)
    }
    return request.put(`/products/${id}`, data)
  },
  delete: (id) => {
    if (isDemoMode()) {
      // Simulate successful deletion
      return Promise.resolve({ data: { message: 'Product deleted successfully' } })
    }
    return request.delete(`/products/${id}`)
  },
  deactivate: (id) => {
    if (isDemoMode()) {
      // Simulate successful deactivation
      return Promise.resolve({ data: { message: 'Product deactivated successfully' } })
    }
    return request.post(`/products/${id}/deactivate`)
  },
  activate: (id) => {
    if (isDemoMode()) {
      // Simulate successful activation
      return Promise.resolve({ data: { message: 'Product activated successfully' } })
    }
    return request.post(`/products/${id}/activate`)
  },
  getLowStock: (params) => {
    if (isDemoMode()) {
      // Return demo low stock products (products with qty <= reorder_point)
      return getDemoProducts().then(response => {
        const lowStockProducts = response.data.filter(product => 
          product.qty <= product.reorder_point
        )
        return { data: lowStockProducts }
      })
    }
    return request.get('/products/low-stock', params)
  },
  getExpired: (params) => request.get('/products/expired', params),
  getNearExpiration: (params) => request.get('/products/near-expiration', params),
}

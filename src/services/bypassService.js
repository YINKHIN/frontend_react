import api from '../utils/api'

// Bypass service that uses routes without authentication
export const bypassService = {
  // Test bypass connection
  test: async () => {
    try {
      const response = await api.get('/bypass/test')
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Products
  products: {
    getAll: () => api.get('/bypass/products'),
    getById: (id) => api.get(`/bypass/products/${id}`),
    create: (data) => api.post('/bypass/products', data),
    update: (id, data) => api.put(`/bypass/products/${id}`, data),
    delete: (id) => api.delete(`/bypass/products/${id}`),
    activate: (id) => api.post(`/bypass/products/${id}/activate`),
    deactivate: (id) => api.post(`/bypass/products/${id}/deactivate`)
  },

  // Orders
  orders: {
    getAll: () => api.get('/bypass/orders'),
    getById: (id) => api.get(`/bypass/orders/${id}`),
    create: (data) => api.post('/bypass/orders', data),
    update: (id, data) => api.put(`/bypass/orders/${id}`, data),
    delete: (id) => api.delete(`/bypass/orders/${id}`)
  },

  // Payments
  payments: {
    getAll: () => api.get('/bypass/payments'),
    getById: (id) => api.get(`/bypass/payments/${id}`),
    create: (data) => api.post('/bypass/payments', data),
    update: (id, data) => api.put(`/bypass/payments/${id}`, data),
    delete: (id) => api.delete(`/bypass/payments/${id}`)
  },

  // Customers
  customers: {
    getAll: () => api.get('/bypass/customers'),
    getById: (id) => api.get(`/bypass/customers/${id}`),
    create: (data) => api.post('/bypass/customers', data),
    update: (id, data) => api.put(`/bypass/customers/${id}`, data),
    delete: (id) => api.delete(`/bypass/customers/${id}`)
  },

  // Suppliers
  suppliers: {
    getAll: () => api.get('/bypass/suppliers'),
    getById: (id) => api.get(`/bypass/suppliers/${id}`),
    create: (data) => api.post('/bypass/suppliers', data),
    update: (id, data) => api.put(`/bypass/suppliers/${id}`, data),
    delete: (id) => api.delete(`/bypass/suppliers/${id}`)
  },

  // Categories
  categories: {
    getAll: () => api.get('/bypass/categories'),
    getById: (id) => api.get(`/bypass/categories/${id}`),
    create: (data) => api.post('/bypass/categories', data),
    update: (id, data) => api.put(`/bypass/categories/${id}`, data),
    delete: (id) => api.delete(`/bypass/categories/${id}`)
  },

  // Reports
  reports: {
    import: () => api.get('/bypass/reports/import'),
    sales: () => api.get('/bypass/reports/sales'),
    inventory: () => api.get('/bypass/reports/inventory'),
    financial: () => api.get('/bypass/reports/financial')
  }
}

export default bypassService
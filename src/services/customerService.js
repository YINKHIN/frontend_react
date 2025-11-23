import { request } from '../utils/request'

// Demo data for customers
const getDemoCustomers = () => {
  return Promise.resolve({
    data: [
      {
        id: 1,
        cus_name: 'John Doe',
        cus_email: 'john.doe@example.com',
        cus_phone: '+1234567890',
        cus_address: '123 Main Street, City',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        cus_name: 'Jane Smith',
        cus_email: 'jane.smith@example.com',
        cus_phone: '+1234567891',
        cus_address: '456 Oak Avenue, City',
        status: 'active',
        created_at: '2024-01-02T00:00:00Z'
      },
      {
        id: 3,
        cus_name: 'Bob Johnson',
        cus_email: 'bob.johnson@example.com',
        cus_phone: '+1234567892',
        cus_address: '789 Pine Road, City',
        status: 'active',
        created_at: '2024-01-03T00:00:00Z'
      }
    ]
  })
}

// Check if using demo mode
const isDemoMode = () => {
  return false // Always use real API data
}

export const customerService = {
  getAll: () => {
    if (isDemoMode()) return getDemoCustomers()
    return request.get('/customers')
  },
  getById: (id) => {
    if (isDemoMode()) {
      return getDemoCustomers().then(response => {
        const customer = response.data.find(c => c.id === parseInt(id))
        return { data: customer }
      })
    }
    return request.get(`/customers/${id}`)
  },
  create: (data) => {
    if (isDemoMode()) {
      return Promise.resolve({ 
        data: { 
          id: Date.now(), 
          ...data, 
          created_at: new Date().toISOString() 
        } 
      })
    }
    return request.post('/customers', data)
  },
  update: (id, data) => {
    if (isDemoMode()) {
      return Promise.resolve({ 
        data: { 
          id: parseInt(id), 
          ...data, 
          updated_at: new Date().toISOString() 
        } 
      })
    }
    return request.put(`/customers/${id}`, data)
  },
  delete: (id) => {
    if (isDemoMode()) {
      return Promise.resolve({ data: { message: 'Customer deleted successfully' } })
    }
    return request.delete(`/customers/${id}`)
  },
}

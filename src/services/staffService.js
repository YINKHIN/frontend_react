import { request, uploadRequest } from '../utils/request'

// Demo data for staff
const getDemoStaffs = () => {
  return Promise.resolve({
    data: [
      {
        id: 1,
        name: 'Dara Sok',
        email: 'dara.sok@company.com',
        phone: '+855123456789',
        position: 'Sales Manager',
        department: 'Sales',
        salary: 800.00,
        status: 'active',
        hire_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        phone: '+855123456790',
        position: 'Inventory Specialist',
        department: 'Warehouse',
        salary: 600.00,
        status: 'active',
        hire_date: '2024-01-15',
        created_at: '2024-01-15T00:00:00Z'
      },
      {
        id: 3,
        name: 'Mike Chen',
        email: 'mike.chen@company.com',
        phone: '+855123456791',
        position: 'Customer Service',
        department: 'Support',
        salary: 500.00,
        status: 'active',
        hire_date: '2024-02-01',
        created_at: '2024-02-01T00:00:00Z'
      }
    ]
  })
}

// Check if using demo mode
const isDemoMode = () => {
  const token = localStorage.getItem('token')
  return token && token.startsWith('demo-token-')
}

export const staffService = {
  getAll: () => {
    if (isDemoMode()) {
      return getDemoStaffs()
    }
    return request.get('/staffs')
  },
  getById: (id) => {
    if (isDemoMode()) {
      return getDemoStaffs().then(response => {
        const staff = response.data.find(s => s.id === parseInt(id))
        return { data: staff }
      })
    }
    return request.get(`/staffs/${id}`)
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
    // Check if data is FormData (file upload)
    if (data instanceof FormData) {
      return uploadRequest('/staffs', data).then(response => response.data)
    }
    return request.post('/staffs', data)
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
    // Check if data is FormData (file upload)
    if (data instanceof FormData) {
      // Laravel expects POST with _method=PUT for file uploads
      data.append('_method', 'PUT')
      return uploadRequest(`/staffs/${id}`, data).then(response => response.data)
    }
    return request.put(`/staffs/${id}`, data)
  },
  delete: (id) => {
    if (isDemoMode()) {
      return Promise.resolve({ data: { message: 'Staff deleted successfully' } })
    }
    return request.delete(`/staffs/${id}`)
  },
}

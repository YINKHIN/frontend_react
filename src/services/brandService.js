import { request } from '../utils/request'

// Demo data for brands
const getDemoBrands = () => {
  return Promise.resolve({
    data: [
      {
        id: 1,
        name: 'Dell',
        code: 'DELL',
        description: 'Dell Technologies',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Apple',
        code: 'APPL',
        description: 'Apple Inc.',
        status: 'active',
        created_at: '2024-01-02T00:00:00Z'
      },
      {
        id: 3,
        name: 'Samsung',
        code: 'SAMS',
        description: 'Samsung Electronics',
        status: 'active',
        created_at: '2024-01-03T00:00:00Z'
      },
      {
        id: 4,
        name: 'Logitech',
        code: 'LOGI',
        description: 'Logitech International',
        status: 'active',
        created_at: '2024-01-04T00:00:00Z'
      }
    ]
  })
}

// Check if using demo mode
const isDemoMode = () => {
  const token = localStorage.getItem('token')
  return token && token.startsWith('demo-token-')
}

export const brandService = {
  getAll: () => {
    if (isDemoMode()) return getDemoBrands()
    return request.get('/brands')
  },
  getById: (id) => request.get(`/brands/${id}`),
  create: (data) => request.post('/brands', data),
  update: (id, data) => request.put(`/brands/${id}`, data),
  delete: (id) => request.delete(`/brands/${id}`),
}

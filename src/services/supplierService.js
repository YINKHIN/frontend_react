import { request } from '../utils/request'

// Check if using demo mode
const isDemoMode = () => {
  const token = localStorage.getItem('token')
  return token && token.startsWith('demo-token-')
}

export const supplierService = {
  getAll: () => {
    return request.get('/suppliers')
  },

  getById: (id) => {
    return request.get(`/suppliers/${id}`)
  },

  create: (data) => {
    return request.post('/suppliers', data)
  },

  update: (id, data) => {
    return request.put(`/suppliers/${id}`, data)
  },

  delete: (id) => {
    return request.delete(`/suppliers/${id}`)
  },
}
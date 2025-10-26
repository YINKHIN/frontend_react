import { request } from '../utils/request'

export const importService = {
  getAll: () => request.get('/imports', { _t: Date.now() }), // Add timestamp to prevent caching
  getById: (id) => request.get(`/imports/${id}`, { _t: Date.now() }),
  create: (data) => request.post('/imports', data),
  update: (id, data) => request.put(`/imports/${id}`, data),
  delete: (id) => request.delete(`/imports/${id}`),
}
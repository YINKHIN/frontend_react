import { request } from '../utils/request'

export const orderService = {
  getAll: () => request.get('/orders', { _t: Date.now() }), // Add timestamp to prevent caching
  getById: (id) => request.get(`/orders/${id}`, { _t: Date.now() }),
  create: (data) => request.post('/orders', data),
  update: (id, data) => request.put(`/orders/${id}`, data),
  delete: (id) => request.delete(`/orders/${id}`),
  forceDelete: (id) => request.delete(`/orders/${id}/force`),
}
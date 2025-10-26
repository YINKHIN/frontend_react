import { request } from '../utils/request'

export const customerService = {
  getAll: () => request.get('/customers'),
  getById: (id) => request.get(`/customers/${id}`),
  create: (data) => request.post('/customers', data),
  update: (id, data) => request.put(`/customers/${id}`, data),
  delete: (id) => request.delete(`/customers/${id}`),
}
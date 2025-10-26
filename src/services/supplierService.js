import { request } from '../utils/request'

export const supplierService = {
  getAll: () => request.get('/suppliers'),
  getById: (id) => request.get(`/suppliers/${id}`),
  create: (data) => request.post('/suppliers', data),
  update: (id, data) => request.put(`/suppliers/${id}`, data),
  delete: (id) => request.delete(`/suppliers/${id}`),
}
import { request } from '../utils/request'

export const brandService = {
  getAll: () => request.get('/brands'),
  getById: (id) => request.get(`/brands/${id}`),
  create: (data) => request.post('/brands', data),
  update: (id, data) => request.put(`/brands/${id}`, data),
  delete: (id) => request.delete(`/brands/${id}`),
}
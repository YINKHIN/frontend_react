import { request } from '../utils/request'

export const categoryService = {
  getAll: () => request.get('/categories'),
  getById: (id) => request.get(`/categories/${id}`),
  create: (data) => request.post('/categories', data),
  update: (id, data) => request.put(`/categories/${id}`, data),
  delete: (id) => request.delete(`/categories/${id}`),
}
import { request, uploadRequest } from '../utils/request'

export const userService = {
  getAll: () => request.get('/users'),
  getById: (id) => request.get(`/users/${id}`),
  create: (data) => {
    // Check if data is FormData (file upload)
    if (data instanceof FormData) {
      return uploadRequest('/users', data).then(response => response.data)
    }
    return request.post('/users', data)
  },
  update: (id, data) => {
    // Check if data is FormData (file upload)
    if (data instanceof FormData) {
      // Laravel expects POST with _method=PUT for file uploads
      data.append('_method', 'PUT')
      return uploadRequest(`/users/${id}`, data).then(response => response.data)
    }
    return request.put(`/users/${id}`, data)
  },
  delete: (id) => request.delete(`/users/${id}`),
}
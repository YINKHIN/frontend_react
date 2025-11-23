import { request, uploadRequest } from '../utils/request'

export const userService = {
  getAll: () => {
    return request.get('/users')
  },
  getById: (id) => {
    return request.get(`/users/${id}`)
  },
  create: (data) => {
    if (data instanceof FormData) {
      return uploadRequest('/users', data).then(response => response.data)
    }
    return request.post('/users', data)
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT')
      return uploadRequest(`/users/${id}`, data).then(response => response.data)
    }
    return request.put(`/users/${id}`, data)
  },
  delete: (id) => {
    return request.delete(`/users/${id}`)
  },
}

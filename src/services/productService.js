import { request, uploadRequest } from '../utils/request'

export const productService = {
  getAll: (params) => request.get('/products', params),
  getById: (id) => request.get(`/products/${id}`),
  create: (data) => {
    // Use uploadRequest for FormData, regular request for JSON
    if (data instanceof FormData) {
      return uploadRequest('/products', data).then(response => response.data)
    }
    return request.post('/products', data)
  },
  update: (id, data) => {
    // Use uploadRequest for FormData, regular request for JSON
    if (data instanceof FormData) {
      // Laravel requires _method field for PUT with FormData
      data.append('_method', 'PUT')
      return uploadRequest(`/products/${id}`, data).then(response => response.data)
    }
    return request.put(`/products/${id}`, data)
  },
  delete: (id) => request.delete(`/products/${id}`),
  deactivate: (id) => request.post(`/products/${id}/deactivate`),
  activate: (id) => request.post(`/products/${id}/activate`),
  getLowStock: (params) => request.get('/products/low-stock', params),
  getExpired: (params) => request.get('/products/expired', params),
  getNearExpiration: (params) => request.get('/products/near-expiration', params),
}
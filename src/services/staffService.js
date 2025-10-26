import { request, uploadRequest } from '../utils/request'

export const staffService = {
  getAll: () => request.get('/staffs'),
  getById: (id) => request.get(`/staffs/${id}`),
  create: (data) => {
    // Check if data is FormData (file upload)
    if (data instanceof FormData) {
      return uploadRequest('/staffs', data).then(response => response.data)
    }
    return request.post('/staffs', data)
  },
  update: (id, data) => {
    // Check if data is FormData (file upload)
    if (data instanceof FormData) {
      // Laravel expects POST with _method=PUT for file uploads
      data.append('_method', 'PUT')
      return uploadRequest(`/staffs/${id}`, data).then(response => response.data)
    }
    return request.put(`/staffs/${id}`, data)
  },
  delete: (id) => request.delete(`/staffs/${id}`),
}
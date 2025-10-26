import api from './api'

// Generic request functions
export const request = {
  get: (url, params = {}) => api.get(url, { params }).then(response => response.data),
  post: (url, data = {}) => api.post(url, data).then(response => response.data),
  put: (url, data = {}) => api.put(url, data).then(response => response.data),
  delete: (url) => api.delete(url).then(response => response.data),
  patch: (url, data = {}) => api.patch(url, data).then(response => response.data),
}

// File upload request
export const uploadRequest = (url, formData) => {
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// Download request
export const downloadRequest = (url, params = {}) => {
  return api.get(url, {
    params,
    responseType: 'blob',
  })
}

export default request
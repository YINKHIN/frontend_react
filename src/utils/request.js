import api from './api'

// Generic request functions
export const request = {
  get: (url, params = {}, config = {}) => {
    // Merge timeout from config if provided
    const requestConfig = {
      params,
      timeout: config.timeout || 60000, // Default 60 seconds
      ...config
    };
    return api.get(url, requestConfig).then(response => {
      
      // Handle different response formats
      if (response.data && response.data.success && response.data.data) {
        // Format: { success: true, data: [...] }
        return { data: response.data.data };
      } else if (response.data && response.data.data && !response.data.success) {
        // Format: { status: "success", data: [...] }
        return { data: response.data.data };
      } else if (response.data && Array.isArray(response.data)) {
        // Format: [...]
        return { data: response.data };
      }
      // Return the whole response data if format is unknown
      return response.data;
    }).catch(error => {
      console.error('API Error:', error);
      console.error('API Error Response:', error.response?.data);
      throw error;
    })
  },
  post: (url, data = {}) => api.post(url, data).then(response => {
    // Handle different response formats
    if (response.data && response.data.data) {
      // Format: { status: "success", data: [...] }
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      // Format: [...]
      return response.data;
    }
    // Return the whole response data if format is unknown
    return response.data;
  }),
  put: (url, data = {}) => api.put(url, data).then(response => {
    // Handle different response formats
    if (response.data && response.data.data) {
      // Format: { status: "success", data: [...] }
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      // Format: [...]
      return response.data;
    }
    // Return the whole response data if format is unknown
    return response.data;
  }),
  delete: (url) => api.delete(url).then(response => {
    // Handle different response formats
    if (response.data && response.data.data) {
      // Format: { status: "success", data: [...] }
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      // Format: [...]
      return response.data;
    }
    // Return the whole response data if format is unknown
    return response.data;
  }),
  patch: (url, data = {}) => api.patch(url, data).then(response => {
    // Handle different response formats
    if (response.data && response.data.data) {
      // Format: { status: "success", data: [...] }
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      // Format: [...]
      return response.data;
    }
    // Return the whole response data if format is unknown
    return response.data;
  }),
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
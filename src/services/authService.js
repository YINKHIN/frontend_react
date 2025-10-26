import { request } from '../utils/request'

export const authService = {
  login: (credentials) => request.post('/auth/login', credentials),
  register: (userData) => request.post('/auth/register', userData),
  logout: () => request.post('/auth/logout'),
  getProfile: () => request.get('/auth/profile'),
  updateProfile: (id, userData) => request.put(`/auth/profile/${id}`, userData),
  changePassword: (passwordData) => request.post('/auth/change-password', passwordData),
  uploadProfileImage: (id, formData) => request.post(`/auth/profile/${id}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}
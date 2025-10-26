import { request } from '../utils/request'

export const paymentService = {
  getAll: () => request.get('/payments'),
  getById: (id) => request.get(`/payments/${id}`),
  create: (data) => request.post('/payments', data),
  update: (id, data) => request.put(`/payments/${id}`, data),
  delete: (id) => request.delete(`/payments/${id}`),
  getPending: () => request.get('/payments/pending'),
  getSummary: () => request.get('/payments/summary'),
  getOrderStatus: (orderId) => request.get(`/payments/order/${orderId}/status`),
}
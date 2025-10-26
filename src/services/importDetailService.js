import { request } from '../utils/request'

export const importDetailService = {
  getByImportId: (importId) => request.get(`/imports/${importId}/details`),
  create: (importId, data) => request.post(`/imports/${importId}/details`, data),
  update: (importId, productId, data) => request.put(`/imports/${importId}/details/${productId}`, data),
  delete: (importId, productId) => request.delete(`/imports/${importId}/details/${productId}`),
  bulkCreate: (importId, details) => request.post(`/imports/${importId}/details/bulk`, { details }),
}
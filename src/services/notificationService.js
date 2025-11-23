import { request } from '../utils/request'

// Demo data for when backend is not available
const getDemoNotifications = () => {
  return Promise.resolve({
    data: [
      {
        // id: 1,
        // title: 'Low Stock Alert',
        // message: 'Samsung Galaxy S24 is running low on stock (8 units remaining)',
        // type: 'warning',
        // read_at: null,
        // created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        // id: 2,
        // title: 'New Order',
        // message: 'Order #1001 has been placed by John Doe',
        // type: 'info',
        // read_at: null,
        // created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      },
      {
        // id: 3,
        // title: 'Payment Received',
        // message: 'Payment of $1,299.00 received for Order #1000',
        // type: 'success',
        // read_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago (read)
        // created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
      }
    ],
    total: 3,
    unread_count: 2
  })
}

// Check if using demo mode
const isDemoMode = () => {
  const token = localStorage.getItem('token')
  return token && token.startsWith('demo-token-')
}

export const notificationService = {
  getAll: (params) => {
    if (isDemoMode()) {
      return getDemoNotifications()
    }
    return request.get('/notifications', params)
  },
  getById: (id) => {
    if (isDemoMode()) {
      return getDemoNotifications().then(response => {
        const notification = response.data.find(n => n.id === parseInt(id))
        return { data: notification }
      })
    }
    return request.get(`/notifications/${id}`)
  },
  create: (data) => {
    if (isDemoMode()) {
      // Simulate successful creation
      return Promise.resolve({ 
        data: { 
          id: Date.now(), 
          ...data, 
          created_at: new Date().toISOString() 
        } 
      })
    }
    return request.post('/notifications', data)
  },
  update: (id, data) => {
    if (isDemoMode()) {
      // Simulate successful update
      return Promise.resolve({ 
        data: { 
          id: parseInt(id), 
          ...data, 
          updated_at: new Date().toISOString() 
        } 
      })
    }
    return request.put(`/notifications/${id}`, data)
  },
  delete: (id) => {
    if (isDemoMode()) {
      // Simulate successful deletion
      return Promise.resolve({ data: { message: 'Notification deleted successfully' } })
    }
    return request.delete(`/notifications/${id}`)
  },
  markAsRead: (id) => {
    if (isDemoMode()) {
      // Simulate successful mark as read
      return Promise.resolve({ data: { message: 'Notification marked as read' } })
    }
    return request.post(`/notifications/${id}/mark-as-read`)
  },
  markAllAsRead: () => {
    if (isDemoMode()) {
      // Simulate successful mark all as read
      return Promise.resolve({ data: { message: 'All notifications marked as read' } })
    }
    return request.post('/notifications/mark-all-as-read')
  },
  getUnreadCount: () => {
    if (isDemoMode()) {
      return getDemoNotifications().then(response => ({
        data: { count: response.unread_count }
      }))
    }
    return request.get('/notifications/unread-count')
  }
}
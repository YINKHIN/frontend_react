import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { request } from '../utils/request'

export const useNotifications = () => {
  return useQuery('notifications', () => request.get('/notifications'))
}

export const useNotification = (id) => {
  return useQuery(['notification', id], () => request.get(`/notifications/${id}`), {
    enabled: !!id,
  })
}

export const useCreateNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (data) => request.post('/notifications', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications')
        toast.success('Notification created successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create notification')
      },
    }
  )
}

export const useUpdateNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, data }) => request.put(`/notifications/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications')
        toast.success('Notification updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update notification')
      },
    }
  )
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (id) => request.delete(`/notifications/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications')
        toast.success('Notification deleted successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete notification')
      },
    }
  )
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (id) => request.post(`/notifications/${id}/mark-as-read`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications')
        // Don't show toast for mark as read to avoid clutter
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to mark notification as read')
      },
    }
  )
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    () => request.post('/notifications/mark-all-as-read'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications')
        toast.success('All notifications marked as read')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to mark all notifications as read')
      },
    }
  )
}

export const useUnreadCount = () => {
  return useQuery('unreadCount', () => request.get('/notifications/unread-count'))
}
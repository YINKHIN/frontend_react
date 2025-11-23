import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { request } from '../utils/request'

export const useNotifications = () => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await request.get('/notifications')
      setData(result.data)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, isLoading, error, refetch }
}

export const useMarkAsRead = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (notificationId) => {
    try {
      setIsLoading(true)
      const result = await request.patch(`/notifications/${notificationId}/read`)
      toast.success('Notification marked as read')
      return result.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark notification as read')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useMarkAllAsRead = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async () => {
    try {
      setIsLoading(true)
      const result = await request.patch('/notifications/mark-all-read')
      toast.success('All notifications marked as read')
      return result.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark all notifications as read')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

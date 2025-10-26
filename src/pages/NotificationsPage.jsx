import { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, X, Eye } from 'lucide-react'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate } from '../utils/helper'

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all') // all, unread, read
  const { data: notificationsResponse, isLoading, error, refetch } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  // Handle different API response formats
  const notifications = notificationsResponse?.data?.data || notificationsResponse?.data || notificationsResponse || []

  const filteredNotifications = Array.isArray(notifications) ? notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read
    if (filter === 'read') return notification.is_read
    return true
  }) : []

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.is_read).length : 0

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead.mutateAsync(id)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (window.confirm('Mark all notifications as read?')) {
      try {
        await markAllAsRead.mutateAsync()
      } catch (error) {
        console.error('Failed to mark all as read:', error)
      }
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500'
      case 'warning':
        return 'border-l-yellow-500'
      case 'info':
      default:
        return 'border-l-blue-500'
    }
  }

  if (isLoading) return <LoadingSpinner className="h-64" />
  if (error) return <div className="text-red-600">Error loading notifications: {error.message}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">View system notifications</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="btn-primary"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({notifications.length || 0})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'unread' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'read' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Read ({(notifications.length || 0) - unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                notification.is_read 
                  ? 'border-l-gray-300' 
                  : 'border-l-blue-500 bg-blue-50'
              } ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-medium ${
                      notification.is_read ? 'text-gray-900' : 'text-gray-900 font-semibold'
                    }`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.created_at)}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {notification.message}
                  </div>
                  {notification.related_url && (
                    <div className="mt-2">
                      <a 
                        href={notification.related_url} 
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View details
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? 'You have no unread notifications.' 
                : 'You have no notifications.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
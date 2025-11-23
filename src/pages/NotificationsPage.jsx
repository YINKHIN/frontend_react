import { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, X, Eye, Package, RefreshCw } from 'lucide-react'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate } from '../utils/helper'

import { request } from '../utils/request'

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all') // all, unread, read
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const { data: notificationsResponse, isLoading, error, refetch } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  // Fetch low stock products for notifications with auto refresh
  const [lowStockData, setLowStockData] = useState([])
  
  const refetchLowStock = async () => {
    try {
      const response = await request.get('/products')
      const products = Array.isArray(response?.data?.data) ? response.data.data :
                      Array.isArray(response?.data) ? response.data :
                      Array.isArray(response) ? response : [];
      
      // Calculate low stock products (qty <= reorder_point or qty <= 10)
      const lowStock = products.filter(product => {
        const qty = parseInt(product.qty || 0);
        const reorderPoint = parseInt(product.reorder_point || 10);
        return qty <= reorderPoint;
      });
      
      setLowStockData(lowStock);
    } catch (error) {
      console.error('Low stock fetch error:', error);
      setLowStockData([]);
    }
  }

  useEffect(() => {
    refetchLowStock()
    // Disabled auto-refresh to prevent timeout errors
    // if (autoRefresh) {
    //   const interval = setInterval(refetchLowStock, 30000)
    //   return () => clearInterval(interval)
    // }
  }, [autoRefresh])

  // Auto refresh notifications - DISABLED to prevent timeout errors
  useEffect(() => {
    // Disabled auto-refresh to prevent API timeout issues
    // if (autoRefresh) {
    //   const interval = setInterval(() => {
    //     refetch();
    //     refetchLowStock();
    //     setLastRefresh(new Date());
    //   }, 30000); // Refresh every 30 seconds

    //   return () => clearInterval(interval);
    // }
  }, [autoRefresh, refetch, refetchLowStock]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      await Promise.all([refetch(), refetchLowStock()]);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  // Format last refresh time
  const getLastRefreshText = () => {
    const now = new Date();
    const diffMs = now - lastRefresh;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 30) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return lastRefresh.toLocaleTimeString();
  };

  // Handle different API response formats
  const notifications = notificationsResponse?.data?.data || notificationsResponse?.data || notificationsResponse || []
  const lowStockProducts = Array.isArray(lowStockData) ? lowStockData : []

  // Create low stock notifications
  const lowStockNotifications = lowStockProducts.map(product => {
    const qty = parseInt(product.qty || 0);
    const reorderPoint = parseInt(product.reorder_point || 10);
    const urgencyLevel = qty === 0 ? 'critical' : qty <= 3 ? 'high' : 'medium';
    
    return {
      id: `low-stock-${product.id}`,
      type: qty === 0 ? 'error' : 'warning',
      title: qty === 0 ? '🚨 Out of Stock' : '⚠️ Low Stock Alert',
      message: qty === 0 
        ? `${product.pro_name} is completely out of stock! Immediate reorder required.`
        : `${product.pro_name} is running low with only ${qty} units remaining (Reorder at: ${reorderPoint} units)`,
      is_read: false,
      created_at: new Date().toISOString(),
      urgency: urgencyLevel,
      data: {
        product_id: product.id,
        product_name: product.pro_name,
        current_qty: qty,
        reorder_point: reorderPoint,
        category: product.category?.cat_name || 'Unknown',
        brand: product.brand?.brand_name || 'Unknown'
      }
    };
  })

  // Combine regular notifications with low stock notifications
  const allNotifications = [...lowStockNotifications, ...notifications]

  const filteredNotifications = Array.isArray(allNotifications) ? allNotifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read
    if (filter === 'read') return notification.is_read
    return true
  }) : []

  const unreadCount = Array.isArray(allNotifications) ? allNotifications.filter(n => !n.is_read).length : 0

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
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'error':
        return <X className="w-5 h-5 text-red-500" />
      case 'low_stock':
        return <Package className="w-5 h-5 text-red-500" />
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
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-gray-600">View system notifications</p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Last updated: {getLastRefreshText()}</span>
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
            title={`Auto refresh is ${autoRefresh ? 'enabled' : 'disabled'}`}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
          </button>
          
          {/* Manual Refresh Button */}
          <button 
            onClick={handleManualRefresh}
            className="btn-secondary text-sm flex items-center"
            title="Refresh now"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="btn-primary text-sm"
            >
              Mark All as Read
            </button>
          )}
        </div>
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
            All ({allNotifications.length || 0})
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
            Read ({(allNotifications.length || 0) - unreadCount})
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
                  
                  {/* Enhanced display for low stock notifications */}
                  {notification.data && notification.data.product_name && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-gray-700">Product:</span>
                          <span className="ml-1 text-gray-900">{notification.data.product_name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Current Stock:</span>
                          <span className={`ml-1 font-semibold ${
                            notification.data.current_qty === 0 ? 'text-red-600' :
                            notification.data.current_qty <= 3 ? 'text-orange-600' : 'text-yellow-600'
                          }`}>
                            {notification.data.current_qty} units
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Reorder Point:</span>
                          <span className="ml-1 text-gray-900">{notification.data.reorder_point} units</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Category:</span>
                          <span className="ml-1 text-gray-900">{notification.data.category}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notification.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                          notification.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {notification.urgency === 'critical' ? '🚨 Critical' :
                           notification.urgency === 'high' ? '⚠️ High Priority' : '⚠️ Medium Priority'}
                        </span>
                        <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                          <Package className="w-3 h-3 mr-1" />
                          View Product
                        </button>
                      </div>
                    </div>
                  )}
                  
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

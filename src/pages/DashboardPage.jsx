import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Calendar,
  DollarSign
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../hooks/useProducts'
import { useOrders } from '../hooks/useOrders'
import { usePayments } from '../hooks/usePayments'
import LoadingSpinner from '../components/LoadingSpinner'
import DashboardSkeleton from '../components/DashboardSkeleton'
import RoleSwitcher from '../components/RoleSwitcher'
import { formatCurrency, formatDate } from '../utils/helper'

const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Navigation handlers for Quick Actions
  const handleAddProduct = () => {
    console.log('Navigating to Products page...')
    navigate('/products')
  }

  const handleNewOrder = () => {
    console.log('Navigating to Orders page...')
    navigate('/orders')
  }

  const handleAddCustomer = () => {
    console.log('Navigating to Customers page...')
    navigate('/customers')
  }

  const handleViewReports = () => {
    console.log('Navigating to Analytics page...')
    navigate('/analytics')
  }

  const handleScheduleImport = () => {
    console.log('Navigating to Imports page...')
    navigate('/imports')
  }

  const handleCheckLowStock = () => {
    console.log('Scrolling to Low Stock section...')
    const lowStockSection = document.querySelector('[data-section="low-stock"]')
    if (lowStockSection) {
      lowStockSection.scrollIntoView({ behavior: 'smooth' })
      lowStockSection.classList.add('ring-2', 'ring-yellow-400', 'ring-opacity-75')
      setTimeout(() => {
        lowStockSection.classList.remove('ring-2', 'ring-yellow-400', 'ring-opacity-75')
      }, 3000)
    }
  }

  const handlePaymentHistory = () => {
    console.log('Navigating to Payments page...')
    navigate('/payments')
  }

  const handleInventoryAudit = () => {
    console.log('Navigating to Products page for audit...')
    navigate('/products')
  }

  // 🚀 Use hooks for parallel data fetching - MUCH FASTER!
  const { data: productsResponse, isLoading: productsLoading, refetch: refetchProducts } = useProducts()
  const { data: ordersResponse, isLoading: ordersLoading, refetch: refetchOrders } = useOrders()
  const { data: paymentsResponse, isLoading: paymentsLoading, refetch: refetchPayments } = usePayments()

  // Normalize data immediately - show UI even while loading
  const normalize = (res) => (res && (res.data?.data || res.data || res)) || []
  
  const products = useMemo(() => normalize(productsResponse), [productsResponse])
  const ordersRaw = useMemo(() => normalize(ordersResponse), [ordersResponse])
  const payments = useMemo(() => normalize(paymentsResponse), [paymentsResponse])

  // Remove duplicates from orders
  const orders = useMemo(() => {
    const uniqueOrdersMap = new Map()
    ordersRaw.forEach(order => {
      const orderId = order.id || order.ord_id
      if (orderId && !uniqueOrdersMap.has(orderId)) {
        uniqueOrdersMap.set(orderId, order)
      }
    })
    return Array.from(uniqueOrdersMap.values())
  }, [ordersRaw])

  // Calculate derived data
  const dashboardData = useMemo(() => {
    // Calculate low stock products
    const lowStock = products.filter(product => {
      const qty = parseInt(product.qty || 0)
      const reorderPoint = parseInt(product.reorder_point || 10)
      return qty <= reorderPoint
    })

    // Get recent orders (sorted by date, newest first)
    const recentOrders = [...orders]
      .sort((a, b) => {
        const dateA = new Date(a.created_at || a.ord_date)
        const dateB = new Date(b.created_at || b.ord_date)
        return dateB - dateA
      })
      .slice(0, 10) // Show last 10 orders

    return {
      products,
      orders,
      lowStock,
      recentOrders,
      payments
    }
  }, [products, orders, payments])

  // Combined loading state - only show spinner if ALL are loading AND no data yet
  const isLoading = productsLoading && ordersLoading && paymentsLoading && !dashboardData?.products?.length

  const refreshData = () => {
    refetchProducts()
    refetchOrders()
    refetchPayments()
  }

  // Use already deduplicated orders from dashboardData
  const uniqueOrders = dashboardData?.orders || []
  const totalOrdersCount = uniqueOrders.length

  // Total Revenue from orders
  const totalRevenue = useMemo(() => 
    uniqueOrders.reduce((sum, order) => sum + (parseFloat(order.total || 0)), 0),
    [uniqueOrders]
  )

  // Calculate this month's data
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const thisMonthOrders = useMemo(() => 
    uniqueOrders.filter(order => {
      const orderDate = new Date(order.ord_date || order.created_at)
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
    }),
    [uniqueOrders, currentMonth, currentYear]
  )

  const thisMonthRevenue = useMemo(() => {
    const payments = dashboardData?.payments || []
    return payments
      .filter(payment => {
        const paymentDate = new Date(payment.pay_date || payment.created_at)
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
      })
      .reduce((sum, payment) => sum + (parseFloat(payment.deposit || payment.amount || 0)), 0)
  }, [dashboardData?.payments, currentMonth, currentYear])

  const stats = [
    {
      name: 'Total Products',
      value: dashboardData?.products?.length || 0,
      icon: Package,
      color: 'bg-blue-500',
      subtext: `${Array.isArray(dashboardData?.products) ? dashboardData.products.filter(p => p.status === 'active').length : 0} active`,
      changeType: 'neutral'
    },
    {
      name: 'Total Orders',
      value: totalOrdersCount,
      icon: ShoppingCart,
      color: 'bg-green-500',
      subtext: `${thisMonthOrders.length} this month`,
      changeType: 'positive'
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'bg-purple-500',
      subtext: `${formatCurrency(thisMonthRevenue)} this month`,
      changeType: 'positive'
    },
    {
      name: 'Low Stock Items',
      value: dashboardData?.lowStock?.length || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      subtext: 'Need attention',
      changeType: 'warning'
    }
  ]

  // 🚀 YouTube-style: Show skeleton immediately, then real data
  // Only show skeleton on first load (no data yet)
  const isFirstLoad = isLoading && !dashboardData?.products?.length && !dashboardData?.orders?.length
  
  if (isFirstLoad) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || user?.full_name || user?.profile?.full_name || user?.username || user?.email || 'User'}
          </p>
          {/* Show loading indicator if data is refreshing */}
          {(productsLoading || ordersLoading || paymentsLoading) && dashboardData?.products?.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">🔄 Updating data...</p>
          )}
        </div>
        <div className="flex space-x-2">
          <RoleSwitcher />
          <button
            onClick={refreshData}
            className="btn-secondary"
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-md p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.subtext}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleAddProduct}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Add Product</span>
          </button>
          <button
            onClick={handleNewOrder}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium">New Order</span>
          </button>
          <button
            onClick={handleCheckLowStock}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
            <span className="text-sm font-medium">Check Low Stock</span>
          </button>
          <button
            onClick={handleViewReports}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium">View Reports</span>
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <span className="text-sm text-gray-500">
            Showing {dashboardData?.recentOrders?.length || 0} of {totalOrdersCount}
          </span>
        </div>
        {dashboardData?.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order.id || order.ord_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id || order.ord_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.ord_date || order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {order.status || 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent orders found</p>
        )}
      </div>

      {/* Low Stock Alert */}
      {dashboardData?.lowStock?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6" data-section="low-stock">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Low Stock Alert
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.lowStock.slice(0, 6).map((product) => (
              <div key={product.id || product.prod_id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="font-medium text-gray-900">{product.prod_name || product.name}</h3>
                <p className="text-sm text-gray-600">Current Stock: {product.qty || 0}</p>
                <p className="text-sm text-gray-600">Reorder Point: {product.reorder_point || 10}</p>
              </div>
            ))}
          </div>
          {dashboardData.lowStock.length > 6 && (
            <p className="text-sm text-gray-500 mt-4">
              And {dashboardData.lowStock.length - 6} more items need attention
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default DashboardPage
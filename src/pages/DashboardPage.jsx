import { useQuery } from 'react-query'
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
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/helper'
import { request } from '../utils/request'

const DashboardPage = () => {
  const { user } = useAuth()

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    async () => {
      const [products, orders, lowStock, recentOrders, payments] = await Promise.all([
        request.get('/products'),
        request.get('/orders'),
        request.get('/products/get-low-stock-products'),
        request.get('/orders', { limit: 5 }),
        request.get('/payments')
      ])
      
      return {
        products: products.data,
        orders: orders.data,
        lowStock: lowStock.data,
        recentOrders: recentOrders.data,
        payments: payments.data
      }
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )

  if (isLoading) {
    return <LoadingSpinner className="h-64" />
  }

  // Calculate total revenue from payments
  const totalRevenue = Array.isArray(dashboardData?.payments) 
    ? dashboardData.payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)
    : 0

  const stats = [
    {
      name: 'Total Products',
      value: dashboardData?.products?.length || 0,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Total Orders',
      value: dashboardData?.orders?.length || 0,
      icon: ShoppingCart,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Low Stock Items',
      value: dashboardData?.lowStock?.length || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      change: '-2%',
      changeType: 'decrease'
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'increase'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6">
            {dashboardData?.recentOrders?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.ord_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
          </div>
          <div className="p-6">
            {dashboardData?.lowStock?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.lowStock.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{product.pro_name}</p>
                      <p className="text-sm text-gray-500">
                        Stock: {product.qty} units
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">All products are well stocked</p>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.products?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.lowStock?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn-primary">
            <Package className="w-4 h-4 mr-2" />
            Add Product
          </button>
          <button className="btn-secondary">
            <ShoppingCart className="w-4 h-4 mr-2" />
            New Order
          </button>
          <button className="btn-secondary">
            <Users className="w-4 h-4 mr-2" />
            Add Customer
          </button>
          <button className="btn-secondary">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Reports
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
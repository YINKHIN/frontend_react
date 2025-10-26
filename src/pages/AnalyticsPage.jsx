import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  RadialBarChart, RadialBar
} from 'recharts'
import { 
  TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart,
  Calendar, Filter, Download, RefreshCw, Eye, BarChart3
} from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useUsers } from '../hooks/useUsers'
import LoadingSpinner from '../components/LoadingSpinner'
import PhotoGallery from '../components/PhotoGallery'

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d') // 7d, 30d, 90d, 1y
  const [activeTab, setActiveTab] = useState('overview') // overview, products, staff, gallery
  const [isLoading, setIsLoading] = useState(false)

  const { data: productsResponse } = useProducts()
  const { data: usersResponse } = useUsers()

  // Handle different API response formats
  const products = Array.isArray(productsResponse?.data) ? productsResponse.data : 
                  Array.isArray(productsResponse) ? productsResponse : []
  const users = Array.isArray(usersResponse?.data) ? usersResponse.data : 
               Array.isArray(usersResponse) ? usersResponse : []

  // Generate mock analytics data (in real app, this would come from API)
  const generateAnalyticsData = () => {
    const salesData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 10000) + 2000
    }))

    const categoryData = [
      { name: 'Electronics', value: 35, count: 45, color: '#3B82F6' },
      { name: 'Clothing', value: 25, count: 32, color: '#10B981' },
      { name: 'Books', value: 20, count: 28, color: '#F59E0B' },
      { name: 'Home & Garden', value: 15, count: 18, color: '#EF4444' },
      { name: 'Sports', value: 5, count: 7, color: '#8B5CF6' }
    ]

    // Generate top products with proper ranking colors
    const topProducts = (products || []).slice(0, 5).map((product, index) => ({
      name: product.pro_name || `Product ${index + 1}`,
      sales: Math.floor(Math.random() * 1000) + 100,
      revenue: Math.floor(Math.random() * 5000) + 500,
      growth: (Math.random() * 40 - 20).toFixed(1), // -20% to +20%
      rank: index + 1,
      // Assign colors based on ranking
      color: index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#EF4444'
    }))

    const staffPerformance = (users || []).slice(0, 6).map((user, index) => ({
      name: user.name || `User ${index + 1}`,
      sales: Math.floor(Math.random() * 50) + 10,
      target: 60,
      efficiency: Math.floor(Math.random() * 40) + 60
    }))

    return { salesData, categoryData, topProducts, staffPerformance }
  }

  const { salesData, categoryData, topProducts, staffPerformance } = generateAnalyticsData()

  // Calculate summary stats
  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0)
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0)
  const avgOrderValue = totalRevenue / totalOrders
  const totalProducts = (products || []).length
  const lowStockProducts = (products || []).filter(p => p.qty <= (p.reorder_point || 10)).length

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Avg Order Value',
      value: `$${avgOrderValue.toFixed(2)}`,
      change: '+4.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Products',
      value: totalProducts.toLocaleString(),
      change: `${lowStockProducts} low stock`,
      trend: lowStockProducts > 0 ? 'down' : 'up',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const exportData = () => {
    const data = { salesData, categoryData, topProducts, staffPerformance }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="btn-secondary text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={exportData}
            className="btn-primary text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border-b">
        <div className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'staff', label: 'Staff', icon: Users },
            { id: 'gallery', label: 'Photo Gallery', icon: Eye }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((card, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {card.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales & Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales & Orders</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="orders" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Staff Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={staffPerformance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#3B82F6" />
                  <Bar dataKey="target" fill="#E5E7EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performing Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Sales</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                            style={{ backgroundColor: `${product.color}20` }}>
                            <span className="font-bold text-sm" style={{ color: product.color }}>{index + 1}</span>
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{product.sales} units</td>
                      <td className="py-3 px-4">${product.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(product.growth) >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {parseFloat(product.growth) >= 0 ? '↗' : '↘'} {product.growth}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Analytics Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="sales" 
                  name="Sales (units)"
                  fill="#3B82F6"
                  // Color bars based on ranking
                  shape={(props) => {
                    const { payload, ...rest } = props;
                    const color = payload?.color || '#3B82F6';
                    return <rect {...rest} fill={color} />;
                  }}
                />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Staff Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Staff Performance Overview</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={staffPerformance}>
                <RadialBar dataKey="efficiency" cornerRadius={10} fill="#3B82F6" />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* Staff Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(users || []).slice(0, 6).map((user, index) => (
                <div key={user.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-medium capitalize">{user.user_type || user.type || 'User'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Performance:</span>
                      <span className="font-medium text-green-600">
                        {Math.floor(Math.random() * 40) + 60}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Products Gallery */}
          <PhotoGallery 
            items={products} 
            title="Products" 
            type="product" 
          />
          
          {/* Staff Gallery */}
          <PhotoGallery 
            items={users} 
            title="Staff" 
            type="staff" 
          />
        </div>
      )}
    </div>
  )
}

export default AnalyticsPage
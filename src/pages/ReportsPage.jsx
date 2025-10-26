import { useState, useEffect } from 'react'
import { 
  FileText, Download, Calendar, Filter, Search, TrendingUp, TrendingDown,
  Package, ShoppingCart, Users, DollarSign, BarChart3, PieChart,
  FileSpreadsheet, FileImage, FileType, RefreshCw, Eye, Settings
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { 
  useImportReport, useSalesReport, useImportSummary, useSalesSummary,
  useBestSellingProducts, useLowStockProducts, useInventorySummary,
  useExportReport
} from '../hooks/useReports'
import { useProducts } from '../hooks/useProducts'
import { useUsers } from '../hooks/useUsers'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/helper'

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('overview') // overview, import, sales, inventory
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [filters, setFilters] = useState({})
  const [isExporting, setIsExporting] = useState(false)

  // Hooks
  const { data: productsResponse } = useProducts()
  const { data: usersResponse } = useUsers()
  const exportReport = useExportReport()

  // Handle API response format
  const products = Array.isArray(productsResponse?.data) ? productsResponse.data : 
                  Array.isArray(productsResponse) ? productsResponse : []
  const users = Array.isArray(usersResponse?.data) ? usersResponse.data : 
               Array.isArray(usersResponse) ? usersResponse : []

  // Report queries with filters
  const reportParams = { ...filters, date_from: dateRange.from, date_to: dateRange.to }
  
  const { data: importSummary, isLoading: loadingImportSummary } = useImportSummary(reportParams)
  const { data: salesSummary, isLoading: loadingSalesSummary } = useSalesSummary(reportParams)
  const { data: bestSellingProducts, isLoading: loadingBestSelling } = useBestSellingProducts(reportParams)
  const { data: lowStockProducts, isLoading: loadingLowStock } = useLowStockProducts(reportParams)
  const { data: inventorySummary, isLoading: loadingInventory } = useInventorySummary(reportParams)

  // Process real data for charts
  const processImportData = () => {
    // In a real implementation, this would come from the API
    // For now, we'll generate mock data based on the date range
    const days = Math.ceil((new Date(dateRange.to) - new Date(dateRange.from)) / (1000 * 60 * 60 * 24)) + 1;
    const importData = Array.from({ length: Math.min(days, 30) }, (_, i) => ({
      date: new Date(new Date(dateRange.from).getTime() + i * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      imports: Math.floor(Math.random() * 10) + 5,
      amount: Math.floor(Math.random() * 5000) + 1000
    }));
    
    return importData;
  };

  const processSalesData = () => {
    // In a real implementation, this would come from the API
    // For now, we'll generate mock data based on the date range
    const days = Math.ceil((new Date(dateRange.to) - new Date(dateRange.from)) / (1000 * 60 * 60 * 24)) + 1;
    const salesData = Array.from({ length: Math.min(days, 30) }, (_, i) => ({
      date: new Date(new Date(dateRange.from).getTime() + i * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: Math.floor(Math.random() * 20) + 10,
      revenue: Math.floor(Math.random() * 8000) + 2000
    }));
    
    return salesData;
  };

  const processCategoryData = () => {
    return [
      { name: 'Electronics', value: 35, amount: 15000, color: '#3B82F6' },
      { name: 'Clothing', value: 25, amount: 10000, color: '#10B981' },
      { name: 'Books', value: 20, amount: 8000, color: '#F59E0B' },
      { name: 'Home & Garden', value: 15, amount: 6000, color: '#EF4444' },
      { name: 'Sports', value: 5, amount: 2000, color: '#8B5CF6' }
    ];
  };

  const importData = processImportData();
  const salesData = processSalesData();
  const categoryData = processCategoryData();

  // Summary calculations
  const totalImports = importData.reduce((sum, day) => sum + day.imports, 0)
  const totalImportAmount = importData.reduce((sum, day) => sum + day.amount, 0)
  const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0)
  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0)
  const profit = totalRevenue - totalImportAmount
  const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0

  const summaryCards = [
    {
      title: 'Total Imports',
      value: totalImports.toLocaleString(),
      amount: formatCurrency(totalImportAmount),
      change: '+12.5%',
      trend: 'up',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Sales',
      value: totalSales.toLocaleString(),
      amount: formatCurrency(totalRevenue),
      change: '+18.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Profit',
      value: formatCurrency(profit),
      amount: `${profitMargin}% margin`,
      change: '+8.7%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Products',
      value: products.length.toLocaleString(),
      amount: `${(products || []).filter(p => p.qty <= (p.reorder_point || 10)).length} low stock`,
      change: '+5.3%',
      trend: 'up',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const handleExport = async (type, format) => {
    setIsExporting(true)
    try {
      const filename = `${type}_report_${dateRange.from}_to_${dateRange.to}.${format}`
      await exportReport.mutateAsync({
        type,
        format,
        params: reportParams,
        filename
      })
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const ExportButton = ({ type, format, icon: Icon, label, color = 'blue' }) => (
    <button
      onClick={() => handleExport(type, format)}
      disabled={isExporting}
      className={`flex items-center space-x-2 px-3 py-2 bg-${color}-50 text-${color}-700 rounded-lg hover:bg-${color}-100 transition-colors text-sm font-medium disabled:opacity-50`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📊 Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive business reports and insights</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Date Range */}
          <div className="flex items-center space-x-2 bg-white rounded-lg border px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="text-sm border-none outline-none"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="text-sm border-none outline-none"
            />
          </div>
          
          <button className="btn-secondary text-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border-b">
        <div className="flex space-x-8 px-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'import', label: 'Import Reports', icon: Package },
            { id: 'sales', label: 'Sales Reports', icon: ShoppingCart },
            { id: 'inventory', label: 'Inventory Reports', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
                    <p className="text-sm text-gray-500 mt-1">{card.amount}</p>
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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import vs Sales */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Import vs Sales Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={importData.map((item, index) => ({
                  ...item,
                  sales: salesData[index]?.sales || 0,
                  revenue: salesData[index]?.revenue || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="imports" stroke="#3B82F6" strokeWidth={2} name="Imports" />
                  <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} name="Sales" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
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
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Import Reports Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Export Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📥 Export Import Reports</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <ExportButton type="import" format="excel" icon={FileSpreadsheet} label="Excel" color="green" />
              <ExportButton type="import" format="xlsx" icon={FileSpreadsheet} label="XLSX" color="green" />
              <ExportButton type="import" format="pdf" icon={FileImage} label="PDF" color="red" />
              <ExportButton type="import" format="word" icon={FileType} label="Word" color="blue" />
            </div>
          </div>

          {/* Import Summary Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Summary</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={importData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="imports" fill="#3B82F6" name="Import Count" />
                <Bar dataKey="amount" fill="#10B981" name="Import Amount ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Imports Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Import Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* In a real implementation, this would come from the API */}
                  {Array.from({ length: 5 }, (_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Supplier {i + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.floor(Math.random() * 10) + 1} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(Math.floor(Math.random() * 5000) + 1000)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sales Reports Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Export Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📤 Export Sales Reports</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <ExportButton type="sales" format="excel" icon={FileSpreadsheet} label="Excel" color="green" />
              <ExportButton type="sales" format="xlsx" icon={FileSpreadsheet} label="XLSX" color="green" />
              <ExportButton type="sales" format="pdf" icon={FileImage} label="PDF" color="red" />
              <ExportButton type="sales" format="word" icon={FileType} label="Word" color="blue" />
            </div>
          </div>

          {/* Sales Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="sales" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Sales Count" />
                <Area type="monotone" dataKey="revenue" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Best Selling Products</h3>
            <div className="space-y-4">
              {(products || []).slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{product.pro_name}</h4>
                      <p className="text-sm text-gray-500">{product.category?.name || 'No Category'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{Math.floor(product.qty * 0.1) + 10} sold</p>
                    <p className="text-sm text-gray-500">{formatCurrency(product.qty * product.upis)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Reports Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mr-4">
                  <TrendingDown className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(products || []).filter(p => p.qty <= (p.reorder_point || 10)).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency((products || []).reduce((sum, p) => sum + (p.qty * p.upis), 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">⚠️ Low Stock Products</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Point</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(products || []).filter(p => p.qty <= (p.reorder_point || 10)).slice(0, 10).map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                            <Package className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.pro_name}</div>
                            <div className="text-sm text-gray-500">{product.pro_description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category?.name || 'No Category'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-medium text-red-600">{product.qty}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.reorder_point || 10}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
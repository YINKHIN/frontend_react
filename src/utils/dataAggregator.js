/**
 * Data Aggregator Utilities
 * Functions for aggregating and transforming API data for analytics
 */

/**
 * Aggregate summary data from multiple API responses
 * @param {Object} salesSummary - Sales summary from API
 * @param {Object} importSummary - Import summary from API
 * @param {Object} inventorySummary - Inventory summary from API
 * @returns {Object} Aggregated summary data
 */
export const aggregateSummaryData = (salesSummary, importSummary, inventorySummary) => {
  const sales = salesSummary?.data || {}
  const imports = importSummary?.data || {}
  const inventory = inventorySummary?.data || {}
  
  return {
    // Sales metrics
    totalOrders: parseInt(sales.total_orders || 0),
    totalRevenue: parseFloat(sales.total_amount || 0),
    totalQuantitySold: parseInt(sales.total_qty || 0),
    avgOrderValue: sales.total_orders > 0 ? parseFloat(sales.total_amount || 0) / parseInt(sales.total_orders || 1) : 0,
    
    // Import metrics
    totalImports: parseInt(imports.total_imports || 0),
    totalImportValue: parseFloat(imports.total_amount || 0),
    totalImportQuantity: parseInt(imports.total_qty || 0),
    
    // Inventory metrics
    totalProducts: parseInt(inventory.total_products || 0),
    activeProducts: parseInt(inventory.active_products || 0),
    lowStockCount: parseInt(inventory.low_stock_products || 0),
    outOfStockCount: parseInt(inventory.out_of_stock_products || 0),
    
    // Calculated metrics
    profit: parseFloat(sales.total_amount || 0) - parseFloat(imports.total_amount || 0),
    profitMargin: sales.total_amount > 0 ? 
      ((parseFloat(sales.total_amount || 0) - parseFloat(imports.total_amount || 0)) / parseFloat(sales.total_amount || 0)) * 100 : 0
  }
}

/**
 * Process best selling products data for analytics
 * @param {Array} bestSellingData - Best selling products from API
 * @returns {Array} Processed product analytics data
 */
export const processProductAnalytics = (bestSellingData) => {
  if (!bestSellingData || !Array.isArray(bestSellingData)) return []
  
  return bestSellingData.map((product, index) => ({
    id: product.product_id,
    name: product.product_name,
    sales: parseInt(product.total_quantity || 0),
    revenue: parseFloat(product.total_revenue || 0),
    rank: index + 1,
    // Assign colors based on ranking
    color: index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#EF4444'
  }))
}

/**
 * Process staff performance data from users and calculate metrics
 * @param {Array} users - Users data from API
 * @param {Array} salesData - Sales report data for staff metrics
 * @param {Array} importData - Import report data for staff metrics
 * @returns {Array} Staff performance analytics
 */
export const processStaffAnalytics = (users, salesData = [], importData = []) => {
  if (!users || !Array.isArray(users)) return []
  
  return users.map(user => {
    // Calculate sales metrics for this staff member
    const staffSales = salesData.filter(sale => sale.staff_name === user.full_name || sale.staff_name === user.name)
    const salesCount = staffSales.length
    const salesRevenue = staffSales.reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0)
    
    // Calculate import metrics for this staff member
    const staffImports = importData.filter(imp => imp.staff_name === user.full_name || imp.staff_name === user.name)
    const importsCount = staffImports.length
    const importsValue = staffImports.reduce((sum, imp) => sum + parseFloat(imp.amount || 0), 0)
    
    // Calculate efficiency (simple metric based on activity)
    const totalActivity = salesCount + importsCount
    const efficiency = Math.min(100, Math.max(0, (totalActivity / 10) * 100)) // Scale to 0-100
    
    return {
      id: user.id,
      name: user.full_name || user.name,
      email: user.email,
      user_type: user.user_type || user.type || 'User',
      salesCount,
      salesRevenue,
      importsCount,
      importsValue,
      efficiency: Math.round(efficiency),
      target: 60, // Default target for charts
      sales: salesCount // For compatibility with existing charts
    }
  })
}

/**
 * Group data by time period for trend analysis
 * @param {Array} data - Raw data array
 * @param {string} dateField - Field name containing date
 * @param {string} valueField - Field name containing value
 * @param {string} period - Grouping period ('day', 'week', 'month')
 * @returns {Array} Grouped data by time period
 */
export const groupByTimePeriod = (data, dateField, valueField, period = 'day') => {
  if (!data || !Array.isArray(data)) return []
  
  const groupedData = data.reduce((acc, item) => {
    const date = new Date(item[dateField])
    let key
    
    switch (period) {
      case 'week':
        // Get start of week
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        key = startOfWeek.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'day':
      default:
        key = date.toISOString().split('T')[0]
        break
    }
    
    if (!acc[key]) {
      acc[key] = {
        period: key,
        value: 0,
        count: 0,
        items: []
      }
    }
    
    acc[key].value += parseFloat(item[valueField] || 0)
    acc[key].count += 1
    acc[key].items.push(item)
    
    return acc
  }, {})
  
  return Object.values(groupedData).sort((a, b) => a.period.localeCompare(b.period))
}

/**
 * Calculate totals from grouped data
 * @param {Array} data - Data array with numeric fields
 * @param {Array} fields - Field names to sum
 * @returns {Object} Object with totals for each field
 */
export const calculateTotals = (data, fields) => {
  if (!data || !Array.isArray(data)) return {}
  
  const totals = {}
  fields.forEach(field => {
    totals[field] = data.reduce((sum, item) => sum + parseFloat(item[field] || 0), 0)
  })
  
  return totals
}

/**
 * Generate trend data for charts from time-series data
 * @param {Array} currentData - Current period data
 * @param {Array} previousData - Previous period data for comparison
 * @param {string} valueField - Field to track for trends
 * @returns {Object} Trend analysis data
 */
export const generateTrendData = (currentData, previousData, valueField) => {
  if (!currentData || !Array.isArray(currentData)) return { trend: [], growth: 0 }
  
  const currentTotal = currentData.reduce((sum, item) => sum + parseFloat(item[valueField] || 0), 0)
  const previousTotal = previousData ? 
    previousData.reduce((sum, item) => sum + parseFloat(item[valueField] || 0), 0) : 0
  
  const growth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0
  
  // Process current data for trend line
  const trendData = groupByTimePeriod(currentData, 'ord_date', valueField, 'day')
    .map(item => ({
      date: new Date(item.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: item.value,
      count: item.count
    }))
  
  return {
    trend: trendData,
    growth: Math.round(growth * 10) / 10, // Round to 1 decimal
    currentTotal,
    previousTotal
  }
}

/**
 * Process low stock products for alerts
 * @param {Array} lowStockData - Low stock products from API
 * @param {number} threshold - Stock threshold for alerts
 * @returns {Array} Processed low stock alerts
 */
export const processLowStockAlerts = (lowStockData, threshold = 10) => {
  if (!lowStockData || !Array.isArray(lowStockData)) return []
  
  return lowStockData
    .filter(product => product.current_stock <= threshold)
    .map(product => ({
      id: product.id,
      name: product.pro_name,
      currentStock: product.current_stock,
      threshold,
      urgency: product.current_stock === 0 ? 'critical' : 
               product.current_stock <= threshold / 2 ? 'high' : 'medium'
    }))
    .sort((a, b) => a.currentStock - b.currentStock) // Sort by stock level (lowest first)
}

/**
 * Calculate performance metrics for dashboard cards
 * @param {Object} summaryData - Aggregated summary data
 * @param {Object} previousSummaryData - Previous period summary for growth calculation
 * @returns {Array} Dashboard card data
 */
export const generateDashboardCards = (summaryData, previousSummaryData = {}) => {
  const cards = [
    {
      title: 'Total Revenue',
      value: `$${summaryData.totalRevenue?.toLocaleString() || '0'}`,
      change: previousSummaryData.totalRevenue ? 
        `${((summaryData.totalRevenue - previousSummaryData.totalRevenue) / previousSummaryData.totalRevenue * 100).toFixed(1)}%` : '+0.0%',
      trend: summaryData.totalRevenue >= (previousSummaryData.totalRevenue || 0) ? 'up' : 'down',
      icon: 'DollarSign',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Orders',
      value: summaryData.totalOrders?.toLocaleString() || '0',
      change: previousSummaryData.totalOrders ? 
        `${((summaryData.totalOrders - previousSummaryData.totalOrders) / previousSummaryData.totalOrders * 100).toFixed(1)}%` : '+0.0%',
      trend: summaryData.totalOrders >= (previousSummaryData.totalOrders || 0) ? 'up' : 'down',
      icon: 'ShoppingCart',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Avg Order Value',
      value: `$${summaryData.avgOrderValue?.toFixed(2) || '0.00'}`,
      change: previousSummaryData.avgOrderValue ? 
        `${((summaryData.avgOrderValue - previousSummaryData.avgOrderValue) / previousSummaryData.avgOrderValue * 100).toFixed(1)}%` : '+0.0%',
      trend: summaryData.avgOrderValue >= (previousSummaryData.avgOrderValue || 0) ? 'up' : 'down',
      icon: 'TrendingUp',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Products',
      value: summaryData.totalProducts?.toLocaleString() || '0',
      change: `${summaryData.lowStockCount || 0} low stock`,
      trend: (summaryData.lowStockCount || 0) > 0 ? 'down' : 'up',
      icon: 'Package',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]
  
  return cards
}

/**
 * Analytics Calculator Utilities
 * Functions for calculating analytics metrics from real API data
 */

/**
 * Calculate growth percentage between current and previous values
 * @param {number} current - Current period value
 * @param {number} previous - Previous period value
 * @returns {string} Growth percentage with + or - sign
 */
export const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) {
    return current > 0 ? '+100.0' : '0.0'
  }
  
  const growth = ((current - previous) / previous) * 100
  return growth >= 0 ? `+${growth.toFixed(1)}` : growth.toFixed(1)
}

/**
 * Calculate average order value
 * @param {number} totalRevenue - Total revenue amount
 * @param {number} totalOrders - Total number of orders
 * @returns {number} Average order value
 */
export const calculateAverageOrderValue = (totalRevenue, totalOrders) => {
  if (!totalOrders || totalOrders === 0) return 0
  return totalRevenue / totalOrders
}

/**
 * Calculate profit margin percentage
 * @param {number} revenue - Total revenue
 * @param {number} cost - Total cost (import value)
 * @returns {number} Profit margin percentage
 */
export const calculateProfitMargin = (revenue, cost) => {
  if (!revenue || revenue === 0) return 0
  const profit = revenue - cost
  return (profit / revenue) * 100
}

/**
 * Process time series data for charts
 * @param {Array} data - Raw data array
 * @param {string} dateField - Field name for date
 * @param {string} valueField - Field name for value
 * @param {string} timeRange - Time range (7d, 30d, 90d, 1y)
 * @returns {Array} Processed time series data
 */
export const processTimeSeriesData = (data, dateField, valueField, timeRange) => {
  if (!data || !Array.isArray(data)) return []
  
  // Group data by date
  const groupedData = data.reduce((acc, item) => {
    const date = new Date(item[dateField]).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = {
        date,
        value: 0,
        count: 0
      }
    }
    acc[date].value += parseFloat(item[valueField] || 0)
    acc[date].count += 1
    return acc
  }, {})
  
  // Convert to array and sort by date
  return Object.values(groupedData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      date: formatDateForChart(item.date),
      value: item.value,
      count: item.count
    }))
}

/**
 * Format date for chart display
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export const formatDateForChart = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Calculate date range parameters for API calls
 * @param {string} timeRange - Time range (7d, 30d, 90d, 1y)
 * @returns {Object} Date range parameters
 */
export const getDateRangeParams = (timeRange) => {
  const endDate = new Date()
  const startDate = new Date()
  
  switch (timeRange) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(endDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(endDate.getDate() - 90)
      break
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
    default:
      startDate.setDate(endDate.getDate() - 30)
  }
  
  return {
    date_from: startDate.toISOString().split('T')[0],
    date_to: endDate.toISOString().split('T')[0]
  }
}

/**
 * Calculate previous period date range for growth comparison
 * @param {string} timeRange - Time range (7d, 30d, 90d, 1y)
 * @returns {Object} Previous period date range parameters
 */
export const getPreviousPeriodParams = (timeRange) => {
  const currentParams = getDateRangeParams(timeRange)
  const currentStart = new Date(currentParams.date_from)
  const currentEnd = new Date(currentParams.date_to)
  
  const periodLength = currentEnd - currentStart
  const previousEnd = new Date(currentStart)
  const previousStart = new Date(currentStart.getTime() - periodLength)
  
  return {
    date_from: previousStart.toISOString().split('T')[0],
    date_to: previousEnd.toISOString().split('T')[0]
  }
}

/**
 * Process sales data for trend charts
 * @param {Array} salesData - Raw sales report data
 * @returns {Array} Processed data for charts
 */
export const processSalesTrendData = (salesData) => {
  if (!salesData || !Array.isArray(salesData)) return []
  
  // Group by date and aggregate
  const groupedData = salesData.reduce((acc, item) => {
    const date = item.ord_date
    if (!acc[date]) {
      acc[date] = {
        date,
        sales: 0,
        orders: 0,
        revenue: 0
      }
    }
    acc[date].sales += parseFloat(item.amount || 0)
    acc[date].orders += 1
    acc[date].revenue += parseFloat(item.amount || 0)
    return acc
  }, {})
  
  return Object.values(groupedData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      date: formatDateForChart(item.date),
      sales: item.sales,
      orders: item.orders,
      revenue: item.revenue
    }))
}

/**
 * Process import vs sales data for comparison charts
 * @param {Array} importData - Import report data
 * @param {Array} salesData - Sales report data
 * @returns {Array} Combined data for comparison
 */
export const processImportVsSalesData = (importData, salesData) => {
  const importsByDate = {}
  const salesByDate = {}
  
  // Process import data
  if (importData && Array.isArray(importData)) {
    importData.forEach(item => {
      const date = item.imp_date
      if (!importsByDate[date]) {
        importsByDate[date] = 0
      }
      importsByDate[date] += parseFloat(item.amount || 0)
    })
  }
  
  // Process sales data
  if (salesData && Array.isArray(salesData)) {
    salesData.forEach(item => {
      const date = item.ord_date
      if (!salesByDate[date]) {
        salesByDate[date] = 0
      }
      salesByDate[date] += parseFloat(item.amount || 0)
    })
  }
  
  // Combine dates
  const allDates = new Set([...Object.keys(importsByDate), ...Object.keys(salesByDate)])
  
  return Array.from(allDates)
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date: formatDateForChart(date),
      imports: importsByDate[date] || 0,
      sales: salesByDate[date] || 0
    }))
}

/**
 * Calculate category distribution from product data
 * @param {Array} productData - Best selling products data
 * @returns {Array} Category distribution data
 */
export const calculateCategoryDistribution = (productData) => {
  if (!productData || !Array.isArray(productData)) return []
  
  // For now, we'll create mock categories since the API doesn't provide category data
  // In a real implementation, you would join with categories table
  const categories = [
    { name: 'Electronics', color: '#3B82F6' },
    { name: 'Clothing', color: '#10B981' },
    { name: 'Books', color: '#F59E0B' },
    { name: 'Home & Garden', color: '#EF4444' },
    { name: 'Sports', color: '#8B5CF6' }
  ]
  
  const totalRevenue = productData.reduce((sum, product) => sum + parseFloat(product.total_revenue || 0), 0)
  
  return categories.map((category, index) => {
    // Distribute products across categories (mock distribution)
    const categoryProducts = productData.filter((_, i) => i % categories.length === index)
    const categoryRevenue = categoryProducts.reduce((sum, product) => sum + parseFloat(product.total_revenue || 0), 0)
    const percentage = totalRevenue > 0 ? (categoryRevenue / totalRevenue) * 100 : 0
    
    return {
      name: category.name,
      value: Math.round(percentage),
      count: categoryProducts.length,
      color: category.color
    }
  }).filter(category => category.value > 0)
}

import { request } from '../utils/request'

export const reportService = {
  // Get Reports Data
  getImportReport: (params) => request.get('/reports/import-report', params),
  getSalesReport: (params) => request.get('/reports/sales-report', params),
  getImportSummary: (params) => request.get('/reports/import-summary', params),
  getSalesSummary: (params) => request.get('/reports/sales-summary', params),
  
  // Scheduled Reports
  getBestSellingProducts: (params) => request.get('/reports/best-selling-products', params),
  getLowStockProducts: (params) => request.get('/reports/low-stock-products', params),
  getInventorySummary: (params) => request.get('/reports/inventory-summary', params),
  
  // Export Functions - these return blob URLs for download
  exportImportExcel: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return `${window.location.origin}/api/reports/export-import-excel?${queryString}`
  },
  
  exportSalesExcel: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return `${window.location.origin}/api/reports/export-sales-excel?${queryString}`
  },
  
  exportImportExcelXlsx: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return `${window.location.origin}/api/reports/export-import-excel-xlsx?${queryString}`
  },
  
  exportSalesExcelXlsx: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return `${window.location.origin}/api/reports/export-sales-excel-xlsx?${queryString}`
  },
  
  exportImportPdf: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return `${window.location.origin}/api/reports/export-import-pdf?${queryString}`
  },
  
  exportSalesPdf: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return `${window.location.origin}/api/reports/export-sales-pdf?${queryString}`
  },
  
  exportSingleImportWord: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return `${window.location.origin}/api/reports/export-single-import-word?${queryString}`
  },
  
  exportSingleSalesWord: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return `${window.location.origin}/api/reports/export-single-sales-word?${queryString}`
  },
  
  // Helper function to download file
  downloadFile: async (url, filename) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
      throw error
    }
  }
}
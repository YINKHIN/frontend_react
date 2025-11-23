import { useState } from 'react'
import { Download, FileSpreadsheet, FileImage, FileType, Calendar, Filter, X, BarChart3 } from 'lucide-react'
import { exportReport } from '../hooks/useReports'
import { reportService } from '../services/reportService'
import { mockExportService } from '../services/mockExportService'
import LoadingSpinner from './LoadingSpinner'
import { request } from '../utils/request'

const ReportExporter = ({ type, title, onClose, analyticsData }) => {
  const [exportFormat, setExportFormat] = useState('excel')
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [filters, setFilters] = useState({})
  const [isExporting, setIsExporting] = useState(false)

  const exportFormats = type === 'analytics' ? [
   
    { id: 'pdf', label: 'PDF Document', icon: FileImage, color: 'text-red-600', bgColor: 'bg-red-50' },
   
  ] : [
    { id: 'excel', label: 'Excel (.xls)', icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'pdf', label: 'PDF Document', icon: FileImage, color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 'word', label: 'Word Document', icon: FileType, color: 'text-blue-600', bgColor: 'bg-blue-50' }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = {
        ...filters,
        date_from: dateRange.from,
        date_to: dateRange.to
      }

      const filename = `${type}_report_${dateRange.from}_to_${dateRange.to}.${exportFormat === 'json' ? 'json' : exportFormat}`

      if (type === 'analytics') {
        // Handle analytics export
        await handleAnalyticsExport(params, filename)
      } else {
        // Handle regular report export using the new exportReport function
        await exportReport({
          type,
          format: exportFormat,
          params,
          filename
        })
      }

      // Show success message and close modal
      console.log('Export completed successfully')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Export error:', error)
      alert(`Export failed: ${error.message}. Please check the console for more details.`)
    } finally {
      setIsExporting(false)
    }
  }

  // Function to fetch real data from API using proper API utility
  const fetchRealData = async () => {
    let importData = []
    let salesData = []

    try {
      // Fetch real import data using proper API utility
      const importResponse = await request.get('/imports')
      importData = Array.isArray(importResponse?.data) ? importResponse.data :
        Array.isArray(importResponse) ? importResponse : []
      console.log('Fetched real import data:', importData.length, 'records')
    } catch (error) {
      console.log('Could not fetch real import data:', error.message)
    }

    try {
      // Fetch real sales/orders data using proper API utility
      const ordersResponse = await request.get('/orders')
      salesData = Array.isArray(ordersResponse?.data) ? ordersResponse.data :
        Array.isArray(ordersResponse) ? ordersResponse : []
      console.log('Fetched real orders data:', salesData.length, 'records')
    } catch (error) {
      console.log('Could not fetch real orders data:', error.message)
    }

    return { importData, salesData }
  }

  const handleAnalyticsExport = async (params, filename) => {
    try {
      if (exportFormat === 'json') {
        // Export analytics data as JSON
        const data = {
          ...analyticsData,
          exportParams: params,
          exportedAt: new Date().toISOString(),
          summary: {
            totalRevenue: analyticsData.totalRevenue || 0,
            totalOrders: analyticsData.totalOrders || 0,
            totalImports: analyticsData.totalImports || 0,
            profit: analyticsData.profit || 0,
            profitMargin: analyticsData.profitMargin || 0
          }
        }

        const result = mockExportService.generateJSON(data, filename)
        if (!result.success) throw new Error(result.error)

        console.log('JSON export completed successfully')
      } else if (exportFormat === 'excel') {
        // Try API first, fallback to mock
        try {
          const importUrl = reportService.exportImportExcelXlsx(params)
          const salesUrl = reportService.exportSalesExcelXlsx(params)

          console.log('Trying API Excel export...', { importUrl, salesUrl })

          await reportService.downloadFile(importUrl, `analytics_import_${filename}`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          await reportService.downloadFile(salesUrl, `analytics_sales_${filename}`)

          console.log('API Excel export completed successfully')
        } catch (apiError) {
          console.log('API failed, using mock Excel export with real data...', apiError.message)

          // Fetch real data from API
          const { importData: realImportData, salesData: realSalesData } = await fetchRealData()

          // Use real data if available, otherwise use analytics data
          const importData = realImportData.length > 0 ? realImportData :
            analyticsData.trendData?.map((item, index) => ({
              id: `IMP-${String(index + 1).padStart(3, '0')}`,
              imp_date: item.date,
              amount: item.imports || 0,
              qty: item.importQty || 0,
              staff_name: 'Analytics Data',
              supplier_name: 'System Generated',
              status: 'completed'
            })) || []

          const importResult = mockExportService.generateExcel(importData, `analytics_import_${filename}`, 'import')
          if (!importResult.success) throw new Error(importResult.error)

          await new Promise(resolve => setTimeout(resolve, 1000))

          const salesResult = mockExportService.generateExcel(salesData, `analytics_sales_${filename}`, 'sales')
          if (!salesResult.success) throw new Error(salesResult.error)

          console.log('Mock Excel export completed successfully')
        }
      } else if (exportFormat === 'pdf') {
        // Try API first, fallback to mock
        try {
          const importUrl = reportService.exportImportPdf(params)
          const salesUrl = reportService.exportSalesPdf(params)

          console.log('Trying API PDF export...', { importUrl, salesUrl })

          await reportService.downloadFile(importUrl, `analytics_import_${filename.replace('.pdf', '')}.pdf`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          await reportService.downloadFile(salesUrl, `analytics_sales_${filename.replace('.pdf', '')}.pdf`)

          console.log('API PDF export completed successfully')
        } catch (apiError) {
          console.log('API failed, using mock PDF export with real data...', apiError.message)

          // Fetch real data from API
          const { importData: realImportData, salesData: realSalesData } = await fetchRealData()

          // Use real data if available, otherwise use analytics data
          const importData = realImportData.length > 0 ? realImportData :
            analyticsData.trendData?.map((item, index) => ({
              id: `IMP-${String(index + 1).padStart(3, '0')}`,
              imp_date: item.date,
              amount: item.imports || 0,
              qty: item.importQty || 0,
              staff_name: 'Analytics Data',
              supplier_name: 'System Generated',
              status: 'completed',
              batch_number: `BATCH-${String(index + 1).padStart(3, '0')}`,
              expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })) || []

          const salesData = realSalesData.length > 0 ? realSalesData :
            analyticsData.trendData?.map((item, index) => ({
              id: `ORD-${String(index + 1).padStart(3, '0')}`,
              ord_date: item.date,
              amount: item.sales || 0,
              cus_name: 'Analytics Customer',
              staff_name: 'Analytics Data',
              status: 'completed'
            })) || []

          const importResult = mockExportService.generatePDF(importData, `analytics_import_${filename.replace('.pdf', '')}.pdf`, 'import')
          if (!importResult.success) throw new Error(importResult.error)

          await new Promise(resolve => setTimeout(resolve, 1000))

          const salesResult = mockExportService.generatePDF(salesData, `analytics_sales_${filename.replace('.pdf', '')}.pdf`, 'sales')
          if (!salesResult.success) throw new Error(salesResult.error)

          console.log('Mock PDF export completed successfully')
        }
      }
    } catch (error) {
      console.error('Analytics export error:', error)
      throw error
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Export {title} Report</h2>
            <p className="text-sm text-gray-600 mt-1">Choose format and configure export options</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setExportFormat(format.id)}
                  className={`flex items-center p-4 rounded-lg border-2 transition-all ${exportFormat === format.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${format.bgColor} flex items-center justify-center mr-3`}>
                    <format.icon className={`w-5 h-5 ${format.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{format.label}</div>
                    <div className="text-xs text-gray-500">
                      {format.id === 'excel' || format.id === 'xlsx' ? 'Spreadsheet format' :
                        format.id === 'pdf' ? 'Portable document' :
                          format.id === 'json' ? 'Raw data format' : 'Word document'}
                    </div>
                  </div>
                  {exportFormat === format.id && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Date Range
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="input pl-10"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          {type !== 'analytics' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Additional Filters (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Staff ID</label>
                  <input
                    type="text"
                    placeholder="Filter by staff ID"
                    value={filters.staff_id || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, staff_id: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {type === 'import' ? 'Supplier ID' : 'Customer ID'}
                  </label>
                  <input
                    type="text"
                    placeholder={`Filter by ${type === 'import' ? 'supplier' : 'customer'} ID`}
                    value={filters[type === 'import' ? 'supplier_id' : 'customer_id'] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      [type === 'import' ? 'supplier_id' : 'customer_id']: e.target.value
                    }))}
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Analytics Summary */}
          {type === 'analytics' && analyticsData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Analytics Summary
              </label>
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Total Revenue:</span>
                    <span className="ml-2 text-blue-600">${analyticsData.totalRevenue?.toLocaleString() || '0'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total Orders:</span>
                    <span className="ml-2 text-blue-600">{analyticsData.totalOrders?.toLocaleString() || '0'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total Imports:</span>
                    <span className="ml-2 text-blue-600">{analyticsData.totalImports?.toLocaleString() || '0'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Profit:</span>
                    <span className="ml-2 text-green-600">${analyticsData.profit?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Export Preview</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Report Type:</span> {title}</p>
              <p><span className="font-medium">Format:</span> {exportFormats.find(f => f.id === exportFormat)?.label}</p>
              <p><span className="font-medium">Date Range:</span> {dateRange.from} to {dateRange.to}</p>
              <p><span className="font-medium">Filename:</span> {type}_report_{dateRange.from}_to_{dateRange.to}.{exportFormat}</p>
              {type === 'analytics' && (exportFormat === 'excel' || exportFormat === 'pdf') && (
                <p className="text-blue-600"><span className="font-medium">Note:</span> Will download 2 files (Import & Sales reports)</p>
              )}
            </div>
          </div>

          {/* Export Status Warning */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 Export Information</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>API Export:</strong> Will try Laravel API endpoints first</p>
              <p>• <strong>Fallback Export:</strong> If API fails, will use client-side generation</p>
              <p>• <strong>File Quality:</strong> API exports are recommended for production use</p>
              {type === 'analytics' && (
                <p>• <strong>Analytics:</strong> Exports both Import and Sales data as separate files</p>
              )}
            </div>
          </div>

          {/* Test Export URLs (Development) */}
          {process.env.NODE_ENV === 'development' && type !== 'analytics' && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">🔧 Test Export URLs</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Excel:</strong> /api/reports/export-{type}-excel-xlsx</p>
                <p><strong>PDF:</strong> /api/reports/export-{type}-pdf</p>
                <p><strong>Word:</strong> /api/reports/export-single-{type}-word</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary"
          >
            {isExporting ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportExporter
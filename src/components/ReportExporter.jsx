import { useState } from 'react'
import { Download, FileSpreadsheet, FileImage, FileType, Calendar, Filter, X } from 'lucide-react'
import { useExportReport } from '../hooks/useReports'
import LoadingSpinner from './LoadingSpinner'

const ReportExporter = ({ type, title, onClose }) => {
  const [exportFormat, setExportFormat] = useState('excel')
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [filters, setFilters] = useState({})
  const [isExporting, setIsExporting] = useState(false)

  const exportReport = useExportReport()

  const exportFormats = [
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

      const filename = `${type}_report_${dateRange.from}_to_${dateRange.to}.${exportFormat}`

      await exportReport.mutateAsync({
        type,
        format: exportFormat,
        params,
        filename
      })

      // Close modal after successful export
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
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
                        format.id === 'pdf' ? 'Portable document' : 'Word document'}
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

          {/* Export Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Export Preview</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Report Type:</span> {title}</p>
              <p><span className="font-medium">Format:</span> {exportFormats.find(f => f.id === exportFormat)?.label}</p>
              <p><span className="font-medium">Date Range:</span> {dateRange.from} to {dateRange.to}</p>
              <p><span className="font-medium">Filename:</span> {type}_report_{dateRange.from}_to_{dateRange.to}.{exportFormat}</p>
            </div>
          </div>
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
import { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, File, Check } from 'lucide-react';

const ExportModal = ({ 
  isOpen, 
  onClose, 
  onExport, 
  availableColumns = [],
  totalRecords = 0,
  filteredRecords = 0,
  isExporting = false,
  exportProgress = 0
}) => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [selectedColumns, setSelectedColumns] = useState(availableColumns);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [exportScope, setExportScope] = useState('filtered'); // 'all' or 'filtered'

  if (!isOpen) return null;

  const formatOptions = [
    {
      value: 'excel',
      label: 'Excel (.xlsx)',
      icon: FileSpreadsheet,
      description: 'Best for data analysis and spreadsheet applications'
    },
    {
      value: 'csv',
      label: 'CSV (.csv)',
      icon: FileText,
      description: 'Compatible with most applications and databases'
    },
    {
      value: 'pdf',
      label: 'PDF (.pdf)',
      icon: File,
      description: 'Perfect for reports and printing'
    }
  ];

  const handleColumnToggle = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleSelectAllColumns = () => {
    setSelectedColumns(
      selectedColumns.length === availableColumns.length ? [] : availableColumns
    );
  };

  const handleExport = () => {
    const exportOptions = {
      format: exportFormat,
      selectedColumns: selectedColumns.length > 0 ? selectedColumns : availableColumns,
      includeDetails,
      exportScope,
      filename: `imports_${exportFormat}_${new Date().toISOString().split('T')[0]}.${
        exportFormat === 'excel' ? 'xlsx' : exportFormat
      }`
    };

    onExport(exportOptions);
  };

  const recordsToExport = exportScope === 'all' ? totalRecords : filteredRecords;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Export Imports Data</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isExporting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Format Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Export Format</h3>
            <div className="grid grid-cols-1 gap-3">
              {formatOptions.map(format => {
                const Icon = format.icon;
                return (
                  <label
                    key={format.value}
                    className={`
                      flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                      ${exportFormat === format.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.value}
                      checked={exportFormat === format.value}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="sr-only"
                      disabled={isExporting}
                    />
                    <Icon className={`w-6 h-6 mr-3 ${
                      exportFormat === format.value ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{format.label}</div>
                      <div className="text-sm text-gray-500">{format.description}</div>
                    </div>
                    {exportFormat === format.value && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Export Scope */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Export Scope</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="exportScope"
                  value="filtered"
                  checked={exportScope === 'filtered'}
                  onChange={(e) => setExportScope(e.target.value)}
                  className="mr-3"
                  disabled={isExporting}
                />
                <span className="text-gray-700">
                  Current filtered results ({filteredRecords} records)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="exportScope"
                  value="all"
                  checked={exportScope === 'all'}
                  onChange={(e) => setExportScope(e.target.value)}
                  className="mr-3"
                  disabled={isExporting}
                />
                <span className="text-gray-700">
                  All imports ({totalRecords} records)
                </span>
              </label>
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Select Columns</h3>
              <button
                onClick={handleSelectAllColumns}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={isExporting}
              >
                {selectedColumns.length === availableColumns.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
              {availableColumns.map(column => (
                <label key={column} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column)}
                    onChange={() => handleColumnToggle(column)}
                    className="mr-2 rounded border-gray-300"
                    disabled={isExporting}
                  />
                  <span className="text-sm text-gray-700">{column}</span>
                </label>
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {selectedColumns.length} of {availableColumns.length} columns selected
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Options</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                  className="mr-3 rounded border-gray-300"
                  disabled={isExporting}
                />
                <span className="text-gray-700">
                  Include detailed product information
                </span>
              </label>
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Format: {formatOptions.find(f => f.value === exportFormat)?.label}</div>
              <div>Records: {recordsToExport}</div>
              <div>Columns: {selectedColumns.length}</div>
              <div>Include Details: {includeDetails ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {/* Progress Bar */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Exporting...</span>
                <span className="text-gray-600">{Math.round(exportProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || selectedColumns.length === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
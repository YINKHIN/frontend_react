import { useState, useCallback, useEffect } from "react";
import { Download, Calendar, RefreshCw } from "lucide-react";
import { useImportReport, exportReport } from "../hooks/useReports";
import LoadingSpinner from "../components/LoadingSpinner"
import { formatDate, formatCurrency } from "../utils/helper";
import { toast } from "react-hot-toast";

const ImportReportPage = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [exportFormat, setExportFormat] = useState("excel");
  const [filters, setFilters] = useState({
    staff_id: "",
    supplier_id: "",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch import data with caching
  const {
    data: importReport,
    isLoading,
    error,
    refetch,
  } = useImportReport({
    date_from: dateRange.from,
    date_to: dateRange.to,
    ...filters,
  });

  // Cache processed data to avoid re-processing
  const [cachedData, setCachedData] = useState(null);
  const [cacheKey, setCacheKey] = useState('');

  useEffect(() => {
    const newCacheKey = `${dateRange.from}-${dateRange.to}-${JSON.stringify(filters)}`;
    if (newCacheKey !== cacheKey && importReport) {
      setCacheKey(newCacheKey);
      setCachedData(importReport);
    }
  }, [importReport, dateRange, filters, cacheKey]);

  // Use cached data for faster processing
  const imports = Array.isArray(cachedData?.data || importReport?.data) ? (cachedData?.data || importReport.data) : [];

  // Get flattened product data for detailed view
  const getProductRows = (importItem) => {
    const details = importItem.import_details || importItem.importDetails || [];
    if (details.length > 0) {
      return details.map((detail, index) => ({
        id: `${importItem.id}-${index}`,
        importId: importItem.id,
        date: importItem.imp_date,
        staff: importItem.staff_name || importItem.staff?.full_name || `Staff ${importItem.staff_id}`,
        supplier: importItem.supplier_name || importItem.supplier?.supplier || importItem.supplier || 'N/A',
        productName: detail.pro_name || detail.product?.pro_name || 'Unknown Product',
        qty: detail.qty || 0,
        amount: detail.amount || 0,
        batchNumber: detail.batch_number || 'N/A',
        expirationDate: detail.expiration_date || 'N/A',
        status: importItem.status || 'Completed'
      }));
    } else {
      // Return single row if no details
      return [{
        id: importItem.id,
        importId: importItem.id,
        date: importItem.imp_date,
        staff: importItem.staff_name || importItem.staff?.full_name || `Staff ${importItem.staff_id}`,
        supplier: importItem.supplier_name || importItem.supplier?.supplier || importItem.supplier || 'N/A',
        productName: 'General Import',
        qty: importItem.qty || 0,
        amount: importItem.amount || 0,
        batchNumber: importItem.batch_number || 'N/A',
        expirationDate: importItem.expiration_date || 'N/A',
        status: importItem.status || 'Completed'
      }];
    }
  };

  const allProductRows = imports.flatMap(importItem => getProductRows(importItem));

  // Refresh data
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refetch();
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      // Add a small delay to ensure the loading spinner is visible
      setTimeout(() => {
        setIsRefreshing(false);
      }, 300);
    }
  }, [refetch]);

  // Handle export
  const handleExport = async () => {
    const loadingToast = toast.loading(`Preparing import report for export...`);
    
    try {
      // Add delay to show loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const params = {
        date_from: dateRange.from,
        date_to: dateRange.to,
        ...filters,
      };

      // Determine file extension based on format
      let extension;
      switch (exportFormat) {
        case "pdf":
          extension = "pdf";
          break;
        case "xlsx":
          extension = "xlsx";
          break;
        case "word":
          extension = "html";
          break;
        default:
          extension = "xlsx";
      }

      const filename = `import_report_${dateRange.from}_to_${dateRange.to}.${extension}`;

      // Get fresh real data from database like UI does
      let exportData = [];
      try {
        const { importService } = await import('../services/importService');
        const importsResponse = await importService.getAll({ _t: Date.now() });
        
        // Handle different API response formats like UI does
        const imports = importsResponse?.data?.data || importsResponse?.data || importsResponse || [];
        
        // Filter imports by date range like UI does
        const filteredImports = Array.isArray(imports) ? imports.filter(importItem => {
          const importDate = new Date(importItem.imp_date);
          const fromDate = new Date(dateRange.from);
          const toDate = new Date(dateRange.to);
          return importDate >= fromDate && importDate <= toDate;
        }) : [];
        
        // Process data exactly like UI does
        exportData = filteredImports.flatMap(importItem => {
          const details = importItem.import_details || importItem.importDetails || [];
          return details.map((detail, index) => ({
            id: `${importItem.id}-${index}`,
            importId: importItem.id,
            date: importItem.imp_date,
            staff: importItem.staff?.full_name || importItem.full_name || importItem.staff_name || `Staff ${importItem.staff_id}`,
            supplier: importItem.supplier?.supplier || importItem.supplier_name || importItem.supplier || 'N/A',
            productName: detail.pro_name || detail.product?.pro_name || detail.product_name || 'Unknown Product',
            qty: detail.qty || detail.quantity || 0,
            amount: detail.amount || detail.price || detail.total || 0,
            batchNumber: detail.batch_number || detail.batchNumber || detail.batch || 'N/A',
            expirationDate: detail.expiration_date || detail.expirationDate || detail.expiry || 'N/A',
            status: importItem.status || 'Completed'
          }));
        });
        
        console.log('Using real import data from database:', exportData);
      } catch (error) {
        console.error('Failed to get real import data:', error);
        // Fallback to UI data
        exportData = allProductRows.length > 0 ? allProductRows : [];
      }
      
      if (exportData.length === 0) {
        throw new Error('No import data available to export. Please check your date range and try again.');
      }

      toast.dismiss(loadingToast);
      const processingToast = toast.loading(`Generating ${extension.toUpperCase()} file...`);

      await exportReport({
        type: "import",
        format: exportFormat,
        params,
        filename,
        fallbackData: exportData,
      });

      toast.dismiss(processingToast);
      toast.success("Import report exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.dismiss(loadingToast);
      toast.error("Export failed: " + (error.message || "Unknown error"));
    }
  };

  if (isLoading || isRefreshing) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="text-center">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-blue-600" />
          <p className="text-gray-600 text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Error loading data
        </h3>
        <p className="text-red-600">
          {error.message || "Failed to load import report data"}
        </p>
        <button onClick={handleRefresh} className="mt-4 btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Report</h1>
          <p className="text-gray-600">Detailed import transactions report</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center"
            title="Refresh Data"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleExport}
            className="btn-primary flex items-center"
            title="Export Report"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Filter Options
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
                className="input pl-10"
              />
            </div>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="input"
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="pdf">PDF</option>
              <option value="word">Word (.html)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={handleExport} className="btn-primary w-full">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Import Report Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Import Records
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {allProductRows.length} product entries from {imports.length} imports
            from {formatDate(dateRange.from)} to {formatDate(dateRange.to)}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Import ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allProductRows.length > 0 ? (
                allProductRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      #{row.importId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.staff}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.supplier}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.batchNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.expirationDate !== 'N/A' ? formatDate(row.expirationDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : row.status === "expired"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No import records found
                      </h3>
                      <p className="text-gray-500">
                        Try adjusting your filters or date range
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {allProductRows.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Total Items:</span>
                <span className="ml-2 text-gray-900">{allProductRows.length}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Value:</span>
                <span className="ml-2 text-gray-900 font-semibold">
                  {formatCurrency(allProductRows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0))}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Quantity:</span>
                <span className="ml-2 text-gray-900">
                  {allProductRows.reduce((sum, row) => sum + parseInt(row.qty || 0), 0)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Imports:</span>
                <span className="ml-2 text-gray-900">
                  {imports.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportReportPage;
import { useState, useEffect } from 'react';
import { useImportReport } from '../hooks/useReports';
import { formatDate, formatCurrency } from '../utils/helper';
import LoadingSpinner from './LoadingSpinner'
import { Package, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ImportReportTable = ({ dateRange, filters }) => {
  // Use useImportReport hook which calls /fast-import-report with date filtering
  const { data: importsResponse, isLoading, error, refetch } = useImportReport({
    date_from: dateRange.from,
    date_to: dateRange.to,
    ...filters
  });
  const [displayLimit, setDisplayLimit] = useState(50); // Show only 50 rows initially

  // Handle different API response formats from /fast-import-report
  // Note: request.get transforms { success: true, data: [...] } to { data: [...] }
  let imports = [];
  if (importsResponse) {
    console.log('Raw importsResponse type:', typeof importsResponse);
    console.log('Raw importsResponse:', importsResponse);
    
    // After request.get transformation, response is { data: [...] }
    if (Array.isArray(importsResponse.data)) {
      imports = importsResponse.data;
      console.log('Using importsResponse.data (array)');
    } else if (Array.isArray(importsResponse)) {
      imports = importsResponse;
      console.log('Using importsResponse directly (array)');
    } else if (importsResponse.success && Array.isArray(importsResponse.data)) {
      // Handle original API format if not transformed
      imports = importsResponse.data;
      console.log('Using importsResponse.success.data');
    } else if (importsResponse.data && typeof importsResponse.data === 'object') {
      imports = importsResponse.data.data || importsResponse.data.imports || [];
      console.log('Using nested importsResponse.data.data');
    } else {
      console.warn('Unknown response format:', importsResponse);
    }
  } else {
    console.warn('importsResponse is null or undefined');
  }

  // Additional client-side filtering by date range (in case API doesn't filter properly)
  // Note: We should NOT filter on client side if API already filtered, but we do it for safety
  const filteredImports = Array.isArray(imports) ? imports.filter(importItem => {
    if (!importItem.imp_date) {
      console.log('Import item without date, including:', importItem.id);
      return true; // Include items without date
    }
    
    try {
      // Parse dates - handle different formats
      const importDateStr = importItem.imp_date.split(' ')[0]; // Get date part only (YYYY-MM-DD)
      const importDate = new Date(importDateStr + 'T00:00:00'); // Use local time
      const fromDate = new Date(dateRange.from + 'T00:00:00');
      const toDate = new Date(dateRange.to + 'T23:59:59');
      
      // Check if date is valid
      if (isNaN(importDate.getTime()) || isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        console.warn('Invalid date detected:', { 
          importDate: importItem.imp_date, 
          importDateStr,
          fromDate: dateRange.from, 
          toDate: dateRange.to 
        });
        return true; // Include if date parsing fails
      }
      
      const isInRange = importDate >= fromDate && importDate <= toDate;
      
      if (!isInRange) {
        console.log('Import filtered out by date:', {
          id: importItem.id,
          importDate: importItem.imp_date,
          importDateParsed: importDate.toISOString(),
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          range: `${dateRange.from} to ${dateRange.to}`
        });
      }
      
      return isInRange;
    } catch (error) {
      console.error('Date filtering error:', error, importItem);
      return true; // Include if there's an error
    }
  }) : [];

  // Debug logging
  useEffect(() => {
    // console.log('=== ImportReportTable Debug ===');
    // console.log('dateRange:', dateRange);
    // console.log('importsResponse:', importsResponse);
    // console.log('imports array:', imports);
    // console.log('imports length:', imports.length);
    // console.log('filteredImports:', filteredImports);
    // console.log('filteredImports length:', filteredImports.length);
    if (imports.length > 0) {
      // console.log('First import (before filter):', imports[0]);
      // console.log('First import date:', imports[0]?.imp_date);
    }
    if (filteredImports.length > 0) {
      // console.log('First filtered import:', filteredImports[0]);
      // console.log('First import details:', filteredImports[0]?.import_details || filteredImports[0]?.importDetails);
    }
    // console.log('==============================');
  }, [importsResponse, filteredImports, dateRange]);

  // Get individual product rows for an import (one row per product)
  const getProductRows = (importItem) => {
    const details = importItem.import_details || importItem.importDetails || [];
    
    // Helper function to get valid staff name
    const getStaffName = () => {
      const staffName = importItem.staff_name || importItem.staff?.full_name || importItem.full_name || `Staff ${importItem.staff_id}`;
      // Filter out invalid staff names like "Import from"
      if (staffName === 'Import from' || !staffName || staffName.trim() === '') {
        return 'Unknown Staff';
      }
      return staffName;
    };
    
    // If no details, create a general entry
    if (details.length === 0) {
      return [{
        id: `${importItem.id}-0`,
        importId: importItem.id,
        date: importItem.imp_date,
        staff: getStaffName(),
        supplier: importItem.supplier_name || importItem.supplier?.supplier || importItem.supplier || 'N/A',
        productName: 'General Import',
        qty: 1,
        amount: importItem.total_amount || importItem.total || 0,
        batchNumber: 'N/A',
        expirationDate: 'N/A',
        status: importItem.status || 'Completed'
      }];
    }
    
    return details.map((detail, index) => {
      return {
        id: `${importItem.id}-${index}`,
        importId: importItem.id,
        date: importItem.imp_date,
        staff: getStaffName(),
        supplier: importItem.supplier_name || importItem.supplier?.supplier || importItem.supplier || 'N/A',
        productName: detail.pro_name || detail.product?.pro_name || detail.product_name || 'Unknown Product',
        qty: detail.qty || detail.quantity || 0,
        amount: detail.amount || detail.price || detail.total || 0,
        batchNumber: detail.batch_number || detail.batchNumber || detail.batch || 'N/A',
        expirationDate: detail.expiration_date || detail.expirationDate || detail.expiry || 'N/A',
        status: importItem.status || 'Completed'
      };
    });
  };

  // Flatten all product rows with pagination
  const allProductRows = filteredImports.flatMap(importItem => getProductRows(importItem));
  const displayedRows = allProductRows.slice(0, displayLimit);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="text-center">
          <Package className="w-5 h-5 animate-spin mx-auto mb-1 text-blue-600" />
          <p className="text-gray-600 text-xs">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    console.error('ImportReportTable Error:', error);
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        <p className="font-semibold">Error loading imports: {error.message}</p>
        <p className="text-sm mt-2">Please check the browser console for more details.</p>
        <button 
          onClick={() => refetch()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Import Transactions Report</h3>
              <p className="text-sm text-gray-600">
                Generated on: {formatDate(new Date())} | Total Imports: {filteredImports.length} | 
                Total Value: {formatCurrency(allProductRows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0))}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 px-3 py-1 bg-white text-gray-700 rounded-lg text-sm hover:bg-gray-100 border border-gray-200 transition-colors"
            title="Refresh data"
          >
            <Package className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedRows.length > 0 ? (
              displayedRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{row.importId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(row.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.staff}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.supplier}</td>
                  <td className="px-6 py-4 text-sm text-gray-600" title={row.productName}>
                    {row.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.qty}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(row.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.batchNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.expirationDate !== 'N/A' && row.expirationDate ? (
                      (() => {
                        try {
                          // Handle different date formats
                          const expDate = row.expirationDate;
                          if (typeof expDate === 'string' && expDate.includes('-')) {
                            // Parse ISO date string
                            return formatDate(expDate, 'MMM dd, yyyy');
                          } else if (typeof expDate === 'string') {
                            // Try to parse other formats
                            return formatDate(new Date(expDate), 'MMM dd, yyyy');
                          }
                          return formatDate(expDate, 'MMM dd, yyyy');
                        } catch (e) {
                          console.warn('Error formatting expiration date:', expDate, e);
                          return expDate;
                        }
                      })()
                    ) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Package className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Import Data</h3>
                    <p className="text-gray-500">
                      No imports found for the selected date range ({formatDate(dateRange.from)} to {formatDate(dateRange.to)})
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Load More Button */}
      {displayedRows.length < allProductRows.length && (
        <div className="px-6 py-4 text-center border-t border-gray-200">
          <button
            onClick={() => setDisplayLimit(prev => prev + 50)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ផ្ទុកបន្ថែម ({allProductRows.length - displayedRows.length} ទៀត)
          </button>
        </div>
      )}

      {/* Summary Footer */}
      {/* {allProductRows.length > 0 && (
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
                {filteredImports.length}
              </span>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ImportReportTable;
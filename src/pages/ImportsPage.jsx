import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Package, Download, RefreshCw, Calendar, ChevronDown, ChevronUp, MoreVertical, Eye, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useImports, useDeleteImport, useUpdateImport } from '../hooks/useImports';
import { useStaffs } from '../hooks/useStaffs';
import { useSuppliers } from '../hooks/useSuppliers';
import { useAdvancedFilters } from '../hooks/useAdvancedFilters';
import { useBatchOperations } from '../hooks/useBatchOperations';
import { useExportData } from '../hooks/useExportData';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';
import LoadingSpinner from '../components/LoadingSpinner';
import ImportModal from '../components/ImportModal';
import StatusBadge from '../components/StatusBadge';
import AdvancedFilters from '../components/AdvancedFilters';
import BatchActionBar from '../components/BatchActionBar';
import ExportModal from '../components/ExportModal';
import ConnectionStatus from '../components/ConnectionStatus';
import { formatDate, formatCurrency } from '../utils/helper';
import { toast } from 'react-hot-toast';

const ImportsPage = () => {
  const { hasPermission, user } = useAuth();
  const [selectedImport, setSelectedImport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [openDropdowns, setOpenDropdowns] = useState(new Set());
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refs for dropdowns
  const dropdownRefs = useRef({});
  
  // Hooks
  const { data: importsResponse, isLoading, error, refetch } = useImports();
  const { data: staffsResponse } = useStaffs();
  const { data: suppliersResponse } = useSuppliers();
  const deleteImport = useDeleteImport();
  const updateImport = useUpdateImport();
  
  // Enhanced hooks
  const {
    filters,
    updateFilter,
    clearFilters,
    applyFilters,
    hasActiveFilters,
    isFiltersOpen,
    setIsFiltersOpen
  } = useAdvancedFilters();
  
  const {
    selectedItems,
    selectItem,
    selectAll,
    deselectAll,
    isSelected,
    isAllSelected,
    batchDelete,
    batchExport,
    batchUpdateStatus,
    isProcessing,
    selectedCount
  } = useBatchOperations();
  
  const {
    exportToExcel,
    exportToCSV,
    exportToPDF,
    getAvailableColumns,
    isExporting,
    exportProgress
  } = useExportData();
  
  const {
    connectionStatus,
    newUpdatesCount,
    lastUpdateTime,
    autoRefreshEnabled,
    manualRefresh,
    toggleAutoRefresh,
    clearNewUpdates,
    getLastUpdateText
  } = useRealTimeUpdates(refetch);

  // Handle different API response formats
  const imports = importsResponse?.data?.data || importsResponse?.data || importsResponse || [];
  const staffs = staffsResponse?.data?.data || staffsResponse?.data || staffsResponse || [];
  const suppliers = suppliersResponse?.data?.data || suppliersResponse?.data || suppliersResponse || [];
  
  // Calculate summary statistics
  const totalImports = imports.length;
  const totalAmount = imports.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
  const totalItems = imports.reduce((sum, item) => {
    const details = item.import_details || item.importDetails || [];
    return sum + details.reduce((detailSum, detail) => detailSum + parseInt(detail.qty || 0), 0);
  }, 0);
  const thisMonthImports = imports.filter(item => {
    const importDate = new Date(item.imp_date);
    const now = new Date();
    return importDate.getMonth() === now.getMonth() && importDate.getFullYear() === now.getFullYear();
  }).length;

  const handleCreate = () => {
    setSelectedImport(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleView = (importItem) => {
    setSelectedImport(importItem);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEdit = (importItem) => {
    setSelectedImport(importItem);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (importItem) => {
    if (window.confirm(`Are you sure you want to delete import "#${importItem.id}"?`)) {
      try {
        await deleteImport.mutateAsync(importItem.id);
        await refetch();
      } catch (error) {
        console.error('Delete failed:', error);
        alert(error.response?.data?.message || 'Failed to delete import');
      }
    }
  };

  // Add this function to handle successful import creation
  const handleImportSaved = async () => {
    setModalOpen(false);
    await refetch(); // Force refresh the data
  };

  const toggleRowExpansion = (importId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(importId)) {
      newExpanded.delete(importId);
    } else {
      newExpanded.add(importId);
    }
    setExpandedRows(newExpanded);
  };

  const toggleDropdown = (importId) => {
    const newDropdowns = new Set(openDropdowns);
    if (newDropdowns.has(importId)) {
      newDropdowns.delete(importId);
    } else {
      newDropdowns.clear();
      newDropdowns.add(importId);
    }
    setOpenDropdowns(newDropdowns);
  };

  const getImportStatus = (importItem) => {
    const details = importItem.import_details || importItem.importDetails || [];
    if (details.length === 0) return 'draft';
    
    // Check for expired items
    const hasExpired = details.some(detail => {
      if (detail.expiration_date) {
        return new Date(detail.expiration_date) < new Date();
      }
      return false;
    });
    
    if (hasExpired) return 'expired';
    return 'completed';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any dropdown
      let isOutside = true;
      Object.values(dropdownRefs.current).forEach(ref => {
        if (ref && (ref === event.target || ref.contains(event.target))) {
          isOutside = false;
        }
      });
      
      if (isOutside) {
        setOpenDropdowns(new Set());
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Refresh data
  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh failed:', error);
      window.location.reload();
    }
  };

  // Update all imports
  const handleUpdateAll = async () => {
    if (window.confirm('Are you sure you want to update all imports? This will refresh all import data.')) {
      try {
        await refetch();
      } catch (error) {
        console.error('Update all failed:', error);
        window.location.reload();
      }
    }
  };

  if (isLoading) return <LoadingSpinner className="h-64" />;
  if (error) return <div className="text-red-600">Error loading imports: {error.message}</div>;

  const canCreate = hasPermission(['create', 'create_import']);
  const canUpdate = hasPermission(['update', 'update_import']);  
  const canDelete = hasPermission(['delete', 'manage_users']);

  const filteredImports = Array.isArray(imports) ? imports.filter(importItem => {
    const searchLower = searchTerm.toLowerCase();
    const details = importItem.import_details || importItem.importDetails || [];
    const productNames = details.map(detail => detail.pro_name).filter(name => name);
    
    return importItem.full_name?.toLowerCase().includes(searchLower) ||
           (importItem.supplier?.supplier || importItem.supplier || '')?.toLowerCase().includes(searchLower) ||
           importItem.staff?.full_name?.toLowerCase().includes(searchLower) ||
           productNames.some(name => name.toLowerCase().includes(searchLower));
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Imports</h1>
          <p className="text-gray-600">Manage inventory imports and stock receipts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleRefresh}
            className="btn-secondary flex items-center"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          {canUpdate && (
            <button 
              onClick={handleUpdateAll}
              className="btn-success flex items-center"
              title="Update All Imports"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Update All
            </button>
          )}
          <button 
            onClick={() => exportToExcel(imports)}
            className="btn-secondary flex items-center"
            title="Export to Excel"
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </button>
          {canCreate && (
            <button onClick={handleCreate} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Import
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Imports</p>
              <p className="text-2xl font-bold text-gray-900">{totalImports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{thisMonthImports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 text-purple-600 flex items-center justify-center">
                <span className="text-lg font-bold">$</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 text-orange-600 flex items-center justify-center">
                <span className="text-lg font-bold">#</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search imports by product name, supplier, or staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Imports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table min-w-full">
            <thead className="table-header bg-gray-100">
              <tr>
                <th className="table-head w-12 text-center">▼</th>
                <th className="table-head font-semibold">ID</th>
                <th className="table-head font-semibold">Date</th>
                <th className="table-head font-semibold">Staff</th>
                <th className="table-head font-semibold">Supplier</th>
                <th className="table-head font-semibold">Summary</th>
                <th className="table-head font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredImports.map((importItem) => {
                const details = importItem.import_details || importItem.importDetails || [];
                const totalQty = details.reduce((sum, detail) => sum + parseInt(detail.qty || 0), 0);
                const isExpanded = expandedRows.has(importItem.id);
                const isDropdownOpen = openDropdowns.has(importItem.id);
                
                return (
                  <tr key={importItem.id} className="table-row hover:bg-gray-50">
                    {/* Expand/Collapse Button */}
                    <td className="table-cell w-16">
                      <button
                        onClick={() => toggleRowExpansion(importItem.id)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        title={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                      </button>
                    </td>
                    
                    {/* ID */}
                    <td className="table-cell">
                      <span className="font-bold text-blue-600 text-lg">#{importItem.id}</span>
                    </td>
                    
                    {/* Date */}
                    <td className="table-cell">
                      <span className="text-gray-600">{formatDate(importItem.imp_date)}</span>
                    </td>
                    
                    {/* Staff */}
                    <td className="table-cell">
                      <span className="text-gray-600">
                        {importItem.staff?.full_name || `Staff ${importItem.staff_id}`}
                      </span>
                    </td>
                    
                    {/* Supplier */}
                    <td className="table-cell">
                      <span className="text-gray-600">
                        {importItem.supplier?.supplier || importItem.supplier || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Summary */}
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">{totalQty}</span> items
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(importItem.total)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {details.length} product{details.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="table-cell relative">
                      <div className="relative">
                        <button
                          ref={el => {
                            if (el) {
                              dropdownRefs.current[importItem.id] = el;
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(importItem.id);
                          }}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                          title="Actions"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {isDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(importItem);
                                toggleDropdown(importItem.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <span className="flex items-center">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(importItem);
                                toggleDropdown(importItem.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <span className="flex items-center">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Import
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(importItem);
                                toggleDropdown(importItem.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <span className="flex items-center">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Import
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredImports.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No imports found</h3>
            <p className="text-gray-500 mb-2">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first import'}
            </p>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {modalOpen && (
        <ImportModal
          importItem={selectedImport}
          mode={modalMode}
          onClose={() => {
            setModalOpen(false);
            refetch(); // Refresh data when modal is closed
          }}
          onSaved={handleImportSaved} // Add this prop
        />
      )}
    </div>
  );
};

export default ImportsPage;
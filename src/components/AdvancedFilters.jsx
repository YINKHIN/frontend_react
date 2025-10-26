import { useState } from 'react';
import { Filter, X, Calendar, DollarSign, Users, Building2, Package, RotateCcw } from 'lucide-react';

const AdvancedFilters = ({ 
  filters, 
  updateFilter, 
  clearFilters, 
  hasActiveFilters,
  staffs = [], 
  suppliers = [],
  isOpen,
  onToggle 
}) => {
  const [localAmountRange, setLocalAmountRange] = useState({
    min: filters.amountRange.min,
    max: filters.amountRange.max
  });

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'text-gray-600' },
    { value: 'completed', label: 'Completed', color: 'text-green-600' },
    { value: 'expired', label: 'Expired', color: 'text-red-600' },
    { value: 'partial', label: 'Partial', color: 'text-yellow-600' }
  ];

  const datePresets = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last 30 Days', value: '30days' },
    { label: 'Custom', value: 'custom' }
  ];

  const applyDatePreset = (preset) => {
    const now = new Date();
    let start = null;
    let end = null;

    switch (preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        start = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
        end = new Date();
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
        break;
      case '30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = new Date();
        break;
      default:
        return;
    }

    updateFilter('dateRange', {
      start: start?.toISOString().split('T')[0],
      end: end?.toISOString().split('T')[0]
    });
  };

  const handleStaffChange = (staffId) => {
    const currentStaffs = filters.staffIds || [];
    const newStaffs = currentStaffs.includes(staffId)
      ? currentStaffs.filter(id => id !== staffId)
      : [...currentStaffs, staffId];
    updateFilter('staffIds', newStaffs);
  };

  const handleSupplierChange = (supplierId) => {
    const currentSuppliers = filters.supplierIds || [];
    const newSuppliers = currentSuppliers.includes(supplierId)
      ? currentSuppliers.filter(id => id !== supplierId)
      : [...currentSuppliers, supplierId];
    updateFilter('supplierIds', newSuppliers);
  };

  const handleStatusChange = (status) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    updateFilter('status', newStatuses);
  };

  const handleAmountRangeChange = (field, value) => {
    const newRange = { ...localAmountRange, [field]: parseFloat(value) || 0 };
    setLocalAmountRange(newRange);
    updateFilter('amountRange', newRange);
  };

  if (!isOpen) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors
            ${hasActiveFilters 
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
              Active
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center px-2 py-2 text-sm text-gray-500 hover:text-gray-700"
            title="Clear all filters"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Advanced Filters
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear All
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date Range
          </label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {datePresets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => applyDatePreset(preset.value)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateRange.start || ''}
                onChange={(e) => updateFilter('dateRange', { 
                  ...filters.dateRange, 
                  start: e.target.value 
                })}
                className="input text-sm"
                placeholder="Start date"
              />
              <input
                type="date"
                value={filters.dateRange.end || ''}
                onChange={(e) => updateFilter('dateRange', { 
                  ...filters.dateRange, 
                  end: e.target.value 
                })}
                className="input text-sm"
                placeholder="End date"
              />
            </div>
          </div>
        </div>

        {/* Staff Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Staff Members
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
            {staffs.map(staff => (
              <label key={staff.id} className="flex items-center py-1">
                <input
                  type="checkbox"
                  checked={filters.staffIds.includes(staff.id)}
                  onChange={() => handleStaffChange(staff.id)}
                  className="mr-2 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{staff.full_name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Supplier Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-1" />
            Suppliers
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
            {suppliers.map(supplier => (
              <label key={supplier.id} className="flex items-center py-1">
                <input
                  type="checkbox"
                  checked={filters.supplierIds.includes(supplier.id)}
                  onChange={() => handleSupplierChange(supplier.id)}
                  className="mr-2 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{supplier.supplier}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amount Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Amount Range
          </label>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={localAmountRange.min}
                onChange={(e) => handleAmountRangeChange('min', e.target.value)}
                className="input text-sm"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                placeholder="Max"
                value={localAmountRange.max}
                onChange={(e) => handleAmountRangeChange('max', e.target.value)}
                className="input text-sm"
                min="0"
                step="0.01"
              />
            </div>
            <div className="text-xs text-gray-500">
              ${localAmountRange.min} - ${localAmountRange.max}
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-1" />
            Status
          </label>
          <div className="space-y-1">
            {statusOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.status.includes(option.value)}
                  onChange={() => handleStatusChange(option.value)}
                  className="mr-2 rounded border-gray-300"
                />
                <span className={`text-sm ${option.color}`}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Filters
          </label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Batch Number"
              value={filters.batchNumber}
              onChange={(e) => updateFilter('batchNumber', e.target.value)}
              className="input text-sm w-full"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.expirationDate.start || ''}
                onChange={(e) => updateFilter('expirationDate', { 
                  ...filters.expirationDate, 
                  start: e.target.value 
                })}
                className="input text-sm"
                placeholder="Exp. start"
              />
              <input
                type="date"
                value={filters.expirationDate.end || ''}
                onChange={(e) => updateFilter('expirationDate', { 
                  ...filters.expirationDate, 
                  end: e.target.value 
                })}
                className="input text-sm"
                placeholder="Exp. end"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
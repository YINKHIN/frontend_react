import { useState, useCallback, useMemo } from 'react';

export const useAdvancedFilters = () => {
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    staffIds: [],
    supplierIds: [],
    amountRange: { min: 0, max: 100000 },
    status: [],
    batchNumber: '',
    expirationDate: { start: null, end: null },
    searchTerm: ''
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dateRange: { start: null, end: null },
      staffIds: [],
      supplierIds: [],
      amountRange: { min: 0, max: 100000 },
      status: [],
      batchNumber: '',
      expirationDate: { start: null, end: null },
      searchTerm: ''
    });
  }, []);

  const applyFilters = useCallback((imports) => {
    if (!Array.isArray(imports)) return [];

    return imports.filter(importItem => {
      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const importDate = new Date(importItem.imp_date);
        if (filters.dateRange.start && importDate < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && importDate > new Date(filters.dateRange.end)) return false;
      }

      // Staff filter
      if (filters.staffIds.length > 0) {
        if (!filters.staffIds.includes(importItem.staff_id)) return false;
      }

      // Supplier filter
      if (filters.supplierIds.length > 0) {
        if (!filters.supplierIds.includes(importItem.sup_id)) return false;
      }

      // Amount range filter
      const total = parseFloat(importItem.total || 0);
      if (total < filters.amountRange.min || total > filters.amountRange.max) return false;

      // Status filter
      if (filters.status.length > 0) {
        const details = importItem.import_details || importItem.importDetails || [];
        let status = 'draft';
        if (details.length > 0) {
          status = 'completed';
          // Check for expired items
          const hasExpired = details.some(detail => {
            if (detail.expiration_date) {
              return new Date(detail.expiration_date) < new Date();
            }
            return false;
          });
          if (hasExpired) status = 'expired';
        }
        if (!filters.status.includes(status)) return false;
      }

      // Batch number filter
      if (filters.batchNumber) {
        const details = importItem.import_details || importItem.importDetails || [];
        const hasBatch = details.some(detail => 
          detail.batch_number && 
          detail.batch_number.toLowerCase().includes(filters.batchNumber.toLowerCase())
        );
        if (!hasBatch) return false;
      }

      // Expiration date filter
      if (filters.expirationDate.start || filters.expirationDate.end) {
        const details = importItem.import_details || importItem.importDetails || [];
        const hasMatchingExpiration = details.some(detail => {
          if (!detail.expiration_date) return false;
          const expDate = new Date(detail.expiration_date);
          if (filters.expirationDate.start && expDate < new Date(filters.expirationDate.start)) return false;
          if (filters.expirationDate.end && expDate > new Date(filters.expirationDate.end)) return false;
          return true;
        });
        if (!hasMatchingExpiration) return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const details = importItem.import_details || importItem.importDetails || [];
        const productNames = details.map(detail => detail.pro_name).filter(name => name);
        
        const matches = 
          importItem.full_name?.toLowerCase().includes(searchLower) ||
          (importItem.supplier?.supplier || importItem.supplier || '')?.toLowerCase().includes(searchLower) ||
          importItem.staff?.full_name?.toLowerCase().includes(searchLower) ||
          productNames.some(name => name.toLowerCase().includes(searchLower));
        
        if (!matches) return false;
      }

      return true;
    });
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateRange.start || filters.dateRange.end ||
      filters.staffIds.length > 0 ||
      filters.supplierIds.length > 0 ||
      filters.amountRange.min > 0 || filters.amountRange.max < 100000 ||
      filters.status.length > 0 ||
      filters.batchNumber ||
      filters.expirationDate.start || filters.expirationDate.end ||
      filters.searchTerm
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    applyFilters,
    hasActiveFilters,
    isFiltersOpen,
    setIsFiltersOpen
  };
};

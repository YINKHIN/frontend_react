import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export const useBatchOperations = () => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const selectItem = useCallback((id) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((items) => {
    const allIds = items.map(item => item.id);
    setSelectedItems(new Set(allIds));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const isSelected = useCallback((id) => {
    return selectedItems.has(id);
  }, [selectedItems]);

  const isAllSelected = useCallback((items) => {
    if (items.length === 0) return false;
    return items.every(item => selectedItems.has(item.id));
  }, [selectedItems]);

  const batchDelete = useCallback(async (deleteFunction, items) => {
    if (selectedItems.size === 0) {
      toast.error('No items selected');
      return false;
    }

    const selectedImports = items.filter(item => selectedItems.has(item.id));
    const confirmMessage = `Are you sure you want to delete ${selectedItems.size} import${selectedItems.size > 1 ? 's' : ''}?`;
    
    if (!window.confirm(confirmMessage)) {
      return false;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const importItem of selectedImports) {
        try {
          await deleteFunction.mutateAsync(importItem.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to delete import ${importItem.id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} import${successCount > 1 ? 's' : ''}`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} import${errorCount > 1 ? 's' : ''}`);
      }

      setSelectedItems(new Set());
      return successCount > 0;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems]);

  const batchExport = useCallback((items, exportFunction) => {
    if (selectedItems.size === 0) {
      toast.error('No items selected');
      return;
    }

    const selectedImports = items.filter(item => selectedItems.has(item.id));
    exportFunction(selectedImports);
    toast.success(`Exporting ${selectedItems.size} import${selectedItems.size > 1 ? 's' : ''}`);
  }, [selectedItems]);

  const batchUpdateStatus = useCallback(async (items, newStatus, updateFunction) => {
    if (selectedItems.size === 0) {
      toast.error('No items selected');
      return false;
    }

    const selectedImports = items.filter(item => selectedItems.has(item.id));
    const confirmMessage = `Are you sure you want to update status for ${selectedItems.size} import${selectedItems.size > 1 ? 's' : ''}?`;
    
    if (!window.confirm(confirmMessage)) {
      return false;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const importItem of selectedImports) {
        try {
          await updateFunction.mutateAsync({ 
            id: importItem.id, 
            data: { ...importItem, status: newStatus } 
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to update import ${importItem.id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} import${successCount > 1 ? 's' : ''}`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to update ${errorCount} import${errorCount > 1 ? 's' : ''}`);
      }

      setSelectedItems(new Set());
      return successCount > 0;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems]);

  return {
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
    selectedCount: selectedItems.size
  };
};

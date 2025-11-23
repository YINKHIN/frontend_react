import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate, formatCurrency } from '../utils/helper';

export const useExportData = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportToExcel = useCallback(async (imports, options = {}) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const { 
        includeDetails = true, 
        selectedColumns = null,
        filename = `imports_${new Date().toISOString().split('T')[0]}.xlsx`
      } = options;

      // Main imports data
      const mainData = imports.map((importItem, index) => {
        setExportProgress((index / imports.length) * 50);
        
        const baseData = {
          ID: importItem.id,
          Date: formatDate(importItem.imp_date),
          Staff: importItem.staff?.full_name || `Staff ${importItem.staff_id}`,
          Supplier: importItem.supplier?.supplier || importItem.supplier || 'N/A',
          'Total Amount': parseFloat(importItem.total || 0).toFixed(2),
          'Total Qty': importItem.total_quantity || 0,
          'Products Count': importItem.products_count || 0,
          Status: getImportStatus(importItem)
        };

        // Filter columns if specified
        if (selectedColumns && Array.isArray(selectedColumns)) {
          const filteredData = {};
          selectedColumns.forEach(col => {
            if (baseData[col] !== undefined) {
              filteredData[col] = baseData[col];
            }
          });
          return filteredData;
        }

        return baseData;
      });

      const workbook = XLSX.utils.book_new();
      
      // Add main sheet
      const mainSheet = XLSX.utils.json_to_sheet(mainData);
      XLSX.utils.book_append_sheet(workbook, mainSheet, 'Imports Summary');

      // Add details sheet if requested
      if (includeDetails) {
        const detailsData = [];
        imports.forEach((importItem, importIndex) => {
          setExportProgress(50 + (importIndex / imports.length) * 50);
          
          const details = importItem.import_details || importItem.importDetails || [];
          details.forEach(detail => {
            detailsData.push({
              'Import ID': importItem.id,
              'Import Date': formatDate(importItem.imp_date),
              'Product Name': detail.pro_name,
              'Quantity': detail.qty,
              'Unit Price': parseFloat(detail.price || 0).toFixed(2),
              'Amount': parseFloat(detail.amount || 0).toFixed(2),
              'Batch Number': detail.batch_number || 'N/A',
              'Expiration Date': detail.expiration_date ? 
                new Date(detail.expiration_date).toLocaleDateString() : 'N/A'
            });
          });
        });

        if (detailsData.length > 0) {
          const detailsSheet = XLSX.utils.json_to_sheet(detailsData);
          XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Import Details');
        }
      }

      XLSX.writeFile(workbook, filename);
      setExportProgress(100);
      return true;
    } catch (error) {
      console.error('Excel export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, []);

  const exportToCSV = useCallback(async (imports, options = {}) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const { 
        selectedColumns = null,
        filename = `imports_${new Date().toISOString().split('T')[0]}.csv`
      } = options;

      const csvData = imports.map((importItem, index) => {
        setExportProgress((index / imports.length) * 100);
        
        const baseData = {
          ID: importItem.id,
          Date: formatDate(importItem.imp_date),
          Staff: importItem.staff?.full_name || `Staff ${importItem.staff_id}`,
          Supplier: importItem.supplier?.supplier || importItem.supplier || 'N/A',
          'Total Amount': parseFloat(importItem.total || 0).toFixed(2),
          'Total Qty': importItem.total_quantity || 0,
          'Products Count': importItem.products_count || 0,
          Status: getImportStatus(importItem)
        };

        if (selectedColumns && Array.isArray(selectedColumns)) {
          const filteredData = {};
          selectedColumns.forEach(col => {
            if (baseData[col] !== undefined) {
              filteredData[col] = baseData[col];
            }
          });
          return filteredData;
        }

        return baseData;
      });

      const worksheet = XLSX.utils.json_to_sheet(csvData);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportProgress(100);
      return true;
    } catch (error) {
      console.error('CSV export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, []);

  const exportToPDF = useCallback(async (imports, options = {}) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const { 
        filename = `imports_${new Date().toISOString().split('T')[0]}.pdf`,
        includeDetails = false
      } = options;

      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Imports Report', 14, 22);
      
      // Date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
      
      // Summary statistics
      const totalImports = imports.length;
      const totalAmount = imports.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
      
      doc.text(`Total Imports: ${totalImports}`, 14, 42);
      doc.text(`Total Value: ${formatCurrency(totalAmount)}`, 14, 52);

      // Main table
      const tableData = imports.map((importItem, index) => {
        setExportProgress((index / imports.length) * (includeDetails ? 50 : 100));
        
        return [
          importItem.id,
          formatDate(importItem.imp_date),
          importItem.staff?.full_name || `Staff ${importItem.staff_id}`,
          importItem.supplier?.supplier || importItem.supplier || 'N/A',
          formatCurrency(importItem.total),
          getImportStatus(importItem)
        ];
      });

      doc.autoTable({
        head: [['ID', 'Date', 'Staff', 'Supplier', 'Total', 'Status']],
        body: tableData,
        startY: 62,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });

      // Details section if requested
      if (includeDetails) {
        let currentY = doc.lastAutoTable.finalY + 20;
        
        imports.forEach((importItem, importIndex) => {
          setExportProgress(50 + (importIndex / imports.length) * 50);
          
          const details = importItem.import_details || importItem.importDetails || [];
          if (details.length > 0) {
            // Check if we need a new page
            if (currentY > 250) {
              doc.addPage();
              currentY = 20;
            }

            doc.setFontSize(14);
            doc.text(`Import #${importItem.id} Details`, 14, currentY);
            currentY += 10;

            const detailsData = details.map(detail => [
              detail.pro_name,
              detail.qty,
              formatCurrency(detail.price),
              formatCurrency(detail.amount),
              detail.batch_number || 'N/A'
            ]);

            doc.autoTable({
              head: [['Product', 'Qty', 'Price', 'Amount', 'Batch']],
              body: detailsData,
              startY: currentY,
              styles: { fontSize: 7 },
              headStyles: { fillColor: [92, 184, 92] }
            });

            currentY = doc.lastAutoTable.finalY + 15;
          }
        });
      }

      doc.save(filename);
      setExportProgress(100);
      return true;
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, []);

  const getAvailableColumns = useCallback(() => {
    return [
      'ID',
      'Date', 
      'Staff',
      'Supplier',
      'Total Amount',
      'Total Qty',
      'Products Count',
      'Status'
    ];
  }, []);

  return {
    exportToExcel,
    exportToCSV,
    exportToPDF,
    getAvailableColumns,
    isExporting,
    exportProgress
  };
};

// Helper function to determine import status
const getImportStatus = (importItem) => {
  const details = importItem.import_details || importItem.importDetails || [];
  if (details.length === 0) return 'Draft';
  
  // Check for expired items
  const hasExpired = details.some(detail => {
    if (detail.expiration_date) {
      return new Date(detail.expiration_date) < new Date();
    }
    return false;
  });
  
  if (hasExpired) return 'Expired';
  return 'Completed';
};

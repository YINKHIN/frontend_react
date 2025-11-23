import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { formatDate, formatCurrency } from '../utils/helper'

export const exportService = {
  // Export to Excel
  exportToExcel: (data, filename, type) => {
    try {
      console.log('Excel Export - Input data:', data);
      console.log('Excel Export - Type:', type);
      console.log('Excel Export - Filename:', filename);
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data provided for export');
      }
      
      let worksheetData = []
      
      if (type === 'import') {
        // Process import data for Excel - Match UI table structure exactly
        worksheetData = [
          ['ID', 'Date', 'Staff', 'Supplier', 'Product Name', 'Qty', 'Amount', 'Batch Number', 'Expiration Date', 'Status']
        ]
        
        // Handle both flat data and nested data structures
        if (Array.isArray(data) && data.length > 0) {
          // Check if data is already flattened (from UI processing)
          if (data[0].importId || data[0].id) {
            data.forEach(row => {
              worksheetData.push([
                `#${row.importId || row.id}`,
                formatDate(row.date || row.imp_date),
                row.staff || row.staff_name || 'Unknown Staff',
                row.supplier || row.supplier_name || 'Unknown Supplier',
                row.productName || row.pro_name || 'Unknown Product',
                row.qty || 0,
                formatCurrency(row.amount || 0),
                row.batchNumber || row.batch_number || 'N/A',
                row.expirationDate && row.expirationDate !== 'N/A' ? formatDate(row.expirationDate) : 'N/A',
                row.status || 'Completed'
              ])
            })
          } else {
            // Handle nested structure
            data.forEach(importItem => {
              if (importItem.import_details && importItem.import_details.length > 0) {
                importItem.import_details.forEach(detail => {
                  worksheetData.push([
                    `#${importItem.id}`,
                    formatDate(importItem.imp_date),
                    importItem.staff_name || importItem.staff?.full_name || 'Unknown Staff',
                    importItem.supplier_name || importItem.supplier?.supplier || 'Unknown Supplier',
                    detail.pro_name || detail.product?.pro_name || 'Unknown Product',
                    detail.qty || 0,
                    formatCurrency(detail.amount || detail.price || 0),
                    detail.batch_number || 'N/A',
                    detail.expiration_date && detail.expiration_date !== 'N/A' ? formatDate(detail.expiration_date) : 'N/A',
                    importItem.status || 'Completed'
                  ])
                })
              } else {
                worksheetData.push([
                  `#${importItem.id}`,
                  formatDate(importItem.imp_date),
                  importItem.staff_name || importItem.staff?.full_name || 'Unknown Staff',
                  importItem.supplier_name || importItem.supplier?.supplier || 'Unknown Supplier',
                  'General Import',
                  importItem.qty || 0,
                  formatCurrency(importItem.amount || importItem.total_amount || 0),
                  importItem.batch_number || 'N/A',
                  importItem.expiration_date && importItem.expiration_date !== 'N/A' ? formatDate(importItem.expiration_date) : 'N/A',
                  importItem.status || 'Completed'
                ])
              }
            })
          }
        }
      } else if (type === 'sales') {
        // Process sales data for Excel - Match UI table structure exactly
        worksheetData = [
          ['Order ID', 'Date', 'Customer', 'Staff', 'Product Name', 'Qty', 'Total Amount', 'Payment Status', 'Status']
        ]
        
        // Handle both flat data and nested data structures
        if (Array.isArray(data) && data.length > 0) {
          // Check if data is already flattened (from UI processing)
          if (data[0].order_id || (data[0].id && data[0].cus_name)) {
            data.forEach(row => {
              worksheetData.push([
                `#${row.order_id || row.id}`,
                formatDate(row.order_date || row.ord_date || row.date),
                row.customer_name || row.cus_name || row.customer?.name || 'Unknown Customer',
                row.staff_name || row.staff?.name || row.full_name || 'Unknown Staff',
                row.product_name || row.pro_name || row.product?.name || 'Unknown Product',
                row.qty || 0,
                formatCurrency(row.amount || row.total || row.total_amount || 0),
                row.payment_status || 'Unpaid',
                row.status || 'Completed'
              ])
            })
          } else {
            // Handle nested structure
            data.forEach(order => {
              if (order.order_details && order.order_details.length > 0) {
                order.order_details.forEach(detail => {
                  worksheetData.push([
                    `#${order.id}`,
                    formatDate(order.ord_date || order.order_date),
                    order.cus_name || order.customer?.name || 'Unknown Customer',
                    order.staff_name || order.staff?.name || order.full_name || 'Unknown Staff',
                    detail.pro_name || detail.product?.name || 'Unknown Product',
                    detail.qty || 0,
                    formatCurrency(detail.amount || 0),
                    order.payment_status || 'Unpaid',
                    order.status || 'Completed'
                  ])
                })
              } else {
                worksheetData.push([
                  `#${order.id}`,
                  formatDate(order.ord_date || order.order_date),
                  order.cus_name || order.customer?.name || 'Unknown Customer',
                  order.staff_name || order.staff?.name || order.full_name || 'Unknown Staff',
                  'General Order',
                  0,
                  formatCurrency(order.total || order.amount || 0),
                  order.payment_status || 'Unpaid',
                  order.status || 'Completed'
                ])
              }
            })
          }
        }
      }

      console.log('Final worksheet data:', worksheetData);
      console.log('Worksheet data length:', worksheetData.length);
      
      if (worksheetData.length <= 1) {
        throw new Error('No data rows to export (only headers)');
      }
      
      // Calculate summary statistics
      let summaryRows = [];
      if (type === 'import') {
        const totalImports = new Set(worksheetData.slice(1).map(row => row[0])).size;
        const totalValue = worksheetData.slice(1).reduce((sum, row) => {
          const amountStr = row[6] || '0';
          const amount = parseFloat(amountStr.toString().replace(/[^0-9.-]/g, '')) || 0;
          return sum + amount;
        }, 0);
        const totalQuantity = worksheetData.slice(1).reduce((sum, row) => sum + (parseInt(row[5]) || 0), 0);
        
        // Add summary at the beginning
        summaryRows = [
          ['Import Report', '', '', '', '', '', '', '', '', ''],
          ['Generated on:', formatDate(new Date()), '', '', '', '', '', '', '', ''],
          ['Total Imports:', totalImports, '', '', '', '', '', '', '', ''],
          ['Total Value:', formatCurrency(totalValue), '', '', '', '', '', '', '', ''],
          ['Total Quantity:', totalQuantity.toLocaleString(), '', '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', '', '', ''], // Empty row
        ];
        
        // Add summary at the end
        const summaryFooter = [
          ['', '', '', '', '', '', '', '', '', ''],
          ['', '', '', '', 'TOTAL QUANTITY:', totalQuantity.toLocaleString(), '', '', '', ''],
          ['', '', '', '', 'TOTAL VALUE:', formatCurrency(totalValue), '', '', '', ''],
          ['', '', '', '', 'TOTAL IMPORTS:', totalImports, '', '', '', ''],
        ];
        
        worksheetData = [...summaryRows, ...worksheetData, ...summaryFooter];
      } else if (type === 'sales') {
        const totalOrders = new Set(worksheetData.slice(1).map(row => row[0])).size;
        const totalSales = worksheetData.slice(1).reduce((sum, row) => {
          const amountStr = row[6] || '0';
          const amount = parseFloat(amountStr.toString().replace(/[^0-9.-]/g, '')) || 0;
          return sum + amount;
        }, 0);
        
        // Add summary at the beginning
        summaryRows = [
          ['Sales Report', '', '', '', '', '', '', '', ''],
          ['Generated on:', formatDate(new Date()), '', '', '', '', '', '', ''],
          ['Total Orders:', totalOrders, '', '', '', '', '', '', ''],
          ['Total Sales:', formatCurrency(totalSales), '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', '', ''], // Empty row
        ];
        
        // Add summary at the end
        const summaryFooter = [
          ['', '', '', '', '', '', '', '', ''],
          ['', '', '', '', 'TOTAL ORDERS:', totalOrders, '', '', ''],
          ['', '', '', '', 'TOTAL SALES:', formatCurrency(totalSales), '', '', ''],
        ];
        
        worksheetData = [...summaryRows, ...worksheetData, ...summaryFooter];
      }
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(worksheetData)
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, type === 'import' ? 'Import Report' : 'Sales Report')
      
      // Save file
      XLSX.writeFile(wb, filename)
      
      console.log('Excel file saved:', filename);
      return { success: true, message: 'Excel file exported successfully!' }
    } catch (error) {
      console.error('Excel export error:', error)
      return { success: false, message: 'Failed to export Excel file: ' + error.message }
    }
  },

  // Export to PDF
  exportToPDF: (data, filename, type) => {
    try {
      console.log('PDF Export - Input data:', data);
      console.log('PDF Export - Type:', type);
      console.log('PDF Export - Filename:', filename);
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data provided for export');
      }
      
      const doc = new jsPDF()
      
      let tableData = []
      let headers = []
      
      if (type === 'import') {
        headers = ['ID', 'Date', 'Staff', 'Supplier', 'Product Name', 'Qty', 'Amount', 'Batch', 'Expiry', 'Status']
        
        // Handle both flat data and nested data structures
        if (Array.isArray(data) && data.length > 0) {
          // Check if data is already flattened (from UI processing)
          if (data[0].importId || data[0].id) {
            data.forEach(row => {
              tableData.push([
                `#${row.importId || row.id}`,
                formatDate(row.date || row.imp_date),
                (row.staff || row.staff_name || 'Unknown').substring(0, 12),
                (row.supplier || row.supplier_name || 'Unknown').substring(0, 12),
                (row.productName || row.pro_name || 'Unknown').substring(0, 15),
                row.qty || 0,
                formatCurrency(row.amount || 0),
                (row.batchNumber || row.batch_number || 'N/A').substring(0, 8),
                row.expirationDate && row.expirationDate !== 'N/A' ? formatDate(row.expirationDate).substring(0, 10) : 'N/A',
                row.status || 'Completed'
              ])
            })
          } else {
            // Handle nested structure
            data.forEach(importItem => {
              if (importItem.import_details && importItem.import_details.length > 0) {
                importItem.import_details.forEach(detail => {
                  tableData.push([
                    `#${importItem.id}`,
                    formatDate(importItem.imp_date),
                    (importItem.staff_name || importItem.staff?.full_name || 'Unknown').substring(0, 12),
                    (importItem.supplier_name || importItem.supplier?.supplier || 'Unknown').substring(0, 12),
                    (detail.pro_name || detail.product?.pro_name || 'Unknown').substring(0, 15),
                    detail.qty || 0,
                    formatCurrency(detail.amount || detail.price || 0),
                    (detail.batch_number || 'N/A').substring(0, 8),
                    detail.expiration_date && detail.expiration_date !== 'N/A' ? formatDate(detail.expiration_date).substring(0, 10) : 'N/A',
                    importItem.status || 'Completed'
                  ])
                })
              } else {
                tableData.push([
                  `#${importItem.id}`,
                  formatDate(importItem.imp_date),
                  (importItem.staff_name || importItem.staff?.full_name || 'Unknown').substring(0, 12),
                  (importItem.supplier_name || importItem.supplier?.supplier || 'Unknown').substring(0, 12),
                  'General Import',
                  importItem.qty || 0,
                  formatCurrency(importItem.amount || importItem.total_amount || 0),
                  (importItem.batch_number || 'N/A').substring(0, 8),
                  importItem.expiration_date && importItem.expiration_date !== 'N/A' ? formatDate(importItem.expiration_date).substring(0, 10) : 'N/A',
                  importItem.status || 'Completed'
                ])
              }
            })
          }
        }
      } else if (type === 'sales') {
        headers = ['ID', 'Date', 'Customer', 'Staff', 'Product Name', 'Qty', 'Amount', 'Payment', 'Status']
        
        // Handle both flat data and nested data structures
        if (Array.isArray(data) && data.length > 0) {
          // Check if data is already flattened (from UI processing)
          if (data[0].order_id || (data[0].id && data[0].cus_name)) {
            data.forEach(row => {
              tableData.push([
                `#${row.order_id || row.id}`,
                formatDate(row.order_date || row.ord_date || row.date),
                (row.customer_name || row.cus_name || row.customer?.name || 'Unknown').substring(0, 12),
                (row.staff_name || row.staff?.name || row.full_name || 'Unknown').substring(0, 12),
                (row.product_name || row.pro_name || row.product?.name || 'Unknown').substring(0, 15),
                row.qty || 0,
                formatCurrency(row.amount || row.total || row.total_amount || 0),
                row.payment_status || 'Unpaid',
                row.status || 'Completed'
              ])
            })
          } else {
            // Handle nested structure
            data.forEach(order => {
              if (order.order_details && order.order_details.length > 0) {
                order.order_details.forEach(detail => {
                  tableData.push([
                    `#${order.id}`,
                    formatDate(order.ord_date || order.order_date),
                    (order.cus_name || order.customer?.name || 'Unknown').substring(0, 12),
                    (order.staff_name || order.staff?.name || order.full_name || 'Unknown').substring(0, 12),
                    (detail.pro_name || detail.product?.name || 'Unknown').substring(0, 15),
                    detail.qty || 0,
                    formatCurrency(detail.amount || 0),
                    order.payment_status || 'Unpaid',
                    order.status || 'Completed'
                  ])
                })
              } else {
                tableData.push([
                  `#${order.id}`,
                  formatDate(order.ord_date || order.order_date),
                  (order.cus_name || order.customer?.name || 'Unknown').substring(0, 12),
                  (order.staff_name || order.staff?.name || order.full_name || 'Unknown').substring(0, 12),
                  'General Order',
                  0,
                  formatCurrency(order.total || order.amount || 0),
                  order.payment_status || 'Unpaid',
                  order.status || 'Completed'
                ])
              }
            })
          }
        }
      }
      
      console.log('Final table data:', tableData);
      console.log('Table data length:', tableData.length);
      
      if (tableData.length === 0) {
        throw new Error('No data rows to export');
      }
      
      // Calculate summary statistics after tableData is populated
      let summaryStats = {};
      if (type === 'import') {
        const totalImports = new Set(tableData.map(row => row[0])).size;
        const totalValue = tableData.reduce((sum, row) => {
          const amountStr = row[6] || '0';
          const amount = parseFloat(amountStr.toString().replace(/[^0-9.-]/g, '')) || 0;
          return sum + amount;
        }, 0);
        const totalQuantity = tableData.reduce((sum, row) => sum + (parseInt(row[5]) || 0), 0);
        summaryStats = { totalImports, totalValue, totalQuantity };
      } else if (type === 'sales') {
        const totalOrders = new Set(tableData.map(row => row[0])).size;
        const totalSales = tableData.reduce((sum, row) => {
          const amountStr = row[6] || '0';
          const amount = parseFloat(amountStr.toString().replace(/[^0-9.-]/g, '')) || 0;
          return sum + amount;
        }, 0);
        summaryStats = { totalOrders, totalSales };
      }
      
      // Add title
      doc.setFontSize(16)
      doc.text(type === 'import' ? 'Import Report' : 'Sales Report', 14, 22)
      
      // Add date and summary statistics
      doc.setFontSize(10)
      let yPos = 32;
      doc.text(`Generated on: ${formatDate(new Date())}`, 14, yPos)
      yPos += 8;
      
      if (type === 'import') {
        doc.text(`Total Imports: ${summaryStats.totalImports}`, 14, yPos);
        yPos += 6;
        doc.text(`Total Value: ${formatCurrency(summaryStats.totalValue)}`, 14, yPos);
        yPos += 6;
        doc.text(`Total Quantity: ${summaryStats.totalQuantity.toLocaleString()}`, 14, yPos);
        yPos += 6;
      } else if (type === 'sales') {
        doc.text(`Total Orders: ${summaryStats.totalOrders}`, 14, yPos);
        yPos += 6;
        doc.text(`Total Sales: ${formatCurrency(summaryStats.totalSales)}`, 14, yPos);
        yPos += 6;
      }
      
      // Add table
      const tableStartY = type === 'import' ? 58 : 50;
      doc.autoTable({
        head: [headers],
        body: tableData,
        startY: tableStartY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        margin: { top: tableStartY - 10 },
        didDrawPage: function (data) {
          // Add summary footer on last page
          if (data.pageCount === data.pageNumber) {
            const finalY = data.cursor.y + 10;
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            
            if (type === 'import') {
              doc.text(`Total Quantity: ${summaryStats.totalQuantity.toLocaleString()}`, 14, finalY);
              doc.text(`Total Value: ${formatCurrency(summaryStats.totalValue)}`, 80, finalY);
              doc.text(`Total Imports: ${summaryStats.totalImports}`, 140, finalY);
            } else if (type === 'sales') {
              doc.text(`Total Orders: ${summaryStats.totalOrders}`, 14, finalY);
              doc.text(`Total Sales: ${formatCurrency(summaryStats.totalSales)}`, 80, finalY);
            }
            
            doc.setFont(undefined, 'normal');
          }
        }
      })
      
      // Save PDF
      doc.save(filename)
      
      console.log('PDF file saved:', filename);
      return { success: true, message: 'PDF file exported successfully!' }
    } catch (error) {
      console.error('PDF export error:', error)
      return { success: false, message: 'Failed to export PDF file: ' + error.message }
    }
  }
}
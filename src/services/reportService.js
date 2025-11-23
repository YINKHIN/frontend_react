import { request } from '../utils/request'
import { config } from '../utils/config'

// Default timeout configuration
const DEFAULT_TIMEOUT = 60000; // 60 seconds
const EXPORT_TIMEOUT = 120000; // 120 seconds for exports

export const reportService = {
  // Get Reports Data with increased timeouts - using fast endpoints
  getImportReport: (params) => request.get('/fast-import-report', params, { timeout: DEFAULT_TIMEOUT }),
  getSalesReport: (params) => request.get('/fast-sales-report', params, { timeout: DEFAULT_TIMEOUT }),
  getImportSummary: (params) => request.get('/reports/import-summary', params, { timeout: DEFAULT_TIMEOUT }),
  getSalesSummary: (params) => request.get('/reports/sales-summary', params, { timeout: DEFAULT_TIMEOUT }),
  
  // Scheduled Reports
  getBestSellingProducts: (params) => request.get('/reports/best-selling-products', params, { timeout: DEFAULT_TIMEOUT }),
  getLowStockProducts: (params) => request.get('/reports/low-stock-products', params, { timeout: DEFAULT_TIMEOUT }),
  getInventorySummary: (params) => request.get('/reports/inventory-summary', params, { timeout: DEFAULT_TIMEOUT }),
  
  // Enhanced export functions with better error handling
  exportImportExcel: (params) => {
    return reportService.buildExportUrl('/reports/export-import-excel', params);
  },
  
  exportSalesExcel: (params) => {
    return reportService.buildExportUrl('/reports/export-sales-excel', params);
  },
  
  exportImportExcelXlsx: (params) => {
    return reportService.buildExportUrl('/reports/export-import-excel-xlsx', params);
  },
  
  exportSalesExcelXlsx: (params) => {
    return reportService.buildExportUrl('/reports/export-sales-excel-xlsx', params);
  },
  
  exportImportPdf: (params) => {
    return reportService.buildExportUrl('/reports/export-import-pdf', params);
  },
  
  exportSalesPdf: (params) => {
    return reportService.buildExportUrl('/reports/export-sales-pdf', params);
  },
  
  exportSingleImportWord: (params) => {
    return reportService.buildExportUrl('/reports/export-single-import-word', params);
  },
  
  exportSingleSalesWord: (params) => {
    return reportService.buildExportUrl('/reports/export-single-sales-word', params);
  },
  
  // URL builder helper
  buildExportUrl: (endpoint, params) => {
    const queryString = new URLSearchParams(params).toString();
    const baseUrl = config.base_api_url.replace('/api/', '');
    return `${baseUrl}/api${endpoint}?${queryString}`;
  },
  
  // Generic export methods with timeout handling
  exportPdf: async (type, data) => {
    const params = { ...data, type };
    let url;
    switch (type) {
      case 'import':
        url = reportService.exportImportPdf(params);
        break;
      case 'sales':
        url = reportService.exportSalesPdf(params);
        break;
      default:
        throw new Error(`Unsupported PDF export type: ${type}`);
    }
    
    const filename = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`;
    return await reportService.downloadFile(url, filename);
  },

  exportExcel: async (type, data) => {
    const params = { ...data, type };
    let url;
    switch (type) {
      case 'import':
        url = reportService.exportImportExcelXlsx(params);
        break;
      case 'sales':
        url = reportService.exportSalesExcelXlsx(params);
        break;
      default:
        throw new Error(`Unsupported Excel export type: ${type}`);
    }
    
    const filename = `${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    return await reportService.downloadFile(url, filename);
  },

  exportCsv: async (type, data) => {
    return await reportService.exportExcel(type, data);
  },

  // Enhanced download function with timeout and retry logic
  downloadFile: async (url, filename, retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    try {
      console.log('Downloading file:', { url, filename, retryCount });
      
      const token = localStorage.getItem('token');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), EXPORT_TIMEOUT);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/octet-stream, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log('Download response:', response.status, response.statusText);
      
      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData.errors || errorData)}`);
        } else if (response.status === 404) {
          throw new Error('Export endpoint not found. Please check the server configuration.');
        } else if (response.status >= 500) {
          throw new Error('Server error during export. Please try again later.');
        } else {
          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }
      }
      
      const blob = await response.blob();
      
      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('Received empty file from server');
      }
      
      console.log('Blob created:', blob.size, 'bytes, type:', blob.type);
      
      // Trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
      
      console.log('File downloaded successfully:', filename);
      return { success: true, filename, size: blob.size };
      
    } catch (error) {
      console.error('Download error:', error);
      
      // Retry logic for timeout errors
      if (error.name === 'AbortError' && retryCount < MAX_RETRIES) {
        console.log(`Retrying download (${retryCount + 1}/${MAX_RETRIES})...`);
        return await reportService.downloadFile(url, filename, retryCount + 1);
      }
      
      // Enhanced error messages
      let userMessage;
      if (error.name === 'AbortError') {
        userMessage = 'Export timed out. The server is taking too long to generate the report.';
      } else if (error.message.includes('Validation error')) {
        userMessage = error.message;
      } else if (error.message.includes('empty file')) {
        userMessage = 'The server returned an empty file. Please try again.';
      } else {
        userMessage = `Export failed: ${error.message}`;
      }
      
      throw new Error(userMessage);
    }
  },
  
  // Health check for report endpoints
  healthCheck: async () => {
    try {
      const response = await request.get('/reports/health', {}, { timeout: 10000 });
      return { healthy: true, response };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
};
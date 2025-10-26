import { useQuery, useMutation } from 'react-query'
import { toast } from 'react-hot-toast'
import { reportService } from '../services/reportService'

// Import Reports
export const useImportReport = (params = {}) => {
  return useQuery(['importReport', params], () => reportService.getImportReport(params), {
    keepPreviousData: true,
    enabled: Object.keys(params).length > 0, // Only fetch when params are provided
  })
}

export const useImportSummary = (params = {}) => {
  return useQuery(['importSummary', params], () => reportService.getImportSummary(params), {
    keepPreviousData: true,
  })
}

// Sales Reports
export const useSalesReport = (params = {}) => {
  return useQuery(['salesReport', params], () => reportService.getSalesReport(params), {
    keepPreviousData: true,
    enabled: Object.keys(params).length > 0, // Only fetch when params are provided
  })
}

export const useSalesSummary = (params = {}) => {
  return useQuery(['salesSummary', params], () => reportService.getSalesSummary(params), {
    keepPreviousData: true,
  })
}

// Scheduled Reports
export const useBestSellingProducts = (params = {}) => {
  return useQuery(['bestSellingProducts', params], () => reportService.getBestSellingProducts(params), {
    keepPreviousData: true,
  })
}

export const useLowStockProducts = (params = {}) => {
  return useQuery(['lowStockProducts', params], () => reportService.getLowStockProducts(params), {
    keepPreviousData: true,
  })
}

export const useInventorySummary = (params = {}) => {
  return useQuery(['inventorySummary', params], () => reportService.getInventorySummary(params), {
    keepPreviousData: true,
  })
}

// Export Hooks
export const useExportReport = () => {
  return useMutation(
    async ({ type, format, params, filename }) => {
      let url
      
      switch (`${type}_${format}`) {
        case 'import_excel':
          url = reportService.exportImportExcel(params)
          break
        case 'import_xlsx':
          url = reportService.exportImportExcelXlsx(params)
          break
        case 'import_pdf':
          url = reportService.exportImportPdf(params)
          break
        case 'sales_excel':
          url = reportService.exportSalesExcel(params)
          break
        case 'sales_xlsx':
          url = reportService.exportSalesExcelXlsx(params)
          break
        case 'sales_pdf':
          url = reportService.exportSalesPdf(params)
          break
        case 'import_word':
          url = reportService.exportSingleImportWord(params)
          break
        case 'sales_word':
          url = reportService.exportSingleSalesWord(params)
          break
        default:
          throw new Error('Invalid export type or format')
      }
      
      await reportService.downloadFile(url, filename)
    },
    {
      onSuccess: () => {
        toast.success('Report exported successfully!')
      },
      onError: (error) => {
        toast.error(error.message || 'Export failed')
      },
    }
  )
}
import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { reportService } from '../services/reportService'

export const useReports = (type, params = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true)
        let response;
        
        switch (type) {
          case 'sales':
            response = await reportService.getSalesReport(params)
            break
          case 'inventory':
            response = await reportService.getInventoryReport(params)
            break
          case 'customer':
            response = await reportService.getCustomerReport(params)
            break
          default:
            throw new Error(`Unsupported report type: ${type}`)
        }
        
        setData(response)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Reports fetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (type) {
      fetchReports()
    }
  }, [type, JSON.stringify(params)])

  const refetch = () => {
    // Simple refetch implementation
    const fetchReports = async () => {
      try {
        setIsLoading(true)
        let response;
        
        switch (type) {
          case 'sales':
            response = await reportService.getSalesReport(params)
            break
          case 'inventory':
            response = await reportService.getInventoryReport(params)
            break
          case 'customer':
            response = await reportService.getCustomerReport(params)
            break
          default:
            throw new Error(`Unsupported report type: ${type}`)
        }
        
        setData(response)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Reports refetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (type) {
      fetchReports()
    }
  }

  return { data, isLoading, error, refetch }
}

export const useImportReport = (params = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false) // Start with false for instant load
  const [error, setError] = useState(null)

  const fetchImportReport = async () => {
    try {
      setIsLoading(true)
      
      const response = await reportService.getImportReport(params)
      
      setData(response)
      setError(null)
    } catch (err) {
      setError(err)
      console.error('Import report fetch failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchImportReport()
  }, [JSON.stringify(params)])

  const refetch = () => {
    fetchImportReport()
  }

  return { data, isLoading, error, refetch }
}

export const useSalesReport = (params = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false) // Start with false for instant load
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        setIsLoading(true)
        
        const response = await reportService.getSalesReport(params)
        setData(response)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Sales report fetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesReport()
  }, [JSON.stringify(params)])

  const refetch = () => {
    const fetchSalesReport = async () => {
      try {
        setIsLoading(true)
        const response = await reportService.getSalesReport(params)
        setData(response)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Sales report refetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesReport()
  }

  return { data, isLoading, error, refetch }
}

export const useImportSummary = (params = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchImportSummary = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching import summary with params:', params);
        const response = await reportService.getImportSummary(params)
        console.log('Import summary response:', response);
        // request.js transforms { success: true, data: {...} } to { data: {...} }
        // So response.data contains the actual summary data
        setData(response?.data || response)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Import summary fetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImportSummary()
  }, [JSON.stringify(params)])

  return { data, isLoading, error }
}

export const useSalesSummary = (params = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSalesSummary = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching sales summary with params:', params);
        const response = await reportService.getSalesSummary(params)
        console.log('Sales summary response:', response);
        // request.js transforms { success: true, data: {...} } to { data: {...} }
        // So response.data contains the actual summary data
        setData(response?.data || response)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Sales summary fetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesSummary()
  }, [JSON.stringify(params)])

  return { data, isLoading, error }
}

export const useBestSellingProducts = (params = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false) // ✅ Prevent multiple simultaneous calls
  const paramsRef = useRef(null) // ✅ Track previous params to prevent unnecessary refetches

  // Stringify params once and compare
  const paramsString = JSON.stringify(params)

  useEffect(() => {
    // ✅ Skip if already fetching
    if (fetchingRef.current) {
      console.log('useBestSellingProducts: Already fetching, skipping...')
      return
    }

    // ✅ Skip if params haven't changed (compare with previous)
    if (paramsRef.current === paramsString) {
      return
    }

    const fetchBestSellingProducts = async () => {
      try {
        fetchingRef.current = true
        setIsLoading(true)
        const response = await reportService.getBestSellingProducts(params)
        setData(response)
        setError(null)
        paramsRef.current = paramsString // ✅ Store current params
      } catch (err) {
        setError(err)
        console.error('Best selling products fetch failed:', err)
      } finally {
        setIsLoading(false)
        fetchingRef.current = false
      }
    }

    fetchBestSellingProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString]) // ✅ Only depend on paramsString (params is captured in closure)

  return { data, isLoading, error }
}

export const useLowStockProducts = (params = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        setIsLoading(true)
        const response = await reportService.getLowStockProducts(params)
        setData(response)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Low stock products fetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLowStockProducts()
  }, [JSON.stringify(params)])

  return { data, isLoading, error }
}

export const useInventorySummary = (params = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInventorySummary = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching inventory summary with params:', params);
        const response = await reportService.getInventorySummary(params)
        console.log('Inventory summary response:', response);
        // request.js transforms { success: true, data: {...} } to { data: {...} }
        // So response.data contains the actual summary data
        setData(response?.data || response)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Inventory summary fetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInventorySummary()
  }, [JSON.stringify(params)])

  return { data, isLoading, error }
}

export const exportReport = async (options) => {
  console.log('Export report:', options)
  
  try {
    const { exportService } = await import('../services/exportService')
    const { type, format, filename, fallbackData } = options
    
    let result
    if (format === 'xlsx' || format === 'excel') {
      result = exportService.exportToExcel(fallbackData, filename, type)
    } else if (format === 'pdf') {
      result = exportService.exportToPDF(fallbackData, filename, type)
    } else {
      throw new Error(`Unsupported format: ${format}`)
    }
    
    if (result.success) {
      // Show success message using toast
      const { toast } = await import('react-hot-toast')
      toast.success(result.message)
    } else {
      throw new Error(result.message)
    }
    
    return result
  } catch (error) {
    console.error('Export failed:', error)
    const { toast } = await import('react-hot-toast')
    toast.error('Export failed: ' + error.message)
    throw error
  }
}
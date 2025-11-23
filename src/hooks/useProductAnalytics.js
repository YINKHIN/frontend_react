/**
 * Product Analytics Hook
 * Provides product performance metrics and insights
 */

import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '../services/analyticsService'
import { processProductAnalytics, processLowStockAlerts } from '../utils/dataAggregator'

export const useProductAnalytics = (timeRange = '30d') => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await analyticsService.getProductAnalytics(timeRange)
      const processedData = processProductAnalytics(result)
      setData(processedData)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, isLoading, error, refetch }
}

export const useLowStockAlerts = () => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await analyticsService.getLowStockProducts()
      const processedData = processLowStockAlerts(result)
      setData(processedData)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, isLoading, error, refetch }
}

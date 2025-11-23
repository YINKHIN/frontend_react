/**
 * Revenue Analytics Hook
 * Provides revenue metrics, trends, and financial insights
 */

import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '../services/analyticsService'
import { calculateGrowth, calculateAverageOrderValue, processSalesTrendData } from '../utils/analyticsCalculator'

export const useRevenueAnalytics = (timeRange = '30d') => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await analyticsService.getRevenueAnalytics(timeRange)
      
      // Process the data with analytics calculations
      const processedData = {
        ...result,
        growth: calculateGrowth(result.currentPeriod, result.previousPeriod),
        averageOrderValue: calculateAverageOrderValue(result.orders),
        salesTrend: processSalesTrendData(result.dailySales)
      }
      
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

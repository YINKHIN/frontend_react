/**
 * Staff Analytics Hook
 * Provides staff performance metrics and insights
 */

import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '../services/analyticsService'
import { processStaffAnalytics } from '../utils/dataAggregator'

export const useStaffAnalytics = (timeRange = '30d') => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await analyticsService.getStaffAnalytics(timeRange)
      const processedData = processStaffAnalytics(result)
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

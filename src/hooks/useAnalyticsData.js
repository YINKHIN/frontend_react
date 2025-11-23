/**
 * Analytics Data Hook
 * Provides comprehensive analytics data aggregation and processing
 */

import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '../services/analyticsService'
import { aggregateSummaryData, generateDashboardCards } from '../utils/dataAggregator'

export const useAnalyticsData = (timeRange = '30d') => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await analyticsService.getAnalyticsData(timeRange)
      
      // Process and aggregate the data
      const aggregatedData = aggregateSummaryData(result)
      const dashboardCards = generateDashboardCards(aggregatedData)
      
      setData({
        ...result,
        aggregated: aggregatedData,
        dashboardCards
      })
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

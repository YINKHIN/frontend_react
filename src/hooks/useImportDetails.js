import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { importDetailService } from '../services/importDetailService'

export const useImportDetails = (importId) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!importId) return
    try {
      setIsLoading(true)
      const result = await importDetailService.getByImportId(importId)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [importId])

  useEffect(() => {
    if (importId) {
      refetch()
    }
  }, [importId, refetch])

  return { data, isLoading, error, refetch }
}

export const useImportDetail = (id) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const result = await importDetailService.getById(id)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      refetch()
    }
  }, [id, refetch])

  return { data, isLoading, error, refetch }
}

export const useCreateImportDetail = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (importDetailData) => {
    try {
      setIsLoading(true)
      const result = await importDetailService.create(importDetailData)
      toast.success('Import detail created successfully')
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create import detail')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useUpdateImportDetail = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async ({ id, data }) => {
    try {
      setIsLoading(true)
      const result = await importDetailService.update(id, data)
      toast.success('Import detail updated successfully')
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update import detail')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useDeleteImportDetail = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id) => {
    try {
      setIsLoading(true)
      const result = await importDetailService.delete(id)
      toast.success('Import detail deleted successfully')
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete import detail')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

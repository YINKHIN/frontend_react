import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { brandService } from '../services/brandService'

export const useBrands = () => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await brandService.getAll()
      setData(result)
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

export const useBrand = (id) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const result = await brandService.getById(id)
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

export const useCreateBrand = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (brandData) => {
    try {
      setIsLoading(true)
      const result = await brandService.create(brandData)
      toast.success('Brand created successfully')
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create brand')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useUpdateBrand = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async ({ id, data }) => {
    try {
      setIsLoading(true)
      const result = await brandService.update(id, data)
      toast.success('Brand updated successfully')
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update brand')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useDeleteBrand = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id) => {
    try {
      setIsLoading(true)
      const result = await brandService.delete(id)
      toast.success('Brand deleted successfully')
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete brand')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

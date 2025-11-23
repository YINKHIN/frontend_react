import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { supplierService } from '../services/supplierService'

export const useSuppliers = () => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await supplierService.getAll()
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

export const useSupplier = (id) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const result = await supplierService.getById(id)
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

export const useCreateSupplier = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (supplierData) => {
    try {
      setIsLoading(true)
      const result = await supplierService.create(supplierData)
      toast.success('Supplier created successfully')
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess()
      
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create supplier')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useUpdateSupplier = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async ({ id, data }) => {
    try {
      setIsLoading(true)
      const result = await supplierService.update(id, data)
      toast.success('Supplier updated successfully')
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess()
      
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update supplier')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useDeleteSupplier = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id) => {
    try {
      setIsLoading(true)
      const result = await supplierService.delete(id)
      toast.success('Supplier deleted successfully')
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess()
      
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete supplier')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

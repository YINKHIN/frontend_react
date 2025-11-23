import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { customerService } from '../services/customerService'

export const useCustomers = () => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await customerService.getAll()
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

export const useCustomer = (id) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const result = await customerService.getById(id)
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

export const useCreateCustomer = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (customerData) => {
    try {
      setIsLoading(true)
      const result = await customerService.create(customerData)
      toast.success('Customer created successfully')
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess()
      
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create customer')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useUpdateCustomer = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async ({ id, data }) => {
    try {
      setIsLoading(true)
      const result = await customerService.update(id, data)
      toast.success('Customer updated successfully')
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess()
      
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update customer')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useDeleteCustomer = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id) => {
    try {
      setIsLoading(true)
      const result = await customerService.delete(id)
      toast.success('Customer deleted successfully')
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess()
      
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete customer')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

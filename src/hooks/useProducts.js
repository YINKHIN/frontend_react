import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { productService } from '../services/productService'
import { getPrefetchedData } from '../utils/prefetch'

export const useProducts = (params = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false) // ✅ Prevent multiple simultaneous calls

  // 🚀 Check prefetched data first (YouTube-style instant loading)
  useEffect(() => {
    const prefetched = getPrefetchedData('/products')
    if (prefetched) {
      setData(prefetched)
      setIsLoading(false)
    }
  }, [])

  // Stringify params to avoid object reference issues
  const paramsString = JSON.stringify(params)

  const refetch = useCallback(async () => {
    // ✅ Prevent multiple simultaneous calls
    if (fetchingRef.current) {
      console.log('useProducts: Already fetching, skipping...')
      return
    }
    
    try {
      fetchingRef.current = true
      // Only set loading if we don't have prefetched data
      const prefetched = getPrefetchedData('/products')
      if (!prefetched) setIsLoading(true)
      const result = await productService.getAll(JSON.parse(paramsString))
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
      fetchingRef.current = false
    }
  }, [paramsString]) // ✅ Removed 'data' dependency to prevent infinite loop

  useEffect(() => {
    // Skip fetch if already fetching
    if (fetchingRef.current) return
    
    // Skip fetch if we have prefetched data (only on first load)
    const prefetched = getPrefetchedData('/products')
    if (prefetched && !data) {
      // Already handled in first useEffect
      return
    }
    
    // Fetch data (will skip if already have data and params haven't changed)
    refetch()
  }, [paramsString, refetch]) // ✅ Include refetch but it's stable (only changes when paramsString changes)

  return { data, isLoading, error, refetch }
}

export const useProduct = (id) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const result = await productService.getById(id)
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

export const useCreateProduct = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (productData) => {
    try {
      setIsLoading(true)
      
      const result = await productService.create(productData)
      toast.success('Product created successfully')
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess()
      
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useUpdateProduct = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async ({ id, data }) => {
    try {
      setIsLoading(true)
      
      const result = await productService.update(id, data)
      toast.success('Product updated successfully')
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess()
      
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useDeleteProduct = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id) => {
    try {
      setIsLoading(true)
      
      const result = await productService.delete(id)
      toast.success('Product deleted successfully')
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess()
      
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useDeactivateProduct = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id) => {
    try {
      setIsLoading(true)
      
      const result = await productService.deactivate(id)
      toast.success('Product deactivated successfully')
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess()
      
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate product')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useActivateProduct = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id) => {
    try {
      setIsLoading(true)
      
      const result = await productService.activate(id)
      toast.success('Product activated successfully')
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess()
      
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate product')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

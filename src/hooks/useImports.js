import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { importService } from '../services/importService'
import { dataCache } from '../utils/dataCache'

export const useImports = (params = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Listen to cache updates for immediate UI updates
  useEffect(() => {
    const unsubscribe = dataCache.subscribe('imports', (cachedImports) => {
      // Update data when cache changes
      setData(prev => {
        if (!prev) return prev
        
        const apiImports = prev?.data?.data || prev?.data || prev || []
        // Get new items from cache that aren't in API data
        const existingIds = new Set(apiImports.map(imp => imp.id))
        const newItems = cachedImports.filter(imp => !existingIds.has(imp.id))
        
        // If there are new items, add them
        if (newItems.length > 0) {
          const combined = [...newItems, ...apiImports]
          // Preserve API response structure
          if (prev?.data?.data) {
            return { ...prev, data: { ...prev.data, data: combined } }
          } else if (prev?.data) {
            return { ...prev, data: combined }
          }
          return combined
        }
        
        return prev
      })
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const fetchImports = async () => {
      try {
        setIsLoading(true)
        const response = await importService.getAll(params)
        setData(response)
        // Update cache with fresh data
        const imports = response?.data?.data || response?.data || response || []
        dataCache.set('imports', imports)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Imports fetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImports()
  }, [JSON.stringify(params)])

  const refetch = () => {
    // Simple refetch implementation
    const fetchImports = async () => {
      try {
        setIsLoading(true)
        const response = await importService.getAll(params)
        setData(response)
        // Update cache with fresh data
        const imports = response?.data?.data || response?.data || response || []
        dataCache.set('imports', imports)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Imports refetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImports()
  }

  return { data, isLoading, error, refetch }
}

export const useImport = (id) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchImport = async () => {
      try {
        setIsLoading(true)
        const response = await importService.getById(id)
        setData(response)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Import fetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImport()
  }, [id])

  return { data, isLoading, error }
}

export const useCreateImport = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutateAsync = async (data) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Create temporary import object for optimistic update
      const tempImport = {
        id: `temp-${Date.now()}`,
        imp_date: data.imp_date,
        staff_id: data.staff_id,
        sup_id: data.sup_id,
        supplier: data.supplier,
        total: data.total,
        import_details: data.items?.map(item => ({
          pro_code: item.product_id,
          pro_name: '', // Will be filled from API response
          qty: item.qty,
          price: item.price,
          amount: item.amount || item.qty * item.price
        })) || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Optimistic update - add to cache immediately
      dataCache.add('imports', tempImport)
      
      // Make API call
      const response = await importService.create(data)
      const newImport = response?.data?.data || response?.data || response
      
      // Replace temp import with real one
      if (newImport && newImport.id) {
        dataCache.remove('imports', tempImport.id)
        dataCache.add('imports', newImport)
      }
      
      toast.success('Import created successfully')
      return response
    } catch (err) {
      setError(err)
      console.error('Import creation failed:', err)
      // Remove optimistic update on error
      const tempImports = dataCache.get('imports').filter(imp => imp.id?.toString().startsWith('temp-'))
      tempImports.forEach(imp => dataCache.remove('imports', imp.id))
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to create import'
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutateAsync, isLoading, error }
}

export const useUpdateImport = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutateAsync = async ({ id, data }) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await importService.update(id, data)
      toast.success('Import updated successfully')
      return response
    } catch (err) {
      setError(err)
      console.error('Import update failed:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to update import'
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutateAsync, isLoading, error }
}

export const useDeleteImport = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutateAsync = async (id) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await importService.delete(id)
      toast.success('Import deleted successfully')
      return response
    } catch (err) {
      setError(err)
      console.error('Import deletion failed:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to delete import'
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutateAsync, isLoading, error }
}
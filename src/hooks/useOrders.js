import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { orderService } from '../services/orderService'
import { dataCache } from '../utils/dataCache'
import { getPrefetchedData } from '../utils/prefetch'

export const useOrders = (params = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 🚀 Check prefetched data first (YouTube-style instant loading)
  useEffect(() => {
    const prefetched = getPrefetchedData('/orders')
    if (prefetched) {
      setData(prefetched)
      setIsLoading(false)
    }
  }, [])

  // Listen to cache updates for immediate UI updates
  useEffect(() => {
    const unsubscribe = dataCache.subscribe('orders', (cachedOrders) => {
      // Update data when cache changes
      setData(prev => {
        if (!prev) return prev
        
        const apiOrders = prev?.data?.data || prev?.data || prev || []
        // Get new items from cache that aren't in API data
        const existingIds = new Set(apiOrders.map(ord => ord.id))
        const newItems = cachedOrders.filter(ord => !existingIds.has(ord.id))
        
        // If there are new items, add them
        if (newItems.length > 0) {
          const combined = [...newItems, ...apiOrders]
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
    // Skip fetch if we have prefetched data
    if (getPrefetchedData('/orders')) {
      return
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const response = await orderService.getAll(params)
        setData(response)
        // Update cache with fresh data
        const orders = response?.data?.data || response?.data || response || []
        dataCache.set('orders', orders)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Orders fetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [JSON.stringify(params)])

  const refetch = () => {
    // Simple refetch implementation
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const response = await orderService.getAll(params)
        setData(response)
        // Update cache with fresh data
        const orders = response?.data?.data || response?.data || response || []
        dataCache.set('orders', orders)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Orders refetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }

  return { data, isLoading, error, refetch }
}

export const useOrder = (id) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchOrder = async () => {
      try {
        setIsLoading(true)
        const response = await orderService.getById(id)
        setData(response)
        setError(null)
      } catch (err) {
        setError(err)
        console.error('Order fetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  return { data, isLoading, error }
}

export const useCreateOrder = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutateAsync = async (data) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Create temporary order object for optimistic update
      const tempOrder = {
        id: `temp-${Date.now()}`,
        ord_date: data.ord_date,
        staff_id: data.staff_id,
        cus_id: data.cus_id,
        cus_name: data.cus_name,
        total: data.total || 0,
        order_details: data.items?.map(item => ({
          pro_code: item.product_id,
          pro_name: '', // Will be filled from API response
          qty: item.qty,
          price: item.price,
          amount: item.qty * item.price
        })) || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Optimistic update - add to cache immediately
      dataCache.add('orders', tempOrder)
      
      // Make API call
      const response = await orderService.create(data)
      const newOrder = response?.data?.data || response?.data || response
      
      // Replace temp order with real one
      if (newOrder && newOrder.id) {
        dataCache.remove('orders', tempOrder.id)
        dataCache.add('orders', newOrder)
      }
      
      toast.success('Order created successfully')
      return response
    } catch (err) {
      setError(err)
      console.error('Order creation failed:', err)
      // Remove optimistic update on error
      const tempOrders = dataCache.get('orders').filter(ord => ord.id?.toString().startsWith('temp-'))
      tempOrders.forEach(ord => dataCache.remove('orders', ord.id))
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to create order'
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutateAsync, isLoading, error }
}

export const useUpdateOrder = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutateAsync = async ({ id, data }) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await orderService.update(id, data)
      toast.success('Order updated successfully')
      return response
    } catch (err) {
      setError(err)
      console.error('Order update failed:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to update order'
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutateAsync, isLoading, error }
}

export const useDeleteOrder = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutateAsync = async (id) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await orderService.delete(id)
      toast.success('Order deleted successfully')
      return response
    } catch (err) {
      setError(err)
      console.error('Order deletion failed:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to delete order'
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutateAsync, isLoading, error }
}
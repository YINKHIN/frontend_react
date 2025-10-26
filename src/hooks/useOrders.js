import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { orderService } from '../services/orderService'

export const useOrders = () => {
  return useQuery('orders', orderService.getAll, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache data
    refetchInterval: false, // Disable automatic refetching
  })
}

export const useOrder = (id) => {
  return useQuery(['order', id], () => orderService.getById(id), {
    enabled: !!id,
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation(orderService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('orders')
      queryClient.refetchQueries('orders') // Force refetch
      toast.success('Order created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create order')
    },
  })
}

export const useUpdateOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, data }) => orderService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders')
        queryClient.refetchQueries('orders') // Force refetch
        toast.success('Order updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update order')
      },
    }
  )
}

export const useDeleteOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation(orderService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('orders')
      queryClient.refetchQueries('orders') // Force refetch
      toast.success('Order deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete order')
    },
  })
}

export const useForceDeleteOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation(orderService.forceDelete, {
    onSuccess: () => {
      queryClient.invalidateQueries('orders')
      queryClient.refetchQueries('orders') // Force refetch
      toast.success('Order permanently deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to permanently delete order')
    },
  })
}
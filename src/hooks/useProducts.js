import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { productService } from '../services/productService'

export const useProducts = (params = {}) => {
  return useQuery(['products', params], () => productService.getAll(params), {
    keepPreviousData: true,
  })
}

export const useProduct = (id) => {
  return useQuery(['product', id], () => productService.getById(id), {
    enabled: !!id,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(productService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('products')
      toast.success('Product created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create product')
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => productService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products')
        toast.success('Product updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update product')
      },
    }
  )
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(productService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('products')
      toast.success('Product deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    },
  })
}

export const useDeactivateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(productService.deactivate, {
    onSuccess: () => {
      queryClient.invalidateQueries('products')
      toast.success('Product deactivated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate product')
    },
  })
}

export const useActivateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(productService.activate, {
    onSuccess: () => {
      queryClient.invalidateQueries('products')
      toast.success('Product activated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to activate product')
    },
  })
}

export const useLowStockProducts = (params = {}) => {
  return useQuery(['lowStockProducts', params], () => productService.getLowStock(params))
}

export const useExpiredProducts = (params = {}) => {
  return useQuery(['expiredProducts', params], () => productService.getExpired(params))
}

export const useNearExpirationProducts = (params = {}) => {
  return useQuery(['nearExpirationProducts', params], () => productService.getNearExpiration(params))
}
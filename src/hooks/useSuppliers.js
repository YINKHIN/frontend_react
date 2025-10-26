import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { supplierService } from '../services/supplierService'

export const useSuppliers = () => {
  return useQuery('suppliers', supplierService.getAll)
}

export const useSupplier = (id) => {
  return useQuery(['supplier', id], () => supplierService.getById(id), {
    enabled: !!id,
  })
}

export const useCreateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation(supplierService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('suppliers')
      toast.success('Supplier created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create supplier')
    },
  })
}

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => supplierService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers')
        toast.success('Supplier updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update supplier')
      },
    }
  )
}

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation(supplierService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('suppliers')
      toast.success('Supplier deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete supplier')
    },
  })
}
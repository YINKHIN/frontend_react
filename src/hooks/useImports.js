import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { importService } from '../services/importService'

export const useImports = () => {
  return useQuery('imports', importService.getAll, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache data
    refetchInterval: false, // Disable automatic refetching
  })
}

export const useImport = (id) => {
  return useQuery(['import', id], () => importService.getById(id), {
    enabled: !!id,
  })
}

export const useCreateImport = () => {
  const queryClient = useQueryClient()
  
  return useMutation(importService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('imports')
      queryClient.refetchQueries('imports') // Force refetch
      toast.success('Import created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create import')
    },
  })
}

export const useUpdateImport = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, data }) => importService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('imports')
        queryClient.refetchQueries('imports') // Force refetch
        toast.success('Import updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update import')
      },
    }
  )
}

export const useDeleteImport = () => {
  const queryClient = useQueryClient()
  
  return useMutation(importService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('imports')
      queryClient.refetchQueries('imports') // Force refetch
      toast.success('Import deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete import')
    },
  })
}
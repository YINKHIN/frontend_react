import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { importDetailService } from '../services/importDetailService'

export const useImportDetails = (importId) => {
  return useQuery(
    ['importDetails', importId], 
    () => importDetailService.getByImportId(importId),
    {
      enabled: !!importId,
    }
  )
}

export const useCreateImportDetail = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ importId, data }) => importDetailService.create(importId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['importDetails', variables.importId])
        queryClient.invalidateQueries('imports')
        toast.success('Import detail added successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add import detail')
      },
    }
  )
}

export const useUpdateImportDetail = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ importId, productId, data }) => importDetailService.update(importId, productId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['importDetails', variables.importId])
        queryClient.invalidateQueries('imports')
        toast.success('Import detail updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update import detail')
      },
    }
  )
}

export const useDeleteImportDetail = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ importId, productId }) => importDetailService.delete(importId, productId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['importDetails', variables.importId])
        queryClient.invalidateQueries('imports')
        toast.success('Import detail removed successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to remove import detail')
      },
    }
  )
}

export const useBulkCreateImportDetails = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ importId, details }) => importDetailService.bulkCreate(importId, details),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['importDetails', variables.importId])
        queryClient.invalidateQueries('imports')
        toast.success('Import details saved successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to save import details')
      },
    }
  )
}
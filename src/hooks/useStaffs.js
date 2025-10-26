import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { staffService } from '../services/staffService'

export const useStaffs = () => {
  return useQuery('staffs', staffService.getAll, {
    keepPreviousData: true,
  })
}

export const useStaff = (id) => {
  return useQuery(['staff', id], () => staffService.getById(id), {
    enabled: !!id,
  })
}

export const useCreateStaff = () => {
  const queryClient = useQueryClient()
  
  return useMutation(staffService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('staffs')
      toast.success('Staff created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create staff')
    },
  })
}

export const useUpdateStaff = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, data }) => staffService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('staffs')
        toast.success('Staff updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update staff')
      },
    }
  )
}

export const useDeleteStaff = () => {
  const queryClient = useQueryClient()
  
  return useMutation(staffService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('staffs')
      toast.success('Staff deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete staff')
    },
  })
}
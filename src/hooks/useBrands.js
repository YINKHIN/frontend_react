import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { brandService } from '../services/brandService'

export const useBrands = () => {
  return useQuery('brands', brandService.getAll)
}

export const useBrand = (id) => {
  return useQuery(['brand', id], () => brandService.getById(id), {
    enabled: !!id,
  })
}

export const useCreateBrand = () => {
  const queryClient = useQueryClient()
  
  return useMutation(brandService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('brands')
      toast.success('Brand created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create brand')
    },
  })
}

export const useUpdateBrand = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, data }) => brandService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('brands')
        toast.success('Brand updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update brand')
      },
    }
  )
}

export const useDeleteBrand = () => {
  const queryClient = useQueryClient()
  
  return useMutation(brandService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('brands')
      toast.success('Brand deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete brand')
    },
  })
}
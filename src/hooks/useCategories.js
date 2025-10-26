import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { categoryService } from '../services/categoryService'

export const useCategories = () => {
  return useQuery('categories', categoryService.getAll)
}

export const useCategory = (id) => {
  return useQuery(['category', id], () => categoryService.getById(id), {
    enabled: !!id,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation(categoryService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories')
      toast.success('Category created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create category')
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, data }) => categoryService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories')
        toast.success('Category updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update category')
      },
    }
  )
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation(categoryService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories')
      toast.success('Category deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete category')
    },
  })
}
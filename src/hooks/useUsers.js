import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { userService } from '../services/userService'

export const useUsers = () => {
  return useQuery('users', userService.getAll)
}

export const useUser = (id) => {
  return useQuery(['user', id], () => userService.getById(id), {
    enabled: !!id,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation(userService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('users')
      toast.success('User created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user')
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, data }) => userService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users')
        toast.success('User updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user')
      },
    }
  )
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation(userService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('users')
      toast.success('User deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    },
  })
}
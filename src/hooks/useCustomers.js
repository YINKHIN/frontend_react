import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { customerService } from '../services/customerService'

export const useCustomers = () => {
  return useQuery('customers', customerService.getAll)
}

export const useCustomer = (id) => {
  return useQuery(['customer', id], () => customerService.getById(id), {
    enabled: !!id,
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation(customerService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('customers')
      toast.success('Customer created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create customer')
    },
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, data }) => customerService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers')
        toast.success('Customer updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update customer')
      },
    }
  )
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation(customerService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('customers')
      toast.success('Customer deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete customer')
    },
  })
}
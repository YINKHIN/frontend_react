import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { paymentService } from '../services/paymentService'

export const usePayments = () => {
  return useQuery('payments', paymentService.getAll)
}

export const usePayment = (id) => {
  return useQuery(['payment', id], () => paymentService.getById(id), {
    enabled: !!id,
  })
}

export const useCreatePayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation(paymentService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('payments')
      toast.success('Payment created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create payment')
    },
  })
}

export const useUpdatePayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, data }) => paymentService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payments')
        toast.success('Payment updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update payment')
      },
    }
  )
}

export const useDeletePayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation(paymentService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('payments')
      toast.success('Payment deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete payment')
    },
  })
}

export const usePendingPayments = () => {
  return useQuery('pendingPayments', paymentService.getPending)
}

export const usePaymentSummary = () => {
  return useQuery('paymentSummary', paymentService.getSummary)
}
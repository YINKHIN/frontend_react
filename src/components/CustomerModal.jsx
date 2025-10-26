import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomers'
import LoadingSpinner from './LoadingSpinner'

const CustomerModal = ({ customer, mode, onClose }) => {
  const isReadOnly = mode === 'view'
  const isEdit = mode === 'edit'
  
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      cus_name: '',
      cus_contact: '',
      ...customer
    }
  })

  useEffect(() => {
    if (customer) {
      reset({
        cus_name: customer.cus_name || '',
        cus_contact: customer.cus_contact || '',
      })
    }
  }, [customer, reset])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateCustomer.mutateAsync({ id: customer.id, data })
      } else {
        await createCustomer.mutateAsync(data)
      }
      onClose()
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  const isLoading = createCustomer.isLoading || updateCustomer.isLoading

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Customer' : 
             mode === 'edit' ? 'Edit Customer' : 'Customer Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                {...register('cus_name', { required: 'Customer name is required' })}
                type="text"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
                placeholder="Enter customer name"
              />
              {errors.cus_name && (
                <p className="mt-1 text-sm text-red-600">{errors.cus_name.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <input
                {...register('cus_contact', {
                  maxLength: {
                    value: 10,
                    message: 'Contact number must be 10 digits or less'
                  }
                })}
                type="tel"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
                placeholder="Enter contact number (max 10 digits)"
                maxLength={10}
              />
              {errors.cus_contact && (
                <p className="mt-1 text-sm text-red-600">{errors.cus_contact.message}</p>
              )}
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto order-1 sm:order-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  isEdit ? 'Update Customer' : 'Create Customer'
                )}
              </button>
            </div>
          )}
          
          {isReadOnly && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default CustomerModal
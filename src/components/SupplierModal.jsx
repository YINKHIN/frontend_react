import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { useCreateSupplier, useUpdateSupplier } from '../hooks/useSuppliers'
import LoadingSpinner from './LoadingSpinner'

const SupplierModal = ({ supplier, mode, onClose }) => {
  const isEdit = mode === 'edit'
  
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: supplier || {}
  })

  useEffect(() => {
    if (supplier) {
      reset(supplier)
    }
  }, [supplier, reset])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateSupplier.mutateAsync({ id: supplier.id, data })
      } else {
        await createSupplier.mutateAsync(data)
      }
      onClose()
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  const isLoading = createSupplier.isLoading || updateSupplier.isLoading

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier Name *
            </label>
            <input
              {...register('supplier', { required: 'Supplier name is required' })}
              type="text"
              className="input"
            />
            {errors.supplier && (
              <p className="mt-1 text-sm text-red-600">{errors.supplier.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact *
            </label>
            <input
              {...register('sup_con', { required: 'Contact is required' })}
              type="text"
              className="input"
            />
            {errors.sup_con && (
              <p className="mt-1 text-sm text-red-600">{errors.sup_con.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              {...register('sup_add', { required: 'Address is required' })}
              rows={3}
              className="input"
            />
            {errors.sup_add && (
              <p className="mt-1 text-sm text-red-600">{errors.sup_add.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                isEdit ? 'Update Supplier' : 'Create Supplier'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SupplierModal
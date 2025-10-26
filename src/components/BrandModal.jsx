import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { useCreateBrand, useUpdateBrand } from '../hooks/useBrands'
import LoadingSpinner from './LoadingSpinner'

const BrandModal = ({ brand, mode, onClose }) => {
  const isEdit = mode === 'edit'
  
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      status: 'active',
      ...brand
    }
  })

  useEffect(() => {
    if (brand) {
      reset(brand)
    }
  }, [brand, reset])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateBrand.mutateAsync({ id: brand.id, data })
      } else {
        await createBrand.mutateAsync(data)
      }
      onClose()
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  const isLoading = createBrand.isLoading || updateBrand.isLoading

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Brand' : 'Add New Brand'}
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
              Brand Name *
            </label>
            <input
              {...register('name', { required: 'Brand name is required' })}
              type="text"
              className="input"
              placeholder="Enter brand name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand Code *
            </label>
            <input
              {...register('code', { required: 'Brand code is required' })}
              type="text"
              className="input"
              placeholder="Enter brand code (e.g., APPLE, SAMSUNG)"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              {...register('status', { required: 'Status is required' })}
              className="input"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
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
                isEdit ? 'Update Brand' : 'Create Brand'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BrandModal
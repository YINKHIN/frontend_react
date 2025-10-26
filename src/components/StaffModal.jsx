import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { useCreateStaff, useUpdateStaff } from '../hooks/useStaffs'
import LoadingSpinner from './LoadingSpinner'
import { getImageUrl } from '../utils/helper'
import { config } from '../utils/config'

const StaffModal = ({ staff, mode, onClose }) => {
  const isReadOnly = mode === 'view'
  const isEdit = mode === 'edit'
  
  const createStaff = useCreateStaff()
  const updateStaff = useUpdateStaff()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      full_name: '',
      gen: 'M',
      dob: '',
      position: '',
      salary: '',
      stopwork: false,
      status: 'active',
      photo: null,
      ...staff
    }
  })

  useEffect(() => {
    if (staff) {
      reset({
        full_name: staff.full_name || '',
        gen: staff.gen || 'M',
        dob: staff.dob || '',
        position: staff.position || '',
        salary: staff.salary || '',
        stopwork: staff.stopwork || false,
        status: staff.status || 'active',
        photo: null,
      })
    }
  }, [staff, reset])

  const onSubmit = async (data) => {
    try {
      console.log('Form data received:', data)
      
      // Validate required fields
      if (!data.full_name?.trim()) {
        throw new Error('Full name is required')
      }
      if (!data.dob) {
        throw new Error('Date of birth is required')
      }
      if (!data.position?.trim()) {
        throw new Error('Position is required')
      }
      if (!data.salary || parseFloat(data.salary) < 0) {
        throw new Error('Valid salary is required')
      }
      
      const hasFile = data.photo && data.photo[0]
      console.log('Has file:', hasFile)
      
      let submitData
      
      if (hasFile) {
        // Validate that the file is actually an image
        const file = data.photo[0];
        if (!file.type.startsWith('image/')) {
          throw new Error('Selected file is not an image');
        }
        
        // Create FormData for file upload
        const formData = new FormData()
        
        // Add all form fields
        formData.append('full_name', data.full_name || '')
        formData.append('gen', data.gen || 'M')
        formData.append('dob', data.dob || '')
        formData.append('position', data.position || '')
        formData.append('salary', data.salary ? parseFloat(data.salary).toString() : '0')
        // Only append stopwork if it's true, Laravel will treat missing as false
        if (data.stopwork) {
          formData.append('stopwork', '1')
        }
        formData.append('status', data.status || 'active')
        formData.append('photo', file)
        
        submitData = formData
        console.log('Submitting FormData with file')
      } else {
        // Use regular JSON data when no file upload
        submitData = {
          full_name: data.full_name || '',
          gen: data.gen || 'M',
          dob: data.dob || '',
          position: data.position || '',
          salary: data.salary ? parseFloat(data.salary) : 0,
          stopwork: data.stopwork ? true : false, // JSON can handle boolean
          status: data.status || 'active',
        }
        console.log('Submitting JSON data:', submitData)
      }

      if (isEdit) {
        await updateStaff.mutateAsync({ id: staff.id, data: submitData })
      } else {
        await createStaff.mutateAsync(submitData)
      }
      onClose()
    } catch (error) {
      console.error('Submit failed:', error)
      // Display error to user
      alert('Error: ' + error.message);
    }
  }

  const isLoading = createStaff.isLoading || updateStaff.isLoading

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Staff' : 
             mode === 'edit' ? 'Edit Staff' : 'Staff Details'}
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
                Full Name *
              </label>
              <input
                {...register('full_name', { required: 'Full name is required' })}
                type="text"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
                placeholder="Enter full name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                {...register('gen', { required: 'Gender is required' })}
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
              {errors.gen && (
                <p className="mt-1 text-sm text-red-600">{errors.gen.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                {...register('dob', { required: 'Date of birth is required' })}
                type="date"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-red-600">{errors.dob.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <input
                {...register('position', { required: 'Position is required' })}
                type="text"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
                placeholder="Enter position"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary *
              </label>
              <input
                {...register('salary', { 
                  required: 'Salary is required',
                  min: { value: 0, message: 'Salary must be positive' }
                })}
                type="number"
                step="0.01"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
                placeholder="0.00"
              />
              {errors.salary && (
                <p className="mt-1 text-sm text-red-600">{errors.salary.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                {...register('stopwork')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded"
                disabled={isReadOnly}
              />
              <label className="ml-2 block text-sm text-gray-700">
                Stop Work
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo
              </label>
              
              {(isEdit || mode === 'view') && staff?.photo && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Current Photo:</p>
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                    <img 
                      src={staff.photo_url || getImageUrl(staff.photo, config.base_image_url)}
                      alt="Staff"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <input
                {...register('photo')}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp,image/avif"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
              />
              <p className="mt-1 text-xs text-gray-500">
                Supported formats: JPEG, PNG, JPG, GIF, WEBP, AVIF (max 10MB)
              </p>
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
                  isEdit ? 'Update Staff' : 'Create Staff'
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

export default StaffModal
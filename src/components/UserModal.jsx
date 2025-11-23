import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { useCreateUser, useUpdateUser } from '../hooks/useUsers'
import LoadingSpinner from './LoadingSpinner'
import { getImageUrl } from '../utils/helper'
import { config } from '../utils/config'

const UserModal = ({ user, mode, onClose, onSuccess }) => {
  const isReadOnly = mode === 'view'
  const isEdit = mode === 'edit'
  
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: user ? {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || user.profile?.phone || '',
      address: user.address || user.profile?.address || '',
      type: user.type || user.user_type || '',
    } : {}
  })

  const password = watch('password')

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || user.profile?.phone || '',
        address: user.address || user.profile?.address || '',
        type: user.type || user.user_type || '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data) => {
    try {
      // Remove password confirmation from data
      const { password_confirmation, ...formData } = data
      
      const hasFile = formData.image && formData.image[0]
      
      let submitData
      
      if (hasFile) {
        // Validate that the file is actually an image
        const file = formData.image[0];
        if (!file.type.startsWith('image/')) {
          throw new Error('Selected file is not an image');
        }
        
        // Create FormData for file upload
        const formDataObj = new FormData()
        
        // Add all form fields (ensure strings)
        formDataObj.append('name', String(formData.name || ''))
        formDataObj.append('email', String(formData.email || ''))
        formDataObj.append('phone', String(formData.phone || ''))
        formDataObj.append('address', String(formData.address || ''))
        formDataObj.append('type', String(formData.type || ''))
        if (formData.password) {
          formDataObj.append('password', formData.password)
        }
        formDataObj.append('image', file)
        
        submitData = formDataObj
      } else {
        // Use regular JSON data when no file upload (ensure strings)
        submitData = {
          name: String(formData.name || ''),
          email: String(formData.email || ''),
          phone: String(formData.phone || ''),
          address: String(formData.address || ''),
          type: String(formData.type || '')
        }
        if (formData.password) {
          submitData.password = formData.password
        }
      }
      
      let result
      if (isEdit) {
        result = await updateUser.mutateAsync({ id: user.id, data: submitData })
      } else {
        result = await createUser.mutateAsync(submitData)
      }

      // Normalize response shape to extract the user object
      const changedUser = (result && (result.data?.data || result.data || result)) || null

      // Notify parent to update table immediately (no spinner)
      if (typeof onSuccess === 'function') {
        const type = isEdit ? 'update' : 'create'
        try { onSuccess({ type, user: changedUser }) } catch (_) {}
      }
      onClose()
    } catch (error) {
      console.error('Submit failed:', error)
      alert('Error: ' + error.message);
    }
  }

  const isLoading = createUser.isLoading || updateUser.isLoading

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New User' : 
             mode === 'edit' ? 'Edit User' : 'User Details'}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                className="input"
                disabled={isReadOnly}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="input"
                disabled={isReadOnly}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="input"
                disabled={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Type *
              </label>
              <select
                {...register('type', { required: 'User type is required' })}
                className="input"
                disabled={isReadOnly}
              >
                <option value="">Select User Type</option>
                <option value="admin">Administrator - Full system access</option>
                <option value="manager">Manager - Read-only access (cannot manage users)</option>
                <option value="sales">Sales Staff - Manage orders & payments only</option>
                <option value="inventory">Inventory Staff - Manage products & imports only</option>
                <option value="user">User - Read-only access to all modules</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
              
              {/* Role Description */}
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Role Permissions:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Admin:</strong> Create, Read, Update, Delete all modules</div>
                  <div><strong>Manager:</strong> Read-only access (cannot update/insert/delete users)</div>
                  <div><strong>Sales Staff:</strong> Manage sales orders and payments only</div>
                  <div><strong>Inventory Staff:</strong> Manage products and stock imports only</div>
                  <div><strong>User:</strong> Read-only access to view all data</div>
                </div>
              </div>
            </div>

            {!isEdit && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type="password"
                    className="input"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    {...register('password_confirmation', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    type="password"
                    className="input"
                  />
                  {errors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              {...register('address')}
              rows={3}
              className="input"
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            
            {isEdit && (user?.image || user?.profile?.image) && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Current Photo:</p>
                <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden border border-gray-300">
                  <img 
                    src={user.image_url || user.profile?.image_url || getImageUrl(user.image || user.profile?.image, config.base_image_url)}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            <input
              {...register('image')}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp,image/avif"
              className="input text-sm"
              disabled={isReadOnly}
            />
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: JPEG, PNG, JPG, GIF, WEBP, AVIF (max 10MB)
            </p>
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
                  isEdit ? 'Update User' : 'Create User'
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

export default UserModal

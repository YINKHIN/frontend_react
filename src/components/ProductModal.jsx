import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useBrands } from '../hooks/useBrands'
import { getImageUrl } from '../utils/helper'
import { config } from '../utils/config'

// Convert various date formats to yyyy-MM-dd for date inputs
const toDateInputValue = (value) => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (dmy) {
    const [, dd, mm, yyyy] = dmy
    return `${yyyy}-${mm}-${dd}`
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const ProductModal = ({ product, mode, onClose, onSuccess }) => {
  const isReadOnly = mode === 'view'
  const isEdit = mode === 'edit'
  const [imagePreview, setImagePreview] = useState(null)

  const { data: categoriesResponse } = useCategories()
  const { data: brandsResponse } = useBrands()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  // Handle different API response formats
  const categories = categoriesResponse?.data || categoriesResponse || []
  const brands = brandsResponse?.data || brandsResponse || []

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      pro_name: '',
      pro_description: '',
      category_id: '',
      brand_id: '',
      upis: '',
      sup: '',
      qty: '',
      reorder_point: 10,
      reorder_quantity: 50,
      batch_number: '',
      expiration_date: '',
      status: 'active',
      image: null,
      ...product
    }
  })

  useEffect(() => {
    if (product) {
      reset({
        pro_name: product.pro_name || '',
        pro_description: product.pro_description || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        upis: product.upis || '',
        sup: product.sup || '',
        qty: product.qty || '',
        reorder_point: product.reorder_point || 10,
        reorder_quantity: product.reorder_quantity || 50,
        batch_number: product.batch_number || '',
        expiration_date: toDateInputValue(product.expiration_date || ''),
        status: product.status || 'active',
        image: null,
      })
      setImagePreview(null)
    }
  }, [product, reset])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const onSubmit = async (data) => {
    try {
      const hasFile = data.image && data.image[0]

      let submitData

      if (hasFile) {
        // Create FormData for file upload
        const formData = new FormData()

        // Add all form fields
        formData.append('pro_name', data.pro_name || '')
        formData.append('pro_description', data.pro_description || '')
        formData.append('category_id', parseInt(data.category_id) || '')
        formData.append('brand_id', data.brand_id || '')
        formData.append('upis', parseFloat(data.upis) || 0)
        formData.append('sup', parseFloat(data.sup) || 0)
        formData.append('qty', parseInt(data.qty) || 0)
        formData.append('reorder_point', parseInt(data.reorder_point) || 10)
        formData.append('reorder_quantity', parseInt(data.reorder_quantity) || 50)
        formData.append('batch_number', data.batch_number || '')
        formData.append('expiration_date', data.expiration_date || '')
        formData.append('status', data.status || 'active')
        formData.append('image', data.image[0])

        submitData = formData
      } else {
        // Use regular JSON data when no file upload
        submitData = {
          pro_name: data.pro_name || '',
          pro_description: data.pro_description || '',
          category_id: parseInt(data.category_id) || null,
          brand_id: data.brand_id || null,
          upis: parseFloat(data.upis) || 0,
          sup: parseFloat(data.sup) || 0,
          qty: parseInt(data.qty) || 0,
          reorder_point: parseInt(data.reorder_point) || 10,
          reorder_quantity: parseInt(data.reorder_quantity) || 50,
          batch_number: data.batch_number || '',
          expiration_date: data.expiration_date || null,
          status: data.status || 'active',
        }
      }

      let result
      if (isEdit) {
        result = await updateProduct.mutateAsync({ id: product.id, data: submitData })
      } else {
        result = await createProduct.mutateAsync(submitData)
      }
      // Normalize response
      const changedProduct = (result && (result.data?.data || result.data || result)) || null
      if (typeof onSuccess === 'function') {
        const type = isEdit ? 'update' : 'create'
        await onSuccess({ type, product: changedProduct })
      }
      onClose()
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  const isLoading = createProduct.isLoading || updateProduct.isLoading

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3  sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Product' :
              mode === 'edit' ? 'Edit Product' : 'Product Details'}
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
                Product Name *
              </label>
              <input
                {...register('pro_name', { required: 'Product name is required' })}
                type="text"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
                placeholder="Enter product name"
              />
              {errors.pro_name && (
                <p className="mt-1 text-sm text-red-600">{errors.pro_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category_id', { required: 'Category is required' })}
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
              >
                <option value="">Select Category</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                {...register('brand_id')}
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
              >
                <option value="">Select Brand (Optional)</option>
                {Array.isArray(brands) && brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price *
              </label>
              <input
                {...register('upis', {
                  required: 'Unit price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                type="number"
                step="0.01"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
                placeholder="0.00"
              />
              {errors.upis && (
                <p className="mt-1 text-sm text-red-600">{errors.upis.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price
              </label>
              <input
                {...register('sup', {
                  min: { value: 0, message: 'Price must be positive' }
                })}
                type="number"
                step="0.01"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
                placeholder="0.00"
              />
              {errors.sup && (
                <p className="mt-1 text-sm text-red-600">{errors.sup.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                {...register('qty', {
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity must be positive' }
                })}
                type="number"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
                placeholder="0"
              />
              {errors.qty && (
                <p className="mt-1 text-sm text-red-600">{errors.qty.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Point
              </label>
              <input
                {...register('reorder_point', {
                  min: { value: 0, message: 'Reorder point must be positive' }
                })}
                type="number"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Quantity *
              </label>
              <input
                {...register('reorder_quantity', {
                  required: 'Reorder quantity is required',
                  min: { value: 1, message: 'Reorder quantity must be at least 1' }
                })}
                type="number"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
                placeholder="50"
              />
              {errors.reorder_quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.reorder_quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Number
              </label>
              <input
                {...register('batch_number')}
                type="text"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
                placeholder="Enter batch number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date
              </label>
              <input
                {...register('expiration_date')}
                type="date"
                className="input text-sm sm:text-base"
                disabled={isReadOnly}
              />
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

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Current/Preview Image */}
                <div className="flex-shrink-0">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-primary-500">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center">New Image</p>
                    </div>
                  ) : (isEdit || mode === 'view') && product?.image ? (
                    <div className="relative">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                        <img
                          src={getImageUrl(product.image, config.base_image_url)}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center">Current Image</p>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Upload Input */}
                {!isReadOnly && (
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 transition-colors">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Click to upload
                          </span>
                          <span className="text-sm text-gray-500"> or drag and drop</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB
                        </p>
                        <input
                          id="image-upload"
                          {...register('image', {
                            onChange: handleImageChange
                          })}
                          type="file"
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {isEdit ? 'Upload new image to replace current one (optional)' : 'Upload product image (optional)'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('pro_description')}
                rows={3}
                className="input text-sm sm:text-base resize-none"
                disabled={isReadOnly}
                placeholder="Enter product description"
              />
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
                {isEdit ? 'Update Product' : 'Create Product'}
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

export default ProductModal

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Grid, List, Image, X, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { categoryService } from '../services/categoryService'

const CategoriesPage = () => {
  const { hasPermission } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  
  // Permission checks
  const canCreate = hasPermission(['create', 'create_category'])
  const canUpdate = hasPermission(['update', 'update_category'])
  const canDelete = hasPermission(['delete', 'delete_category'])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    image: null,
    imagePreview: null
  })

  // Fetch categories from API
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryService.getAll()
      console.log('CategoriesPage: Raw response:', response)
      
      // Handle different response formats
      let categoriesData = []
      
      if (Array.isArray(response)) {
        // Direct array response
        categoriesData = response
      } else if (response.data?.success) {
        // Nested success response
        categoriesData = response.data.data || []
      } else if (response.data) {
        // Response with data property
        categoriesData = Array.isArray(response.data) ? response.data : []
      } else if (response.success) {
        // Success response at root level
        categoriesData = response.data || []
      }
      
      console.log('CategoriesPage: Processed categories:', categoriesData)
      setCategories(categoriesData)
      setError(null)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (category) => {
    if (category.image_url && (category.image_url.startsWith('http') || category.image_url.startsWith('https'))) {
      return category.image_url
    }
    
    if (category.image) {
      if (category.image.startsWith('http')) {
        return category.image
      }
      return `http://localhost:8000/storage/${category.image}`
    }
    
    return null
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleCreate = () => {
    setSelectedCategory(null)
    setFormData({
      name: '',
      description: '',
      status: 'active',
      image: null,
      imagePreview: null
    })
    setFormErrors({})
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.cat_name || category.name,
      description: category.cat_desc || category.description,
      status: category.status,
      image: null,
      imagePreview: getImageUrl(category)
    })
    setFormErrors({})
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDelete = async (category) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុប "${category.cat_name || category.name}" មែនទេ?`)) {
      try {
        const result = await categoryService.delete(category.id)
        
        // Remove from list immediately (no refresh needed)
        setCategories(prev => prev.filter(cat => cat.id !== category.id))
        toast.success('✅ បានលុប Category ដោយជោគជ័យ!', {
          duration: 3000,
          position: 'top-right'
        })
        
      } catch (err) {
        console.error('Error deleting category:', err)
        
        // Handle force delete case
        if (err.response?.status === 422 && err.response?.data?.can_force_delete) {
          const productCount = err.response.data.product_count
          const forceConfirm = window.confirm(
            `"${category.name}" មាន ${productCount} ផលិតផល។\n\n` +
            `ជ្រើសរើស:\n` +
            `• OK: លុប category និង products ទាំងអស់ (អចិន្ត្រៃយ៍)\n` +
            `• Cancel: រក្សាទុក\n\n` +
            `⚠️ ការព្រមាន: នេះនឹងលុបផលិតផលទាំងអស់!`
          )
          
          if (forceConfirm) {
            try {
              await categoryService.delete(category.id, true) // force delete
              setCategories(prev => prev.filter(cat => cat.id !== category.id))
              toast.success('✅ Category និង products ត្រូវបានលុបដោយជោគជ័យ!', {
                duration: 4000,
                position: 'top-right'
              })
            } catch (forceError) {
              console.error('Force delete failed:', forceError)
              toast.error('❌ មិនអាចលុបបាន។ សូមព្យាយាមម្តងទៀត។')
            }
          }
        } else {
          toast.error('❌ មិនអាចលុប category បាន។ សូមព្យាយាមម្តងទៀត។')
        }
      }
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    // Clear previous errors
    setFormErrors({})
    
    if (!formData.name.trim()) {
      setFormErrors(prev => ({ ...prev, name: 'Category name is required' }))
      return
    }
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description || '')
      formDataToSend.append('status', formData.status)
      
      // Only append image if a new file was selected
      if (formData.image && formData.image instanceof File) {
        formDataToSend.append('image', formData.image)
        console.log('Adding new image file to FormData:', formData.image.name)
      } else {
        console.log('No new image file selected, skipping image field')
      }
      
      let result
      if (modalMode === 'create') {
        result = await categoryService.create(formDataToSend)
        
        // Add new category to list immediately (no refresh needed)
        if (result.success && result.data) {
          setCategories(prev => [result.data, ...prev])
          toast.success('✅ បានបង្កើត Category ដោយជោគជ័យ!', {
            duration: 3000,
            position: 'top-right'
          })
        }
      } else {
        result = await categoryService.update(selectedCategory.id, formDataToSend)
        
        // Update category in list immediately (no refresh needed)
        if (result.success && result.data) {
          setCategories(prev => prev.map(cat => 
            cat.id === selectedCategory.id ? result.data : cat
          ))
          toast.success('✅ បានកែប្រែ Category ដោយជោគជ័យ!', {
            duration: 3000,
            position: 'top-right'
          })
        }
      }
      
      setModalOpen(false)
      // No need to fetchCategories() - we update the list directly!
    } catch (err) {
      console.error('Error saving category:', err)
      
      // Handle validation errors
      if (err.response?.status === 422) {
        console.error('Validation errors:', err.response.data)
        const errors = err.response.data.errors || {}
        setFormErrors(errors)
        
        // Show detailed error information in Khmer
        const errorMessage = err.response.data.message || 'ការបញ្ជាក់ទិន្នន័យមិនត្រឹមត្រូវ'
        const errorDetails = Object.keys(errors).length > 0 
          ? '\n\nលម្អិត:\n' + Object.entries(errors).map(([field, msgs]) => {
              const fieldName = field === 'name' ? 'ឈ្មោះ' : 
                               field === 'description' ? 'ការពិពណ៌នា' : 
                               field === 'image' ? 'រូបភាព' : field
              return `${fieldName}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
            }).join('\n')
          : ''
        
        toast.error(`❌ ${errorMessage}${errorDetails}`, {
          duration: 5000,
          position: 'top-right'
        })
      } else {
        console.error('Non-validation error:', err.response?.data || err.message)
        toast.error('❌ មិនអាចរក្សាទុក category បាន។ សូមព្យាយាមម្តងទៀត។')
      }
    }
  }

  console.log('CategoriesPage: Current categories state:', categories)
  console.log('CategoriesPage: Categories length:', categories.length)
  
  const filteredCategories = categories.filter(category =>
    (category.name || category.cat_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description || category.cat_desc || '').toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  console.log('CategoriesPage: Filtered categories:', filteredCategories)

  const totalCategories = filteredCategories.length
  const activeCategories = filteredCategories.filter(c => c.status === 'active').length
  const inactiveCategories = filteredCategories.filter(c => c.status === 'inactive').length
  const categoriesWithImages = filteredCategories.filter(c => getImageUrl(c)).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage your product categories</p>
          </div>
          {canCreate && (
            <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              បន្ថែម Category
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Image className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeCategories}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-lg text-green-600">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{inactiveCategories}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <span className="text-lg text-red-600">✗</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">With Images</p>
                <p className="text-2xl font-bold text-purple-600">{categoriesWithImages}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Image className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map(category => (
              <div key={category.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-200">
                  {getImageUrl(category) ? (
                    <img
                      src={getImageUrl(category)}
                      alt={category.cat_name || category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : (
                    <Image className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{category.cat_name || category.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.cat_desc || category.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.status}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(category.created_at)}</span>
                  </div>

                  <div className="flex gap-2">
                    {canUpdate && (
                      <button
                        onClick={() => handleEdit(category)}
                        className="flex-1 text-blue-600 hover:text-blue-800 font-medium text-sm py-2 border border-blue-200 rounded hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(category)}
                        className="flex-1 text-red-600 hover:text-red-800 font-medium text-sm py-2 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map(category => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
                          {getImageUrl(category) ? (
                            <img
                              src={getImageUrl(category)}
                              alt={category.cat_name || category.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : (
                            <Image className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{category.cat_name || category.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 truncate max-w-xs block">{category.cat_desc || category.description}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{formatDate(category.created_at)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {canUpdate && (
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(category)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredCategories.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first category'}
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Debug: Categories array length: {categories.length}, Loading: {loading.toString()}, Error: {error || 'none'}
            </div>
          </div>
        )}

        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Add New Category' : 'Edit Category'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {formErrors.status && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
                  </label>
                  <div className="mt-2">
                    {formData.imagePreview && (
                      <div className="mb-4">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                    <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <Upload className="w-5 h-5 mr-2 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {formData.imagePreview ? 'Change Image' : 'Upload Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {formErrors.image && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.image}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {modalMode === 'create' ? 'Create' : 'Update'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoriesPage
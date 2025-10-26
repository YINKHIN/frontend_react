import { useState } from 'react'
import { Plus, Search, Edit, Trash2, FolderOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCategories, useDeleteCategory } from '../hooks/useCategories'
import LoadingSpinner from '../components/LoadingSpinner'
import CategoryModal from '../components/CategoryModal'
import { formatDate } from '../utils/helper'

const CategoriesPage = () => {
  const { hasPermission } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')

  const { data: categoriesResponse, isLoading, error } = useCategories()
  const deleteCategory = useDeleteCategory()

  // Handle different API response formats
  const categories = categoriesResponse?.data || categoriesResponse || []
  const isArray = Array.isArray(categories)

  const handleCreate = () => {
    setSelectedCategory(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await deleteCategory.mutateAsync(category.id)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  if (isLoading) return <LoadingSpinner className="h-64" />
  if (error) return <div className="text-red-600">Error loading categories</div>

  const canCreate = hasPermission(['create'])
  const canUpdate = hasPermission(['update'])
  const canDelete = hasPermission(['delete'])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage product categories</p>
        </div>
        {canCreate && (
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-head">Name</th>
                <th className="table-head">Description</th>
                <th className="table-head">Created</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isArray && categories?.map((category) => (
                <tr key={category.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <FolderOpen className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-600">{category.description || 'N/A'}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-500">
                      {formatDate(category.created_at)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      {canUpdate && (
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(category)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {modalOpen && (
        <CategoryModal
          category={selectedCategory}
          mode={modalMode}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

export default CategoriesPage
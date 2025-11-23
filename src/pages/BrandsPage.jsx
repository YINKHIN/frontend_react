import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBrands, useDeleteBrand } from '../hooks/useBrands'
import LoadingSpinner from '../components/LoadingSpinner'
import BrandModal from '../components/BrandModal'
import { formatDate } from '../utils/helper'

const BrandsPage = () => {
  const { hasPermission } = useAuth()
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')

  const { data: brandsResponse, isLoading, error, refetch } = useBrands()
  const deleteBrand = useDeleteBrand()

  // Handle different API response formats
  const brands = brandsResponse?.data || brandsResponse || []
  const [list, setList] = useState([])
  useEffect(() => {
    if (Array.isArray(brands)) setList(brands)
  }, [brands])
  const isArray = Array.isArray(list)

  const handleCreate = () => {
    setSelectedBrand(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEdit = (brand) => {
    setSelectedBrand(brand)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDelete = async (brand) => {
    if (window.confirm(`Are you sure you want to delete "${brand.name}"?`)) {
      try {
        setList(prev => prev.filter(b => b.id !== brand.id))
        await deleteBrand.mutateAsync(brand.id)
        refetch()
      } catch (error) {
        console.error('Delete failed:', error)
        refetch()
      }
    }
  }

  if (isLoading && !brandsResponse) return <LoadingSpinner className="h-64" />
  if (error) return <div className="text-red-600">Error loading brands</div>

  const canCreate = hasPermission(['create'])
  const canUpdate = hasPermission(['update'])
  const canDelete = hasPermission(['delete'])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600">Manage product brands</p>
        </div>
        {canCreate && (
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Brand
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-head">Name</th>
                <th className="table-head">Code</th>
                <th className="table-head">Created</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isArray && list?.map((brand) => (
                <tr key={brand.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <Tag className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{brand.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-600">{brand.code || 'N/A'}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-500">
                      {formatDate(brand.created_at)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      {canUpdate && (
                        <button
                          onClick={() => handleEdit(brand)}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(brand)}
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
        <BrandModal
          brand={selectedBrand}
          mode={modalMode}
          onClose={() => setModalOpen(false)}
          onSuccess={({ type, brand: changedBrand }) => {
            if (changedBrand) {
              setList(prev => {
                if (type === 'create') return [changedBrand, ...prev]
                if (type === 'update') return prev.map(b => b.id === changedBrand.id ? { ...b, ...changedBrand } : b)
                return prev
              })
            }
            refetch()
          }}
        />
      )}
    </div>
  )
}

export default BrandsPage

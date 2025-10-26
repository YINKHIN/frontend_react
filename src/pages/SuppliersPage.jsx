import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Truck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSuppliers, useDeleteSupplier } from '../hooks/useSuppliers'
import LoadingSpinner from '../components/LoadingSpinner'
import SupplierModal from '../components/SupplierModal'
import ApiDebugger from '../components/ApiDebugger'
import { formatDate } from '../utils/helper'

const SuppliersPage = () => {
  const { hasPermission } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')

  const { data: suppliersResponse, isLoading, error } = useSuppliers()
  const deleteSupplier = useDeleteSupplier()

  // Handle different API response formats
  const suppliers = suppliersResponse?.data?.data || suppliersResponse?.data || suppliersResponse || []

  const handleCreate = () => {
    setSelectedSupplier(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDelete = async (supplier) => {
    if (window.confirm(`Are you sure you want to delete "${supplier.supplier}"?`)) {
      try {
        await deleteSupplier.mutateAsync(supplier.id)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  if (isLoading) return <LoadingSpinner className="h-64" />
  if (error) return <div className="text-red-600">Error loading suppliers</div>

  const canCreate = hasPermission(['create'])
  const canUpdate = hasPermission(['update'])
  const canDelete = hasPermission(['delete'])

  const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter(supplier =>
    supplier.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.sup_con.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600">Manage your suppliers</p>
        </div>
        {canCreate && (
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </button>
        )}
      </div>

      {/* Temporary API Debugger */}
      <ApiDebugger />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-head">Supplier</th>
                <th className="table-head">Contact</th>
                <th className="table-head">Address</th>
                <th className="table-head">Created</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <Truck className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{supplier.supplier}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-600">{supplier.sup_con}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-600">{supplier.sup_add}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-500">
                      {formatDate(supplier.created_at)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      {canUpdate && (
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(supplier)}
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

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first supplier'}
            </p>
          </div>
        )}
      </div>

      {modalOpen && (
        <SupplierModal
          supplier={selectedSupplier}
          mode={modalMode}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

export default SuppliersPage
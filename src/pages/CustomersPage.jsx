import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Users, Eye } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCustomers, useDeleteCustomer } from '../hooks/useCustomers'
import LoadingSpinner from '../components/LoadingSpinner'
import CustomerModal from '../components/CustomerModal'
import { formatDate } from '../utils/helper'

const CustomersPage = () => {
  const { hasPermission } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')

  const { data: customersResponse, isLoading, error, refetch } = useCustomers()
  const deleteCustomer = useDeleteCustomer()

  // Local list for optimistic UI
  const [list, setList] = useState([])
  
  useEffect(() => {
    // Handle different API response formats
    const customers = customersResponse?.data?.data || customersResponse?.data || customersResponse || []
    if (Array.isArray(customers) && customers.length >= 0) {
      setList(customers)
    }
  }, [customersResponse])

  const handleCreate = () => {
    setSelectedCustomer(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleView = (customer) => {
    setSelectedCustomer(customer)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleEdit = (customer) => {
    setSelectedCustomer(customer)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDelete = async (customer) => {
    if (window.confirm(`Are you sure you want to delete "${customer.cus_name}"?`)) {
      try {
        setList(prev => prev.filter(c => c.id !== customer.id))
        await deleteCustomer.mutateAsync(customer.id)
        refetch()
      } catch (error) {
        console.error('Delete failed:', error)
        refetch()
      }
    }
  }

  if (isLoading && !customersResponse) return <LoadingSpinner className="h-64" />
  if (error) return <div className="text-red-600">Error loading customers</div>

  const canCreate = hasPermission(['create'])
  const canUpdate = hasPermission(['update'])
  const canDelete = hasPermission(['delete'])

  const filteredCustomers = Array.isArray(list) ? list.filter(customer =>
    customer.cus_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.cus_contact?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customers</p>
        </div>
        {canCreate && (
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search customers by name or contact..."
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
                <th className="table-head">Customer</th>
                <th className="table-head">Contact</th>
                <th className="table-head">Created</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{customer.cus_name}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-600">{customer.cus_contact || 'N/A'}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-500">
                      {formatDate(customer.created_at)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(customer)}
                        className="text-gray-400 hover:text-gray-600"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canUpdate && (
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-blue-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(customer)}
                          className="text-red-400 hover:text-red-600"
                          title="Delete"
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

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first customer'}
            </p>
          </div>
        )}
      </div>

      {modalOpen && (
        <CustomerModal
          customer={selectedCustomer}
          mode={modalMode}
          onClose={() => setModalOpen(false)}
          onSuccess={({ type, customer: changedCustomer }) => {
            if (changedCustomer) {
              setList(prev => {
                if (type === 'create') return [changedCustomer, ...prev]
                if (type === 'update') return prev.map(c => c.id === changedCustomer.id ? { ...c, ...changedCustomer } : c)
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

export default CustomersPage
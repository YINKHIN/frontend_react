import { useState } from 'react'
import { CreditCard, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePayments, useDeletePayment, useCreatePayment, useUpdatePayment } from '../hooks/usePayments'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/helper'
import PaymentModal from '../components/PaymentModal'

const PaymentsPage = () => {
  const { user, hasPermission } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  
  const { data: paymentsResponse, isLoading, error, refetch } = usePayments()
  const deletePayment = useDeletePayment()
  const createPayment = useCreatePayment()
  const updatePayment = useUpdatePayment()

  // Handle different API response formats
  const payments = paymentsResponse?.data?.data || paymentsResponse?.data || paymentsResponse || []
  
  const canCreatePayment = hasPermission(['create_payment', 'create'])
  const canUpdatePayment = hasPermission(['update_payment', 'update'])
  const canDeletePayment = hasPermission(['delete_payment', 'delete'])

  const handleNewPayment = () => {
    setSelectedPayment(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDeletePayment = async (payment) => {
    if (window.confirm(`Are you sure you want to delete payment #${payment.id}?`)) {
      try {
        await deletePayment.mutateAsync(payment.id)
        await refetch()
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const handleSavePayment = async (paymentData) => {
    try {
      if (modalMode === 'edit') {
        await updatePayment.mutateAsync({ id: selectedPayment.id, data: paymentData })
      } else {
        await createPayment.mutateAsync(paymentData)
      }
      await refetch()
      setModalOpen(false)
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const filteredPayments = Array.isArray(payments) ? payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase()
    return payment.full_name?.toLowerCase().includes(searchLower) ||
           payment.order?.cus_name?.toLowerCase().includes(searchLower) ||
           payment.id.toString().includes(searchLower)
  }) : []

  if (isLoading) return <LoadingSpinner className="h-64" />
  if (error) return <div className="text-red-600">Error loading payments: {error.message}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">
            {user?.type === 'staff_sale' 
              ? 'Manage payments' 
              : 'View payments'
            }
          </p>
        </div>
        {canCreatePayment && (
          <button onClick={handleNewPayment} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Payment
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search payments..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deposit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{payment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(payment.pay_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{payment.ord_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.order?.cus_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.staff?.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(payment.total)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(payment.deposit)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(payment.remain)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.remain <= 0.01 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.remain <= 0.01 ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canUpdatePayment && (
                          <button
                            onClick={() => handleEditPayment(payment)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canDeletePayment && (
                          <button
                            onClick={() => handleDeletePayment(payment)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {modalOpen && (
        <PaymentModal
          payment={selectedPayment}
          mode={modalMode}
          onClose={() => setModalOpen(false)}
          onSave={handleSavePayment}
        />
      )}
    </div>
  )
}

export default PaymentsPage
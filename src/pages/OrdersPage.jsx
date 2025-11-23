import { useState, useEffect, useMemo } from 'react'
import { ShoppingCart, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useOrders, useDeleteOrder, useCreateOrder, useUpdateOrder } from '../hooks/useOrders'
import { orderService } from '../services/orderService'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/helper'
import OrderModal from '../components/OrderModal'

const OrdersPage = () => {
  const { user, hasPermission } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  
  const { data: ordersResponse, isLoading, error, refetch } = useOrders()
  const deleteOrder = useDeleteOrder()
  const createOrder = useCreateOrder()
  const updateOrder = useUpdateOrder()

  // Handle different API response formats
  // Use memoized value to prevent unnecessary re-renders
  const ordersRaw = useMemo(() => {
    return ordersResponse?.data?.data || ordersResponse?.data || ordersResponse || []
  }, [ordersResponse])
  
  // Deduplicate by id to avoid duplicate rows in table (e.g., due to double fetches)
  const orders = useMemo(() => {
    return Array.isArray(ordersRaw)
      ? Object.values(ordersRaw.reduce((acc, o) => {
          if (!o || !o.id) return acc
          acc[o.id] = acc[o.id] ? { ...acc[o.id], ...o } : o
          return acc
        }, {}))
      : []
  }, [ordersRaw])
  
  const canCreateOrder = hasPermission(['create_order', 'create'])
  const canUpdateOrder = hasPermission(['update_order', 'update'])
  const canDeleteOrder = hasPermission(['delete_order', 'delete'])

  const handleNewOrder = () => {
    setSelectedOrder(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleViewOrder = async (order) => {
    try {
      // Fetch full order with details for viewing
      const response = await orderService.getById(order.id)
      const fullOrder = response?.data?.data || response?.data || response
      setSelectedOrder(fullOrder || order)
      setModalMode('view')
      setModalOpen(true)
    } catch (error) {
      console.error('Failed to fetch order details:', error)
      // Fallback to using the order from list if fetch fails
      setSelectedOrder(order)
      setModalMode('view')
      setModalOpen(true)
    }
  }

  const handleEditOrder = async (order) => {
    try {
      // Fetch full order with details for editing
      const response = await orderService.getById(order.id)
      const fullOrder = response?.data?.data || response?.data || response
      setSelectedOrder(fullOrder || order)
      setModalMode('edit')
      setModalOpen(true)
    } catch (error) {
      console.error('Failed to fetch order details:', error)
      // Fallback to using the order from list if fetch fails
      setSelectedOrder(order)
      setModalMode('edit')
      setModalOpen(true)
    }
  }

  const handleDeleteOrder = async (order) => {
    if (window.confirm(`Are you sure you want to delete order #${order.id}?`)) {
      try {
        await deleteOrder.mutateAsync(order.id)
        await refetch()
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const handleSaveOrder = async (orderData) => {
    try {
      if (modalMode === 'edit') {
        await updateOrder.mutateAsync({ id: selectedOrder.id, data: orderData })
        toast.success('Order updated successfully');
        // Refetch orders after update to show latest data
        await refetch();
      } else {
        await createOrder.mutateAsync(orderData)
        toast.success('Order created successfully');
        // Refetch orders after create to show latest data
        await refetch();
      }
      // Close modal after successful save
      setModalOpen(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('Save failed:', error)
      toast.error(error.response?.data?.message || 'Failed to save order');
      // Keep modal open on error so user can retry
    }
  }

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const staffName = (order.staff?.full_name || order.full_name || '').toLowerCase()
    const customerName = (order.cus_name || '').toLowerCase()
    const orderId = order.id?.toString() || ''
    return staffName.includes(searchLower) ||
           customerName.includes(searchLower) ||
           orderId.includes(searchLower)
  }) : []

  if (isLoading) return <LoadingSpinner className="h-64" />
  if (error) return <div className="text-red-600">Error loading orders: {error.message}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">
            {user?.type === 'staff_sale' 
              ? 'Manage sales orders' 
              : 'View orders'
            }
          </p>
        </div>
        {canCreateOrder && (
          <button onClick={handleNewOrder} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Order
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
              placeholder="Search orders..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  // Calculate total paid for this order
                  // Handle both camelCase and snake_case for payments
                  const payments = order.payments || order.payment || []
                  const totalPaid = Array.isArray(payments)
                    ? payments.reduce((sum, payment) => sum + parseFloat(payment.deposit || payment.total || payment.amount || 0), 0)
                    : 0
                  const remaining = parseFloat(order.total || 0) - totalPaid
                  const isPaid = remaining <= 0.01
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.ord_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.cus_name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.staff?.full_name || order.full_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* Handle both camelCase and snake_case naming conventions */}
                        {(order.orderDetails?.length || order.order_details?.length || 0)} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isPaid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canUpdateOrder && (
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDeleteOrder && (
                            <button
                              onClick={() => handleDeleteOrder(order)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal - Show for all modes including create */}
      {modalOpen && (
        <OrderModal
          order={selectedOrder}
          mode={modalMode}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveOrder}
        />
      )}
    </div>
  )
}

export default OrdersPage
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { X, Plus, Trash2 } from 'lucide-react';
import { useCreatePayment, useUpdatePayment } from '../hooks/usePayments';
import { useOrders } from '../hooks/useOrders';
import { useStaffs } from '../hooks/useStaffs';

const PaymentModal = ({ payment, mode, onClose, onSave }) => {
  const isReadOnly = mode === 'view';
  const isEdit = mode === 'edit';
  
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  
  // Get data for dropdowns
  const { data: ordersResponse } = useOrders();
  const { data: staffsResponse } = useStaffs();
  
  const orders = ordersResponse?.data?.data || ordersResponse?.data || ordersResponse || [];
  const staffs = staffsResponse?.data?.data || staffsResponse?.data || staffsResponse || [];
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      pay_date: '',
      staff_id: '',
      ord_code: '',
      total: '',
      deposit: '',
      remain: '',
      payment_method: '',
      ...payment
    }
  });

  const selectedOrderId = watch('ord_code');
  const total = watch('total');
  const deposit = watch('deposit');

  useEffect(() => {
    if (payment) {
      // Format date to YYYY-MM-DD for HTML date input
      const formattedDate = payment.pay_date ? 
        new Date(payment.pay_date).toISOString().split('T')[0] : '';
      
      const resetData = {
        pay_date: formattedDate,
        staff_id: payment.staff_id || '',
        ord_code: payment.ord_code || '',
        total: payment.total || '',
        deposit: payment.deposit || '',
        remain: payment.remain || '',
        payment_method: payment.payment_method || ''
      };
      
      reset(resetData);
    } else {
      // Reset form for new payment
      reset({
        pay_date: '',
        staff_id: '',
        ord_code: '',
        total: '',
        deposit: '',
        remain: '',
        payment_method: ''
      });
    }
  }, [payment, reset]);

  // Calculate remaining amount when total or deposit changes
  useEffect(() => {
    if (total && deposit) {
      const remaining = parseFloat(total) - parseFloat(deposit);
      setValue('remain', remaining.toFixed(2));
    }
  }, [total, deposit, setValue]);

  // Auto-fill order details when order is selected
  useEffect(() => {
    if (selectedOrderId && orders.length > 0) {
      const selectedOrder = orders.find(o => o.id === parseInt(selectedOrderId));
      if (selectedOrder) {
        setValue('total', selectedOrder.total);
        // Set default payment method
        if (!payment?.payment_method) {
          setValue('payment_method', 'cash');
        }
      }
    }
  }, [selectedOrderId, orders, payment, setValue]);

  const onSubmit = async (data) => {
    try {
      const submitData = {
        pay_date: data.pay_date,
        staff_id: parseInt(data.staff_id),
        ord_code: parseInt(data.ord_code),
        total: parseFloat(data.total),
        deposit: parseFloat(data.deposit),
        remain: parseFloat(data.remain),
        payment_method: data.payment_method
      };

      if (isEdit) {
        await updatePayment.mutateAsync({ id: payment.id, data: submitData });
        toast.success('Payment updated successfully');
      } else {
        await createPayment.mutateAsync(submitData);
        toast.success('Payment created successfully');
      }

      onSave(submitData);
    } catch (error) {
      console.error('Submit failed:', error);
      toast.error(error.response?.data?.message || 'Failed to save payment');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Payment' : 
             mode === 'edit' ? 'Edit Payment' : 'Payment Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date *
                </label>
                <input
                  {...register('pay_date', { required: 'Payment date is required' })}
                  type="date"
                  className="w-full input"
                  disabled={isReadOnly}
                />
                {errors.pay_date && (
                  <p className="mt-1 text-xs text-red-600">{errors.pay_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Member *
                </label>
                <select
                  {...register('staff_id', { required: 'Staff member is required' })}
                  className="w-full input"
                  disabled={isReadOnly}
                >
                  <option value="">Select Staff Member</option>
                  {staffs.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.full_name}
                    </option>
                  ))}
                </select>
                {errors.staff_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.staff_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order *
                </label>
                <select
                  {...register('ord_code', { required: 'Order is required' })}
                  className="w-full input"
                  disabled={isReadOnly}
                >
                  <option value="">Select Order</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      Order #{order.id} - {order.cus_name} (${order.total})
                    </option>
                  ))}
                </select>
                {errors.ord_code && (
                  <p className="mt-1 text-xs text-red-600">{errors.ord_code.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  {...register('payment_method', { required: 'Payment method is required' })}
                  className="w-full input"
                  disabled={isReadOnly}
                >
                  <option value="">Select Payment Method</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
                {errors.payment_method && (
                  <p className="mt-1 text-xs text-red-600">{errors.payment_method.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount *
                </label>
                <input
                  {...register('total', { 
                    required: 'Total amount is required',
                    min: { value: 0, message: 'Total must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  className="w-full input"
                  disabled={true}
                  placeholder="0.00"
                />
                {errors.total && (
                  <p className="mt-1 text-xs text-red-600">{errors.total.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit Amount *
                </label>
                <input
                  {...register('deposit', { 
                    required: 'Deposit amount is required',
                    min: { value: 0, message: 'Deposit must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  className="w-full input"
                  disabled={isReadOnly}
                  placeholder="0.00"
                />
                {errors.deposit && (
                  <p className="mt-1 text-xs text-red-600">{errors.deposit.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remaining Amount
                </label>
                <input
                  {...register('remain')}
                  type="number"
                  step="0.01"
                  className="w-full input bg-gray-100"
                  disabled={true}
                  placeholder="0.00"
                />
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {isEdit ? 'Update Payment' : 'Create Payment'}
                </button>
              </div>
            )}
            
            {isReadOnly && (
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { X, Plus, Trash2, Package, Calculator } from 'lucide-react';
import { useCreateOrder, useUpdateOrder } from '../hooks/useOrders';
import { useStaffs } from '../hooks/useStaffs';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import { formatCurrency } from '../utils/helper';

const OrderModal = ({ order, mode, onClose, onSave }) => {
  const isReadOnly = mode === 'view';
  const isEdit = mode === 'edit';
  
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  
  // Get data for dropdowns
  const { data: staffsResponse } = useStaffs();
  const { data: customersResponse } = useCustomers();
  const { data: productsResponse } = useProducts();
  
  const staffs = staffsResponse?.data?.data || staffsResponse?.data || staffsResponse || [];
  const customers = customersResponse?.data?.data || customersResponse?.data || customersResponse || [];
  const products = productsResponse?.data?.data || productsResponse?.data || productsResponse || [];
  
  // State for managing order details
  const [orderDetails, setOrderDetails] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      ord_date: '',
      staff_id: '',
      cus_id: '',
      cus_name: '',
      total: '',
      subtotal: '',
      tax: '',
      tax_percent: '',
      discount: '',
      discount_percent: '',
      ...order
    }
  });

  const selectedCustomerId = watch('cus_id');
  const taxPercent = watch('tax_percent') || 0;
  const discountPercent = watch('discount_percent') || 0;
  const subtotalValue = watch('subtotal') || 0;
  const taxValue = watch('tax') || 0;
  const discountValue = watch('discount') || 0;
  const totalValue = watch('total') || 0;

  useEffect(() => {
    if (order) {
      // Format date to YYYY-MM-DD for HTML date input
      const formattedDate = order.ord_date ? 
        new Date(order.ord_date).toISOString().split('T')[0] : '';
      
      // Load existing order details for edit/view mode FIRST
      // Handle both naming conventions: order_details (snake_case) and orderDetails (camelCase)
      const orderDetailsData = order.order_details || order.orderDetails || [];
      
      let loadedDetails = [];
      if (orderDetailsData && orderDetailsData.length > 0) {
        loadedDetails = orderDetailsData.map(detail => ({
          pro_code: parseInt(detail.pro_code || detail.product_id || detail.prod_id || 0),
          pro_name: detail.pro_name || detail.product_name || detail.prod_name || 'Unknown Product',
          qty: parseInt(detail.qty || detail.quantity || 0),
          price: parseFloat(detail.price || detail.unit_price || 0),
          amount: parseFloat(detail.amount || (detail.qty || detail.quantity) * (detail.price || detail.unit_price) || 0)
        }));
      }
      
      // Calculate subtotal from loaded details (will be recalculated in useEffect)
      const calculatedSubtotal = loadedDetails.length > 0
        ? loadedDetails.reduce((sum, detail) => sum + parseFloat(detail.amount || 0), 0)
        : 0;
      
      const resetData = {
        ord_date: formattedDate,
        staff_id: order.staff_id || '',
        cus_id: order.cus_id || '',
        cus_name: order.cus_name || '',
        total: order.total || '0.00',
        subtotal: calculatedSubtotal > 0 ? calculatedSubtotal.toFixed(2) : (order.subtotal || '0.00'),
        tax: order.tax || '0.00',
        tax_percent: order.tax_percent || '0',
        discount: order.discount || '0.00',
        discount_percent: order.discount_percent || '0'
      };
      
      reset(resetData);
      
      // Set order details after reset (this will trigger the calculation useEffect)
      setOrderDetails(loadedDetails);
    } else {
      // Reset form for new order
      reset({
        ord_date: '',
        staff_id: '',
        cus_id: '',
        cus_name: '',
        total: '0.00',
        subtotal: '0.00',
        tax: '0.00',
        tax_percent: '0',
        discount: '0.00',
        discount_percent: '0'
      });
      setOrderDetails([]);
    }
  }, [order, reset]);

  // Calculate totals from order details
  useEffect(() => {
    // Always calculate subtotal from order details (even if empty)
    const subtotal = orderDetails.length > 0
      ? orderDetails.reduce((sum, detail) => sum + parseFloat(detail.amount || 0), 0)
      : 0;
    
    setValue('subtotal', subtotal.toFixed(2));
    
    // Get current form values for tax and discount percentages
    const taxPercentValue = parseFloat(watch('tax_percent')) || 0;
    const taxAmount = subtotal * (taxPercentValue / 100);
    setValue('tax', taxAmount.toFixed(2));
    
    const discountPercentValue = parseFloat(watch('discount_percent')) || 0;
    const discountAmount = subtotal * (discountPercentValue / 100);
    setValue('discount', discountAmount.toFixed(2));
    
    const total = subtotal + taxAmount - discountAmount;
    setValue('total', total.toFixed(2));
  }, [orderDetails, setValue, watch]);

  // Auto-fill customer name when customer is selected
  useEffect(() => {
    if (selectedCustomerId && customers.length > 0) {
      const selectedCustomer = customers.find(c => c.id === parseInt(selectedCustomerId));
      if (selectedCustomer) {
        setValue('cus_name', selectedCustomer.cus_name);
      }
    }
  }, [selectedCustomerId, customers, setValue]);

  // Product management functions
  const addProduct = (productData) => {
    // Validate input data
    if (!productData.pro_code || !productData.qty || !productData.price) {
      toast.error('Please fill all required product fields');
      return;
    }
    
    const productId = parseInt(productData.pro_code);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      toast.error('Product not found');
      return;
    }

    const qty = parseInt(productData.qty);
    const price = parseFloat(productData.price);
    
    // Validate quantity and price
    if (qty <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    
    if (price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    const amount = qty * price;
    
    const newDetail = {
      pro_code: productId,
      pro_name: product.pro_name,
      qty: qty,
      price: price,
      amount: amount
    };

    setOrderDetails(prev => [...prev, newDetail]);
    setShowProductForm(false);
    
    // Show success message
    toast.success(`Added ${product.pro_name} to order`);
  };

  const removeProduct = (index) => {
    setOrderDetails(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      // Validate that order has products
      if (orderDetails.length === 0) {
        toast.error('Please add at least one product to the order');
        return;
      }

      // Ensure customer name is provided - either from selected customer or manually entered
      let customerName = data.cus_name?.trim() || '';
      
      // If customer is selected, use the customer's name
      if (data.cus_id) {
        const selectedCustomer = customers.find(c => c.id === parseInt(data.cus_id));
        if (selectedCustomer && selectedCustomer.cus_name) {
          customerName = selectedCustomer.cus_name;
        }
      }
      
      // If no customer name is available, use a default value
      if (!customerName) {
        customerName = 'Walk-in Customer';
      }

      // Ensure all required data is present
      const submitData = {
        ord_date: data.ord_date,
        staff_id: parseInt(data.staff_id),
        cus_id: data.cus_id ? parseInt(data.cus_id) : null,
        cus_name: customerName,
        total: parseFloat(data.total) || 0,
        subtotal: parseFloat(data.subtotal) || 0,
        tax: parseFloat(data.tax) || 0,
        tax_percent: parseFloat(data.tax_percent) || 0,
        discount: parseFloat(data.discount) || 0,
        discount_percent: parseFloat(data.discount_percent) || 0,
        items: orderDetails.map(detail => ({
          product_id: detail.pro_code,
          qty: detail.qty,
          price: detail.price,
          amount: detail.amount
        }))
      };

      // Validate that items array is not empty
      if (!submitData.items || submitData.items.length === 0) {
        toast.error('Please add at least one product to the order');
        return;
      }

      // Let the parent component handle the API call
      onSave(submitData);
    } catch (error) {
      console.error('Submit failed:', error);
      toast.error(error.response?.data?.message || 'Failed to save order');
    }
  };

  // New function for saving and adding another order
  const onSubmitAndAddAnother = async (data) => {
    try {
      // Validate that order has products
      if (orderDetails.length === 0) {
        toast.error('Please add at least one product to the order');
        return;
      }

      // Ensure customer name is provided - either from selected customer or manually entered
      let customerName = data.cus_name?.trim() || '';
      
      // If customer is selected, use the customer's name
      if (data.cus_id) {
        const selectedCustomer = customers.find(c => c.id === parseInt(data.cus_id));
        if (selectedCustomer && selectedCustomer.cus_name) {
          customerName = selectedCustomer.cus_name;
        }
      }
      
      // If no customer name is available, use a default value
      if (!customerName) {
        customerName = 'Walk-in Customer';
      }

      // Ensure all required data is present
      const submitData = {
        ord_date: data.ord_date,
        staff_id: parseInt(data.staff_id),
        cus_id: data.cus_id ? parseInt(data.cus_id) : null,
        cus_name: customerName,
        total: parseFloat(data.total) || 0,
        subtotal: parseFloat(data.subtotal) || 0,
        tax: parseFloat(data.tax) || 0,
        tax_percent: parseFloat(data.tax_percent) || 0,
        discount: parseFloat(data.discount) || 0,
        discount_percent: parseFloat(data.discount_percent) || 0,
        items: orderDetails.map(detail => ({
          product_id: detail.pro_code,
          qty: detail.qty,
          price: detail.price,
          amount: detail.amount
        }))
      };

      // Validate that items array is not empty
      if (!submitData.items || submitData.items.length === 0) {
        toast.error('Please add at least one product to the order');
        return;
      }

      // Let the parent component handle the API call
      onSave(submitData);

      // Reset the form for a new order, but keep the modal open
      reset({
        ord_date: data.ord_date, // Keep the date
        staff_id: data.staff_id, // Keep the staff
        cus_id: '',
        cus_name: '',
        total: '0.00',
        subtotal: '0.00',
        tax: '0.00',
        tax_percent: '0',
        discount: '0.00',
        discount_percent: '0'
      });
      setOrderDetails([]);
      setShowProductForm(false);
    } catch (error) {
      console.error('Submit failed:', error);
      toast.error(error.response?.data?.message || 'Failed to save order');
    }
  };

  // Product Form Component
  const ProductForm = ({ products, onAdd, onCancel }) => {
    const { register: productRegister, handleSubmit: productHandleSubmit, formState: { errors: productErrors }, watch: productWatch, reset: productReset, setValue: productSetValue } = useForm();
    
    const selectedProductId = productWatch('pro_code');
    const qty = productWatch('qty');
    const price = productWatch('price');
    
    // Auto-populate product data when product is selected
    useEffect(() => {
      if (selectedProductId && products.length > 0) {
        const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));
        if (selectedProduct) {
          // Auto-fill price from product price
          if (selectedProduct.sup) {
            productSetValue('price', selectedProduct.sup);
          }
        }
      }
    }, [selectedProductId, products, productSetValue]);
    
    // Calculate amount automatically
    const amount = qty && price ? (parseFloat(qty) * parseFloat(price)).toFixed(2) : '0.00';

    const onSubmit = (data) => {
      // Validate required fields
      if (!data.pro_code) {
        toast.error('Please select a product');
        return;
      }
      if (!data.qty || parseFloat(data.qty) <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }
      if (!data.price || parseFloat(data.price) <= 0) {
        toast.error('Please enter a valid price');
        return;
      }
      
      onAdd(data);
      productReset();
    };

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Add Product</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Changed from form to div to avoid nesting forms */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product *
              </label>
              <select
                {...productRegister('pro_code', { required: 'Product is required' })}
                className="w-full input"
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.pro_name}
                  </option>
                ))}
              </select>
              {productErrors.pro_code && (
                <p className="mt-1 text-xs text-red-600">{productErrors.pro_code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                {...productRegister('qty', { 
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Quantity must be at least 1' }
                })}
                type="number"
                min="1"
                className="w-full input"
                placeholder="Enter quantity"
              />
              {productErrors.qty && (
                <p className="mt-1 text-xs text-red-600">{productErrors.qty.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price *
              </label>
              <input
                {...productRegister('price', { 
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' }
                })}
                type="number"
                step="0.01"
                min="0.01"
                className="w-full input"
                placeholder="0.00"
              />
              {productErrors.price && (
                <p className="mt-1 text-xs text-red-600">{productErrors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="w-full input bg-gray-100">
                ${amount}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={productHandleSubmit(onSubmit)}
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Order' : 
             mode === 'edit' ? 'Edit Order' : 'Order Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Date *
              </label>
              <input
                {...register('ord_date', { required: 'Order date is required' })}
                type="date"
                className="w-full input"
                disabled={isReadOnly}
              />
              {errors.ord_date && (
                <p className="mt-1 text-xs text-red-600">{errors.ord_date.message}</p>
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
                Customer
              </label>
              <select
                {...register('cus_id')}
                className="w-full input"
                disabled={isReadOnly}
              >
                <option value="">Select Customer (Optional)</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.cus_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                {...register('cus_name')}
                type="text"
                className="w-full input"
                placeholder="Enter customer name"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Order Details Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setShowProductForm(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </button>
              )}
            </div>

            {showProductForm && !isReadOnly && (
              <ProductForm 
                products={products} 
                onAdd={addProduct} 
                onCancel={() => setShowProductForm(false)} 
              />
            )}

            {/* Order Details Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    {!isReadOnly && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderDetails.length > 0 ? (
                    orderDetails.map((detail, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {detail.pro_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {detail.qty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(detail.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(detail.amount)}
                        </td>
                        {!isReadOnly && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => removeProduct(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={!isReadOnly ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No products added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subtotal</label>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  {formatCurrency(subtotalValue)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tax (%) <input
                    {...register('tax_percent')}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-16 input ml-1 text-xs"
                    disabled={isReadOnly}
                  />
                </label>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  {formatCurrency(taxValue)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Discount (%) <input
                    {...register('discount_percent')}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-16 input ml-1 text-xs"
                    disabled={isReadOnly}
                  />
                </label>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  {formatCurrency(discountValue)}
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Total</label>
                <div className="mt-1 text-xl font-bold text-blue-600">
                  {formatCurrency(totalValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions - Restore "Save and Add Another" button for create mode */}
          {!isReadOnly && (
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              {mode === 'create' && (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmitAndAddAnother)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  Save and Add Another
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                {mode === 'edit' ? 'Update Order' : 'Create Order'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
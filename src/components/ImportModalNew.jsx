import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { X, Plus, Trash2, Package, Calculator } from 'lucide-react';
import { useCreateImport, useUpdateImport } from '../hooks/useImports';
import { useStaffs } from '../hooks/useStaffs';
import { useSuppliers } from '../hooks/useSuppliers';
import { useProducts } from '../hooks/useProducts';

const ImportModalNew = ({ importItem, mode, onClose, onSuccess }) => {
  const isReadOnly = mode === 'view';
  const isEdit = mode === 'edit';

  const createImport = useCreateImport();
  const updateImport = useUpdateImport();

  // Get data for dropdowns
  const { data: staffsResponse } = useStaffs();
  const { data: suppliersResponse } = useSuppliers();
  const { data: productsResponse } = useProducts();

  const staffs = staffsResponse?.data?.data || staffsResponse?.data || staffsResponse || [];
  const suppliers = suppliersResponse?.data?.data || suppliersResponse?.data || suppliersResponse || [];
  const products = productsResponse?.data?.data || productsResponse?.data || productsResponse || [];



  // State for managing import details
  const [importDetails, setImportDetails] = useState([]);
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
      imp_date: '',
      staff_id: '',
      sup_id: '',
      supplier: '',
      total: '',
      ...importItem
    }
  });

  const selectedSupplierId = watch('sup_id');

  useEffect(() => {
    if (importItem) {
      // Format date to YYYY-MM-DD for HTML date input
      const formattedDate = importItem.imp_date ?
        new Date(importItem.imp_date).toISOString().split('T')[0] : '';

      const resetData = {
        imp_date: formattedDate,
        staff_id: importItem.staff_id || '',
        sup_id: importItem.sup_id || '',
        supplier: importItem.supplier || '',
      };

      reset(resetData);

      // Load existing import details for edit/view mode
      if (importItem.importDetails && importItem.importDetails.length > 0) {
        setImportDetails(importItem.importDetails.map(detail => ({
          pro_code: parseInt(detail.pro_code),
          pro_name: detail.pro_name,
          qty: parseInt(detail.qty),
          price: parseFloat(detail.price),
          amount: parseFloat(detail.amount),
          batch_number: detail.batch_number,
          expiration_date: detail.expiration_date ?
            new Date(detail.expiration_date).toISOString().split('T')[0] : ''
        })));
      } else if (importItem.import_details && importItem.import_details.length > 0) {
        setImportDetails(importItem.import_details.map(detail => ({
          pro_code: parseInt(detail.pro_code),
          pro_name: detail.pro_name,
          qty: parseInt(detail.qty),
          price: parseFloat(detail.price),
          amount: parseFloat(detail.amount),
          batch_number: detail.batch_number,
          expiration_date: detail.expiration_date ?
            new Date(detail.expiration_date).toISOString().split('T')[0] : ''
        })));
      }
    } else {
      // Reset form for new import
      reset({
        imp_date: '',
        staff_id: '',
        sup_id: '',
        supplier: '',
        total: ''
      });
      setImportDetails([]);
    }
  }, [importItem, reset]);

  // Calculate total from import details
  useEffect(() => {
    const calculatedTotal = importDetails.reduce((sum, detail) => sum + parseFloat(detail.amount || 0), 0);
    setValue('total', calculatedTotal.toFixed(2));
  }, [importDetails, setValue]);

  // Auto-fill supplier name when supplier is selected
  useEffect(() => {
    if (selectedSupplierId && suppliers.length > 0) {
      const selectedSupplier = suppliers.find(s => s.id === parseInt(selectedSupplierId));
      if (selectedSupplier) {
        setValue('supplier', selectedSupplier.supplier);
      }
    }
  }, [selectedSupplierId, suppliers, setValue]);

  // Product management functions
  const addProduct = (productData) => {
    console.log('addProduct called with:', productData); // Debug log

    // Validate product data
    if (!productData.pro_code) {
      toast.error('Please select a product');
      return;
    }

    const product = products.find(p => p.id === parseInt(productData.pro_code));
    if (!product) {
      toast.error('Product not found');
      return;
    }

    // Check if product already exists in import details
    const existingProduct = importDetails.find(detail => detail.pro_code === parseInt(productData.pro_code));
    if (existingProduct) {
      toast.error('Product already added to this import');
      return;
    }

    const amount = parseFloat(productData.qty || 0) * parseFloat(productData.price || 0);

    const newDetail = {
      pro_code: parseInt(productData.pro_code),
      pro_name: product.pro_name,
      qty: parseInt(productData.qty || 0),
      price: parseFloat(productData.price || 0),
      amount: amount,
      batch_number: productData.batch_number || '',
      expiration_date: productData.expiration_date || ''
    };

    console.log('Adding new detail:', newDetail); // Debug log
    setImportDetails(prev => {
      const updated = [...prev, newDetail];
      console.log('Updated import details:', updated); // Debug log
      return updated;
    });
    setShowProductForm(false);

    // Focus back to the Add Product button for quick consecutive entries
    setTimeout(() => {
      const addButton = document.querySelector('[data-testid="add-product-button"]');
      if (addButton) {
        addButton.focus();
      }
    }, 100);
  };

  const removeProduct = (index) => {
    setImportDetails(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      console.log('Import details:', importDetails); // Debug log
      // Validate that import has products
      if (importDetails.length === 0) {
        toast.error('Please add at least one product to the import');
        return;
      }

      const submitData = {
        imp_date: data.imp_date,
        staff_id: parseInt(data.staff_id),
        sup_id: parseInt(data.sup_id),
        supplier: data.supplier,
        total: parseFloat(data.total),
        items: importDetails.map(detail => ({
          product_id: detail.pro_code,
          qty: detail.qty,
          price: detail.price,
          amount: detail.amount,
          batch_number: detail.batch_number || null,
          expiration_date: detail.expiration_date || null
        }))
      };

      if (isEdit) {
        await updateImport.mutateAsync({ id: importItem.id, data: submitData });
        toast.success('Import updated successfully');
      } else {
        await createImport.mutateAsync(submitData);
        // No need to show toast here - it's already shown in the hook
        // toast.success('Import created successfully');
      }

      // Call onSuccess callback if provided, otherwise just close
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Submit failed:', error);
      toast.error(error.response?.data?.message || 'Failed to save import');
    }
  };

  // Product Form Component
  const ProductForm = ({ products, onAdd, onCancel }) => {
    const {
      register: productRegister,
      formState: { errors: productErrors },
      watch: productWatch,
      reset: productReset,
      setValue: productSetValue
    } = useForm({
      defaultValues: {
        pro_code: '',
        qty: '',
        price: '',
        batch_number: '',
        expiration_date: ''
      }
    });

    const selectedProductId = productWatch('pro_code');
    const qty = productWatch('qty');
    const price = productWatch('price');

    // Auto-populate product data when product is selected
    useEffect(() => {
      if (selectedProductId && products.length > 0) {
        const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));
        if (selectedProduct) {
          // Auto-fill price from supplier price
          if (selectedProduct.upis) {
            productSetValue('price', selectedProduct.upis);
          }
        }
      }
    }, [selectedProductId, products, productSetValue]);

    // Calculate amount automatically
    const amount = qty && price ? (parseFloat(qty) * parseFloat(price)).toFixed(2) : '0.00';

    const onSubmit = (data) => {
      console.log('ProductForm onSubmit called with:', data);

      // Simple validation
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
      <div className="bg-gray-50 rounded-lg p-4 mb-4 modal-form">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Add Product</h3>
          <button
            type="button"
            onClick={(e) => {
              console.log('Cancel clicked');
              onCancel();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        <div className="space-y-3" style={{ position: 'relative', zIndex: 20 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product *
              </label>

              <select
                {...productRegister('pro_code', { required: 'Product is required' })}
                className="w-full input"
                style={{
                  position: 'relative',
                  zIndex: 1000,
                  pointerEvents: 'auto',
                  backgroundColor: 'white'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={(e) => {
                  const selectedProduct = products.find(p => p.id === parseInt(e.target.value));
                  if (selectedProduct && selectedProduct.upis) {
                    productSetValue('price', selectedProduct.upis);
                  }
                }}
              >
                <option value="">Select Product</option>
                {Array.isArray(products) && products.length > 0 ? (
                  products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.pro_name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading products...</option>
                )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Number
              </label>
              <input
                {...productRegister('batch_number')}
                type="text"
                className="w-full input"
                placeholder="Enter batch number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                {...productRegister('expiration_date')}
                type="date"
                className="w-full input"
              />
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
              onClick={() => {
                const values = productWatch();
                onSubmit(values);
              }}
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              data-testid="add-product-button"
            >
              <Plus className="w-4 h-4 inline mr-1" />
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
            {mode === 'create' ? 'Create New Import' :
              mode === 'edit' ? 'Edit Import' : 'Import Details'}
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
                  Import Date *
                </label>
                <input
                  {...register('imp_date', { required: 'Import date is required' })}
                  type="date"
                  className="w-full input"
                  disabled={isReadOnly}
                />
                {errors.imp_date && (
                  <p className="mt-1 text-xs text-red-600">{errors.imp_date.message}</p>
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
                  Supplier *
                </label>
                <select
                  {...register('sup_id', { required: 'Supplier is required' })}
                  className="w-full input"
                  disabled={isReadOnly}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplier}
                    </option>
                  ))}
                </select>
                {errors.sup_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.sup_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name
                </label>
                <input
                  {...register('supplier')}
                  type="text"
                  className="w-full input bg-gray-100"
                  disabled={true}
                  placeholder="Auto-filled from supplier selection"
                />
              </div>
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
                className="w-full input bg-gray-100"
                disabled={true}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Calculator className="w-3 h-3 mr-1" />
                Total will update automatically when you add products
              </p>
              {errors.total && (
                <p className="mt-1 text-xs text-red-600">{errors.total.message}</p>
              )}
            </div>

            {/* Import Details Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">Import Products</h3>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => setShowProductForm(true)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Product
                  </button>
                )}
              </div>

              {/* Product Form */}
              {showProductForm && !isReadOnly && (
                <ProductForm
                  products={products}
                  onAdd={addProduct}
                  onCancel={() => setShowProductForm(false)}
                />
              )}

              {/* Import Details Table */}
              {importDetails.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        {!isReadOnly && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {importDetails.map((detail, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{detail.pro_name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{detail.qty}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${parseFloat(detail.price || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{detail.batch_number || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {detail.expiration_date ?
                              new Date(detail.expiration_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">${parseFloat(detail.amount || 0).toFixed(2)}</td>
                          {!isReadOnly && (
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <button
                                type="button"
                                onClick={() => removeProduct(index)}
                                className="text-red-600 hover:text-red-900"
                                title="Remove product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Total:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${importDetails.reduce((sum, detail) => sum + parseFloat(detail.amount || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No products added to this import yet</p>
                  {!isReadOnly && (
                    <p className="text-sm text-gray-400 mt-1">Click "Add Product" to add items to this import</p>
                  )}
                </div>
              )}
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
                  {isEdit ? 'Update Import' : 'Create Import'}
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

export default ImportModalNew;

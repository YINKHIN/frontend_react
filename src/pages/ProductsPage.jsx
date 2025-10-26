import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Package, Filter, List, Grid, Power, PowerOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProducts, useDeleteProduct, useDeactivateProduct, useActivateProduct } from '../hooks/useProducts'
import LoadingSpinner from '../components/LoadingSpinner'
import ProductModal from '../components/ProductModal'
import PhotoGallery from '../components/PhotoGallery'
import { formatCurrency, formatDate, getStatusColor, getImageUrl } from '../utils/helper'
import { config } from '../utils/config'

const ProductsPage = () => {
  const { hasPermission } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // create, edit, view
  const [viewMode, setViewMode] = useState('table') // table, gallery

  const { data: productsResponse, isLoading, error } = useProducts({ search: searchTerm })
  const deleteProduct = useDeleteProduct()
  const deactivateProduct = useDeactivateProduct()
  const activateProduct = useActivateProduct()

  // Handle different API response formats
  const products = productsResponse?.data?.data || productsResponse?.data || productsResponse || []
  const isArray = Array.isArray(products)

  const handleCreate = () => {
    setSelectedProduct(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleView = (product) => {
    setSelectedProduct(product)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.pro_name}"?`)) {
      try {
        await deleteProduct.mutateAsync(product.id)
      } catch (error) {
        console.error('Delete failed:', error)

        // Check if it's a foreign key constraint error
        if (error.response?.status === 422 && error.response?.data?.message?.includes('transaction history')) {
          const shouldDeactivate = window.confirm(
            `Cannot delete "${product.pro_name}" because it has transaction history.\n\nWould you like to mark it as inactive instead?`
          )

          if (shouldDeactivate) {
            try {
              await deactivateProduct.mutateAsync(product.id)
            } catch (deactivateError) {
              console.error('Deactivate failed:', deactivateError)
            }
          }
        }
      }
    }
  }

  const handleToggleStatus = async (product) => {
    const isActive = product.status === 'active'
    const action = isActive ? 'deactivate' : 'activate'
    const mutation = isActive ? deactivateProduct : activateProduct

    if (window.confirm(`Are you sure you want to ${action} "${product.pro_name}"?`)) {
      try {
        await mutation.mutateAsync(product.id)
      } catch (error) {
        console.error(`${action} failed:`, error)
      }
    }
  }

  if (isLoading) return <LoadingSpinner className="h-64" />
  if (error) {
    console.error('Products error:', error)
    return <div className="text-red-600 p-4">Error loading products: {error.message}</div>
  }

  // Debug logging for products data
  console.log('Products data:', products)
  if (products && products.length > 0) {
    console.log('First product:', products[0])
    console.log('First product image:', products[0].image)
    console.log('First product image_url:', products[0].image_url)
    console.log('Generated image URL:', getImageUrl(products[0].image_url || products[0].image, config.base_image_url))
  }

  const canCreate = hasPermission(['create', 'create_product'])
  const canUpdate = hasPermission(['update', 'update_product'])
  const canDelete = hasPermission('delete')

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your product inventory</p>
        </div>
        {canCreate && (
          <button onClick={handleCreate} className="btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span className="sm:inline">Add Product</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9 sm:pl-10 text-sm sm:text-base"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              <span className="sm:inline">Filter</span>
            </button>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('gallery')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'gallery'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                title="Gallery View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cards View */}
      {viewMode === 'table' && (
        <div className="block sm:hidden space-y-4">
          {isArray && products?.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden border border-gray-200">
                    {(product.image_url || product.image) ? (
                      <img
                        src={product.image_url || getImageUrl(product.image, config.base_image_url)}
                        alt={product.pro_name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handleView(product)}
                        onError={(e) => {
                          console.log('Mobile image failed to load:', e.target.src)
                          e.target.style.display = 'none'
                          const fallbackIcon = e.target.parentNode.querySelector('.fallback-icon')
                          if (fallbackIcon) {
                            fallbackIcon.style.display = 'flex'
                            fallbackIcon.classList.remove('hidden')
                          }
                        }}
                        onLoad={(e) => {
                          console.log('Mobile image loaded successfully:', e.target.src)
                        }}
                      />
                    ) : null}
                    <Package className={`fallback-icon w-8 h-8 text-gray-400 ${(product.image_url || product.image) ? 'hidden' : ''}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate">{product.pro_name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.pro_description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <button
                    onClick={() => handleView(product)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canUpdate && (
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-400 hover:text-blue-600 p-1"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {canUpdate && (
                    <button
                      onClick={() => handleToggleStatus(product)}
                      className={`p-1 ${product.status === 'active'
                        ? 'text-orange-400 hover:text-orange-600'
                        : 'text-green-400 hover:text-green-600'
                        }`}
                      title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {product.status === 'active' ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium">{product.category?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Price:</span>
                  <p className="font-medium">{formatCurrency(product.sup)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <p className={`font-medium ${product.qty <= (product.reorder_point || 10)
                    ? 'text-red-600'
                    : 'text-gray-900'
                    }`}>
                    {product.qty}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)
                    }`}>
                    {product.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      {viewMode === 'table' && (
        <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Image</th>
                  <th className="table-head">Product</th>
                  <th className="table-head">Category</th>
                  <th className="table-head">Price</th>
                  <th className="table-head">Stock</th>
                  <th className="table-head">Status</th>
                  <th className="table-head">Created</th>
                  <th className="table-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isArray && products?.map((product) => (
                  <tr key={product.id} className="table-row">
                    <td className="table-cell">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                        {(product.image_url || product.image) ? (
                          <img
                            src={product.image_url || getImageUrl(product.image, config.base_image_url)}
                            alt={product.pro_name}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => handleView(product)}
                            onError={(e) => {
                              console.log('Desktop image failed to load:', e.target.src)
                              e.target.style.display = 'none'
                              const fallbackIcon = e.target.parentNode.querySelector('.fallback-icon')
                              if (fallbackIcon) {
                                fallbackIcon.style.display = 'flex'
                                fallbackIcon.classList.remove('hidden')
                              }
                            }}
                            onLoad={(e) => {
                              console.log('Desktop image loaded successfully:', e.target.src)
                            }}
                          />
                        ) : null}
                        <Package className={`fallback-icon w-8 h-8 text-gray-400 ${(product.image_url || product.image) ? 'hidden' : ''}`} />
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-gray-900">{product.pro_name}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{product.pro_description}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-900">
                        {product.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(product.sup)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`font-medium ${product.qty <= (product.reorder_point || 10)
                        ? 'text-red-600'
                        : 'text-gray-900'
                        }`}>
                        {product.qty}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)
                        }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500">
                        {formatDate(product.created_at)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(product)}
                          className="text-gray-400 hover:text-gray-600"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canUpdate && (
                          <button
                            onClick={() => handleToggleStatus(product)}
                            className={`${product.status === 'active'
                              ? 'text-orange-400 hover:text-orange-600'
                              : 'text-green-400 hover:text-green-600'
                              }`}
                            title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {product.status === 'active' ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(product)}
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

          {isArray && products?.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Gallery View */}
      {viewMode === 'gallery' && (
        <PhotoGallery
          items={products}
          title="Products"
          type="product"
        />
      )}

      {/* Product Modal */}
      {modalOpen && (
        <ProductModal
          product={selectedProduct}
          mode={modalMode}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

export default ProductsPage
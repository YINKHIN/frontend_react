import { useState } from 'react'
import { X, ZoomIn, Download, Share2, Eye } from 'lucide-react'

const PhotoGallery = ({ items, title, type = 'product' }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // grid, list

  const getImageUrl = (item) => {
    if (type === 'product') {
      return item.image_url || (item.image ? `http://localhost:8000/storage/${item.image}` : null)
    } else if (type === 'staff') {
      return item.profile?.image_url || (item.profile?.image ? `http://localhost:8000/storage/${item.profile.image}` : null)
    }
    return null
  }

  const getItemName = (item) => {
    if (type === 'product') return item.pro_name
    if (type === 'staff') return item.name
    return 'Unknown'
  }

  const getItemDetails = (item) => {
    if (type === 'product') {
      return {
        category: item.category?.name || 'No Category',
        price: `$${item.upis || 0}`,
        stock: `${item.qty || 0} units`,
        status: item.status || 'unknown'
      }
    } else if (type === 'staff') {
      return {
        position: item.position || 'Staff',
        department: item.department || 'General',
        email: item.email || 'No Email',
        status: item.status || 'active'
      }
    }
    return {}
  }

  const itemsWithImages = items?.filter(item => getImageUrl(item)) || []

  const downloadImage = (imageUrl, itemName) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${itemName.replace(/\s+/g, '_')}_image.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareImage = async (imageUrl, itemName) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${itemName} Image`,
          url: imageUrl
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(imageUrl)
      alert('Image URL copied to clipboard!')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            📸 {title} Gallery
          </h2>
          <p className="text-gray-600">
            {itemsWithImages.length} {type}s with photos
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {itemsWithImages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Photos Available</h3>
          <p className="text-gray-500">
            No {type}s have photos uploaded yet. Add some photos to see them here!
          </p>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {itemsWithImages.map((item) => {
                const imageUrl = getImageUrl(item)
                const itemName = getItemName(item)
                const details = getItemDetails(item)
                
                return (
                  <div
                    key={item.id}
                    className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedImage({ item, imageUrl, itemName, details })}
                  >
                    <div className="aspect-square bg-gray-200">
                      <img
                        src={imageUrl}
                        alt={itemName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{itemName}</h3>
                      <p className="text-xs text-gray-500 truncate">
                        {type === 'product' ? details.category : details.position}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {itemsWithImages.map((item) => {
                const imageUrl = getImageUrl(item)
                const itemName = getItemName(item)
                const details = getItemDetails(item)
                
                return (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedImage({ item, imageUrl, itemName, details })}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={itemName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{itemName}</h3>
                      <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                        {Object.entries(details).map(([key, value]) => (
                          <span key={key} className="capitalize">
                            {key}: <span className="font-medium">{value}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadImage(imageUrl, itemName)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          shareImage(imageUrl, itemName)
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            
            {/* Image */}
            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.itemName}
                className="max-w-full max-h-[70vh] object-contain"
              />
              
              {/* Image Info */}
              <div className="p-4 sm:p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedImage.itemName}
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  {Object.entries(selectedImage.details).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-500 capitalize">{key}:</span>
                      <p className="font-medium text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t">
                  <button
                    onClick={() => downloadImage(selectedImage.imageUrl, selectedImage.itemName)}
                    className="btn-secondary text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => shareImage(selectedImage.imageUrl, selectedImage.itemName)}
                    className="btn-primary text-sm"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoGallery

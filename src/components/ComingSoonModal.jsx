import { X, Clock, Wrench } from 'lucide-react'

const ComingSoonModal = ({ isOpen, onClose, feature, description }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Coming Soon
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-blue-500" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {feature} Feature
          </h3>
          
          <p className="text-gray-600 mb-6">
            {description || `The ${feature.toLowerCase()} feature is currently under development. We're working hard to bring you this functionality soon!`}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>What's Coming:</strong>
              <br />
              • Full CRUD operations
              <br />
              • Advanced filtering and search
              <br />
              • Export and reporting features
              <br />
              • Real-time updates
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn-primary w-full"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}

export default ComingSoonModal
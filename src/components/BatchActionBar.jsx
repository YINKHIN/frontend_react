import { useState } from 'react';
import { Trash2, Download, Edit, X, CheckSquare, Square } from 'lucide-react';

const BatchActionBar = ({ 
  selectedCount, 
  totalCount,
  onBatchDelete, 
  onBatchExport, 
  onBatchUpdateStatus,
  onSelectAll,
  onDeselectAll,
  isAllSelected,
  isProcessing = false 
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);

  if (selectedCount === 0) return null;

  const handleBatchDelete = () => {
    if (showConfirmDelete) {
      onBatchDelete();
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
    }
  };

  const handleStatusUpdate = (status) => {
    onBatchUpdateStatus(status);
    setShowStatusUpdate(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-96">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium text-blue-600">{selectedCount}</span>
              <span className="mx-1">of</span>
              <span>{totalCount}</span>
              <span className="ml-1">selected</span>
            </div>

            <button
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              disabled={isProcessing}
            >
              {isAllSelected ? (
                <>
                  <Square className="w-4 h-4 mr-1" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Select All
                </>
              )}
            </button>
          </div>

          <button
            onClick={onDeselectAll}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center space-x-2 mt-4">
          {/* Export Button */}
          <button
            onClick={onBatchExport}
            disabled={isProcessing}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Selected
          </button>

          {/* Status Update Button */}
          <div className="relative">
            <button
              onClick={() => setShowStatusUpdate(!showStatusUpdate)}
              disabled={isProcessing}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="w-4 h-4 mr-2" />
              Update Status
            </button>

            {showStatusUpdate && (
              <div className="absolute bottom-full mb-2 left-0 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-40">
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mark as Completed
                </button>
                <button
                  onClick={() => handleStatusUpdate('draft')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mark as Draft
                </button>
                <button
                  onClick={() => handleStatusUpdate('partial')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mark as Partial
                </button>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={handleBatchDelete}
            disabled={isProcessing}
            className={`
              flex items-center px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed
              ${showConfirmDelete 
                ? 'text-white bg-red-600 hover:bg-red-700' 
                : 'text-red-600 bg-white border border-red-300 hover:bg-red-50'
              }
            `}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {showConfirmDelete ? 'Confirm Delete' : 'Delete Selected'}
          </button>

          {showConfirmDelete && (
            <button
              onClick={() => setShowConfirmDelete(false)}
              disabled={isProcessing}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>

        {isProcessing && (
          <div className="mt-3 flex items-center justify-center">
            <div className="flex items-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Processing...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchActionBar;

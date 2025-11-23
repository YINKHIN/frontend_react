import { useState, useEffect } from 'react'
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react'
import GlobalSearch from './GlobalSearch'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { request } from '../utils/request'

const Header = ({ onMenuClick, toggleSidebar }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(0)

  // Fetch low stock products for notification badge
  useEffect(() => {
    const fetchLowStockCount = async () => {
      try {
        const response = await request.get('/products')
        const products = Array.isArray(response?.data?.data) ? response.data.data :
          Array.isArray(response?.data) ? response.data :
            Array.isArray(response) ? response : [];

        // Calculate low stock products (qty <= reorder_point or qty <= 10)
        const lowStock = products.filter(product => {
          const qty = parseInt(product.qty || 0);
          const reorderPoint = parseInt(product.reorder_point || 10);
          return qty <= reorderPoint;
        });

        setLowStockCount(lowStock.length);
      } catch (error) {
        console.error('Low stock fetch error:', error);
        setLowStockCount(0);
      }
    };

    fetchLowStockCount();
    
    // Refetch every minute
    const interval = setInterval(fetchLowStockCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg border-b text-white border-primary-500 sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center min-w-0 flex-1">
          <button
            onClick={onMenuClick || toggleSidebar}
            className="text-white hover:text-gray-700 lg:hidden mr-2 p-1"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-white truncate">
            <span className="hidden sm:inline">Inventory Management System</span>
            <span className="sm:hidden">IMS</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <GlobalSearch />
          <Link
            to="/notifications"
            className="text-white hover:text-red-500 relative p-1 transition-colors"
            title={`${lowStockCount} low stock items`}
          >
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            {lowStockCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ${lowStockCount > 10 ? 'bg-red-600' :
                  lowStockCount > 5 ? 'bg-orange-500' : 'bg-yellow-500'
                }`}>
                {lowStockCount > 99 ? '99+' : lowStockCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1 sm:space-x-2 text-white hover:text-gray-900 p-1"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                {user?.photo_url || user?.profile?.image_url ? (
                  <img
                    src={user?.photo_url || user?.profile?.image_url}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-primary-600 flex items-center justify-center ${user?.photo_url || user?.profile?.image_url ? 'hidden' : ''}`}>
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="hidden sm:block font-medium text-sm md:text-base truncate max-w-24 md:max-w-none">
                {user?.name}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setDropdownOpen(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
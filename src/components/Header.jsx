import { useState } from 'react'
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="text-gray-500 hover:text-gray-700 lg:hidden mr-2 p-1"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-800 truncate">
            <span className="hidden sm:inline">Inventory Management System</span>
            <span className="sm:hidden">IMS</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button className="text-gray-500 hover:text-gray-700 relative p-1">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-gray-900 p-1"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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
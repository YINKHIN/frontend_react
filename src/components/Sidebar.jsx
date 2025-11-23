import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Package,
  FolderOpen,
  Tag,
  Truck,
  Users,
  UserCheck,
  ShoppingCart,
  Download,
  CreditCard,
  BarChart3,
  TrendingUp,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  X,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/helper";
import { config } from "../utils/config";
import { prefetchRouteData } from "../utils/prefetch";

// NavLink with prefetching on hover
const NavLinkWithPrefetch = ({ to, children, className, onClick }) => {
  const linkRef = useRef(null);
  
  useEffect(() => {
    if (linkRef.current && to) {
      let timeout;
      const handleMouseEnter = () => {
        timeout = setTimeout(() => {
          prefetchRouteData(to);
        }, 200); // 200ms delay like YouTube
      };
      const handleMouseLeave = () => {
        clearTimeout(timeout);
      };
      
      linkRef.current.addEventListener('mouseenter', handleMouseEnter);
      linkRef.current.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        clearTimeout(timeout);
        if (linkRef.current) {
          linkRef.current.removeEventListener('mouseenter', handleMouseEnter);
          linkRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, [to]);
  
  return (
    <NavLink
      ref={linkRef}
      to={to}
      onClick={onClick}
      className={className}
    >
      {children}
    </NavLink>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasPermission } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard", permission: "read" },
    {
      name: "Analytics",
      icon: TrendingUp,
      path: "/analytics",
      permission: "read",
    },
    {
      name: "Inventory",
      icon: Package,
      permission: "read",
      dropdown: true,
      children: [
        {
          name: "Products",
          icon: Package,
          path: "/products",
          permission: "read",
        },
        {
          name: "Categories",
          icon: FolderOpen,
          path: "/categories",
          permission: "read",
        },
        { name: "Brands", icon: Tag, path: "/brands", permission: "read" },
        {
          name: "Suppliers",
          icon: Truck,
          path: "/suppliers",
          permission: "read",
        },
      ],
    },
    {
      name: "People",
      icon: Users,
      permission: "read",
      dropdown: true,
      children: [
        {
          name: "Customers",
          icon: Users,
          path: "/customers",
          permission: "read",
        },
        { name: "Staff", icon: UserCheck, path: "/staff", permission: "read" },
        {
          name: "Users",
          icon: Settings,
          path: "/users",
          permission: "manage_users",
        },
      ],
    },
    {
      name: "Operations",
      icon: ShoppingCart,
      permission: "read",
      dropdown: true,
      children: [
        {
          name: "Imports",
          icon: Download,
          path: "/imports",
          permission: "read",
        },
        {
          name: "Orders",
          icon: ShoppingCart,
          path: "/orders",
          permission: "read",
        },
        {
          name: "Payments",
          icon: CreditCard,
          path: "/payments",
          permission: "read",
        },
      ],
    },
    {
    
      name: "Reports",
      icon: BarChart3,
      // permission: "",
      permission: "manage_users",
      dropdown: true,
      children: [
        {
          name: "Import Report",
          icon: Download,
          path: "/reports#import",
          permission: "read",
        },
        {
          name: "Sales Report",
          icon: ShoppingCart,
          path: "/reports#sales",
          permission: "read",
        },
      ],
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
      permission: "read",
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    hasPermission(item.permission)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-64 bg-white  shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center">
            {/* <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"> */}
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-gray-200">
              {user.image || user.profile?.image ? (
                <img
                  src={
                    user.image_url ||
                    user.profile?.image_url ||
                    getImageUrl(
                      user.image || user.profile?.image,
                      config.base_image_url
                    )
                  }
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full bg-primary-700 flex items-center justify-center ${
                  user.image || user.profile?.image ? "hidden" : ""
                }`}
              >
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            {/* </div> */}
            <span className="ml-2 text-lg font-semibold text-gray-800">
              <div className="font-medium text-gray-900">{user.name}</div>
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-4 sm:mt-6 pb-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div className="px-4 sm:px-6 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {user?.type === "admin"
                ? "Administrator"
                : user?.type === "manager"
                ? "Manager"
                : user?.type === "staff_sale"
                ? "Sales Staff"
                : user?.type === "inventory_staff"
                ? "Inventory Staff"
                : "User"}
            </p>
          </div>

          {filteredMenuItems.map((item) => (
            <div key={item.name}>
              {item.dropdown ? (
                // Dropdown Menu Item
                <div>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className="flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 mx-2 sm:mx-0 rounded-lg sm:rounded-none"
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {openDropdowns[item.name] ? (
                      <ChevronDown className="w-4 h-4 transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 transition-transform" />
                    )}
                  </button>

                  {/* Dropdown Content */}
                  {openDropdowns[item.name] && (
                    <div className="ml-4 sm:ml-6 mt-1 space-y-1">
                      {item.children
                        ?.filter((child) => hasPermission(child.permission))
                        .map((child) => (
                          <NavLinkWithPrefetch
                            key={child.name}
                            to={child.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `flex items-center px-4 sm:px-6 py-2 sm:py-2 text-sm font-medium transition-colors duration-200 mx-2 sm:mx-0 rounded-lg sm:rounded-none ${
                                isActive
                                  ? "text-primary-500 bg-primary-50 sm:border-r-2 sm:border-primary-600 sm:bg-primary-50"
                                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                              }`
                            }
                          >
                            <child.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                            <span className="truncate">{child.name}</span>
                          </NavLinkWithPrefetch>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular Menu Item with prefetching
                <NavLinkWithPrefetch
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 sm:px-6 py-3 sm:py-3 text-sm font-medium transition-colors duration-200 mx-2 sm:mx-0 rounded-lg sm:rounded-none ${
                      isActive
                        ? "text-primary-600 bg-primary-50 sm:border-r-2 sm:border-primary-600 sm:bg-primary-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLinkWithPrefetch>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

import { useState, useEffect } from 'react';

// Define user roles
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  INVENTORY: 'inventory',
  SALES: 'sales',
  USER: 'user'
};

// Roles with admin privileges (can perform CUD operations)
const ADMIN_PRIVILEGE_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.INVENTORY];

// Roles with sales privileges (can create orders, receive payments)
const SALES_PRIVILEGE_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SALES, USER_ROLES.INVENTORY];

// Hook to check if user has admin privileges
export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userType = localStorage.getItem('type');
    // Allow admin, manager, and inventory clerk roles to have admin privileges
    setIsAdmin(ADMIN_PRIVILEGE_ROLES.includes(userType));
  }, []);

  return isAdmin;
};

// Hook to check if user has sales privileges
export const useIsSales = () => {
  const [isSales, setIsSales] = useState(false);

  useEffect(() => {
    const userType = localStorage.getItem('type');
    // Allow admin, manager, sales staff, and inventory clerk roles to perform sales operations
    setIsSales(SALES_PRIVILEGE_ROLES.includes(userType));
  }, []);

  return isSales;
};

// Component to conditionally render content based on admin/manager/inventory role
export const AdminOnly = ({ children, fallback = null }) => {
  const isAdmin = useIsAdmin();
  return isAdmin ? children : fallback;
};

// Component to conditionally render content for sales staff
export const SalesOnly = ({ children, fallback = null }) => {
  const isSales = useIsSales();
  return isSales ? children : fallback;
};

// Component to conditionally render content for regular users
export const UserOnly = ({ children, fallback = null }) => {
  const isAdmin = useIsAdmin();
  return !isAdmin ? children : fallback;
};

// Helper function to check permissions
export const checkPermission = (action = 'read') => {
  const userType = localStorage.getItem('type');
  
  if (action === 'read') {
    return true; // All users can read
  }

  // Create, Update, Delete operations require admin privileges
  if (action === 'write') {
    return ADMIN_PRIVILEGE_ROLES.includes(userType);
  }

  // Sales operations (create orders, receive payments)
  if (action === 'sales') {
    return SALES_PRIVILEGE_ROLES.includes(userType);
  }

  // Default to admin privileges for other operations
  return ADMIN_PRIVILEGE_ROLES.includes(userType);
};

export default {
  useIsAdmin,
  useIsSales,
  AdminOnly,
  SalesOnly,
  UserOnly,
  checkPermission,
  USER_ROLES
};
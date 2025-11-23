import { format, parseISO } from "date-fns";

// Format currency
export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Format date
export const formatDate = (date, formatStr = "MMM dd, yyyy") => {
  if (!date) return "";
  
  try {
    let dateObj;
    if (typeof date === "string") {
      // Handle different date string formats
      // Format: "2025-10-31 00:00:00" or "2025-10-31T00:00:00" or "2025-10-31"
      if (date.includes('T')) {
        // ISO format with T
        dateObj = parseISO(date);
      } else if (date.includes('-') && date.includes(' ')) {
        // Format: "YYYY-MM-DD HH:mm:ss" (MySQL datetime format)
        const parts = date.split(' ');
        const datePart = parts[0]; // YYYY-MM-DD
        const timePart = parts[1] || '00:00:00'; // HH:mm:ss
        dateObj = parseISO(datePart + 'T' + timePart);
      } else if (date.includes('-')) {
        // Format: "YYYY-MM-DD"
        dateObj = parseISO(date + 'T00:00:00');
      } else {
        // Try native Date parsing
        dateObj = new Date(date);
      }
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      // Try alternative parsing for MySQL datetime strings
      if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}/)) {
        try {
          // Replace space with T for ISO format
          const isoDate = date.replace(' ', 'T');
          const altDate = parseISO(isoDate);
          if (!isNaN(altDate.getTime())) {
            return format(altDate, formatStr);
          }
        } catch (e) {
          // Continue to return original
        }
        // If it looks like a date string, return it formatted as-is
        return date;
      }
      // Only warn for truly invalid dates
      if (typeof date !== 'string' || (!date.includes('-') && !date.includes('/'))) {
        console.warn('Invalid date:', date);
      }
      return date; // Return original if invalid
    }
    
    return format(dateObj, formatStr);
  } catch (error) {
    // Silently handle date formatting errors for valid-looking date strings
    if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}/)) {
      return date; // Return as-is if it looks like a date
    }
    console.warn('Error formatting date:', date, error);
    return date; // Return original if error
  }
};

// Format date time
export const formatDateTime = (date) => {
  return formatDate(date, "MMM dd, yyyy");
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Check if user has permission
export const hasPermission = (userType, requiredPermissions) => {
  const permissions = {
    admin: ["create", "read", "update", "delete"],
    manager: ["read"],
    staff_sale: [
      "read",
      "create_order",
      "update_order",
      "create_payment",
      "update_payment",
    ],
    inventory_staff: [
      "read",
      "create_product",
      "update_product",
      "create_import",
      "update_import",
    ],
    user: ["read"],
  };

  const userPermissions = permissions[userType] || [];

  if (Array.isArray(requiredPermissions)) {
    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );
  }

  return userPermissions.includes(requiredPermissions);
};

// Get user role display name
export const getUserRoleDisplay = (type) => {
  const roles = {
    admin: "Administrator",
    manager: "Manager",
    sales: "Sales Staff",
    staff_sale: "Sales Staff", // Fallback
    inventory: "Inventory Staff",
    inventory_staff: "Inventory Staff", // Fallback
    user: "User",
  };
  return roles[type] || type;
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    active: "text-green-600 bg-green-100",
    inactive: "text-red-600 bg-red-100",
    pending: "text-yellow-600 bg-yellow-100",
    completed: "text-blue-600 bg-blue-100",
    cancelled: "text-gray-600 bg-gray-100",
  };
  return colors[status] || "text-gray-600 bg-gray-100";
};

// Download file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Parse error message
export const parseErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    return Object.values(errors).flat().join(", ");
  }
  return error.message || "An error occurred";
};

// Get image URL
export const getImageUrl = (
  image,
  baseUrl = "http://localhost:8000/storage/"
) => {
  if (!image) return null;

  // If image is already a full URL, return it
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Otherwise, prepend the base URL
  return `${baseUrl}${image}`;
};

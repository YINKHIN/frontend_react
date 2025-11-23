// Environment-based configuration
const isDevelopment = import.meta.env.DEV;
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isDevelopment 
    ? "http://localhost:8000/api/" 
    : "");
    
// const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL ||
  (isDevelopment
    ? "http://localhost:8000/storage/"
    : "");

// export const config = {
//   base_image_url: STORAGE_BASE_URL,
//   base_api_url: API_BASE_URL,
//   app_name: "Inventory Management System",
//   app_version: "1.0.0",
//   currency: "$",
//   date_format: "YYYY-MM-DD",
//   datetime_format: "YYYY-MM-DD",
//   pagination_limit: 10,
// };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL;

export const config = {
  base_api_url: API_BASE_URL,
  base_image_url: STORAGE_BASE_URL,
  app_name: "Inventory Management System",
  app_version: "1.0.0",
  currency: "$",
  date_format: "YYYY-MM-DD",
  pagination_limit: 10,
};

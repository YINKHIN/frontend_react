// Image helper utilities for handling Laravel storage URLs
import { config } from './config'

// Use environment variable with fallback to config
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || config.base_api_url || 'https://laravel-6oix.onrender.com/api/'
const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL || config.base_image_url || 'https://laravel-6oix.onrender.com/storage/'

/**
 * Convert storage URL to API URL for serving images through API
 * @param {string} url - Storage URL
 * @returns {string} - API URL
 */
const convertStorageUrlToApiUrl = (url) => {
  try {
    const urlObj = new URL(url)
    // Extract path like /storage/categories/filename.jpg
    const path = urlObj.pathname
    // Convert /storage/categories/filename.jpg to /api/storage/categories/filename.jpg
    // Preserve the full path after /storage/
    if (path.startsWith('/storage/')) {
      const storagePath = path.substring('/storage/'.length) // Remove '/storage/' prefix
      const apiPath = `/api/storage/${storagePath}`
      return `${urlObj.origin}${apiPath}`
    }
    return url
  } catch {
    return url
  }
}

/**
 * Extract folder and filename from storage path
 * @param {string} imagePath - Image path (e.g., "categories/filename.jpg" or full URL)
 * @returns {object|null} - Object with folder and filename, or null
 */
const extractPathParts = (imagePath) => {
  // If it's a full URL, extract the path
  if (imagePath.startsWith('http')) {
    try {
      const url = new URL(imagePath)
      let path = url.pathname
      
      // Remove /storage/ or /api/storage/ prefix if present
      path = path.replace(/^\/api\/storage\//, '').replace(/^\/storage\//, '')
      
      // Split into parts
      const parts = path.split('/').filter(p => p) // Remove empty parts
      
      if (parts.length >= 2) {
        const filename = parts.pop() // Get last part as filename
        const folder = parts.join('/') // Join remaining parts as folder
        return { folder, filename }
      } else if (parts.length === 1) {
        // If only one part, assume it's a filename in categories folder
        return { folder: 'categories', filename: parts[0] }
      }
    } catch (e) {
      console.error('Error parsing URL:', imagePath, e)
      return null
    }
  }
  
  // If it's a path like "categories/filename.jpg"
  if (imagePath.includes('/')) {
    const parts = imagePath.split('/').filter(p => p)
    if (parts.length > 0) {
      const filename = parts.pop()
      const folder = parts.length > 0 ? parts.join('/') : 'categories'
      return { folder, filename }
    }
  }
  
  // If it's just a filename, assume categories folder
  if (imagePath.includes('.')) {
    return { folder: 'categories', filename: imagePath }
  }
  
  return null
}

/**
 * Get the full image URL for a category image
 * @param {string} imagePath - The image path from the database
 * @returns {string|null} - Full image URL or null if invalid
 */
export const getCategoryImageUrl = (imagePath) => {
  if (!imagePath) {
    return null
  }
  
  // If it's already a full URL (starts with http)
  if (imagePath.startsWith('http')) {
    // Try to use API route instead of direct storage URL
    // This works around storage symlink issues on Render
    return convertStorageUrlToApiUrl(imagePath)
  }
  
  // If it's just a filename without extension, it's probably invalid
  if (!imagePath.includes('.') && !imagePath.includes('/')) {
    return null
  }
  
  // Extract folder and filename
  const pathParts = extractPathParts(imagePath)
  if (!pathParts) {
    return null
  }
  
  // Use API route to serve images (works around storage symlink issues)
  const apiBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  return `${apiBase}/storage/${pathParts.folder}/${pathParts.filename}`
}

/**
 * Check if an image URL is valid
 * @param {string} imageUrl - The image URL to check
 * @returns {boolean} - Whether the URL appears to be valid
 */
export const isValidImageUrl = (imageUrl) => {
  if (!imageUrl) return false
  
  // Check if it's a valid URL format
  try {
    new URL(imageUrl)
    return true
  } catch {
    return false
  }
}

/**
 * Get a fallback image URL for categories
 * @param {string} categoryName - The category name
 * @returns {string} - A fallback image URL (SVG data URI)
 */
export const getFallbackImageUrl = (categoryName) => {
  // Generate an SVG placeholder image as a data URI
  const displayName = categoryName || 'Category'
  // Escape special characters for SVG/XML
  const escapedName = displayName
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
  
  const svg = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="400" fill="#e5e7eb"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">${escapedName}</text></svg>`
  
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export default {
  getCategoryImageUrl,
  isValidImageUrl,
  getFallbackImageUrl
}
// Shared data cache for optimistic updates across components
// This allows immediate updates without waiting for API responses

class DataCache {
  constructor() {
    this.cache = {
      imports: [],
      orders: [],
      listeners: new Map()
    }
  }

  // Subscribe to cache updates
  subscribe(key, callback) {
    if (!this.cache.listeners.has(key)) {
      this.cache.listeners.set(key, new Set())
    }
    this.cache.listeners.get(key).add(callback)
    
    // Return unsubscribe function
    return () => {
      const listeners = this.cache.listeners.get(key)
      if (listeners) {
        listeners.delete(callback)
      }
    }
  }

  // Notify listeners of changes
  notify(key) {
    const listeners = this.cache.listeners.get(key)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(this.cache[key])
        } catch (error) {
          console.error('Cache listener error:', error)
        }
      })
    }
  }

  // Get cached data
  get(key) {
    return this.cache[key] || []
  }

  // Set cached data
  set(key, data) {
    if (Array.isArray(data)) {
      this.cache[key] = data
      this.notify(key)
    }
  }

  // Add item to cache (optimistic update)
  add(key, item) {
    if (!Array.isArray(this.cache[key])) {
      this.cache[key] = []
    }
    // Check if item already exists (by ID)
    const exists = this.cache[key].some(existing => existing.id === item.id)
    if (!exists) {
      // Add to beginning of array (newest first)
      this.cache[key] = [item, ...this.cache[key]]
      this.notify(key)
    }
  }

  // Update item in cache
  update(key, id, updates) {
    if (!Array.isArray(this.cache[key])) {
      return
    }
    const index = this.cache[key].findIndex(item => item.id === id)
    if (index !== -1) {
      this.cache[key][index] = { ...this.cache[key][index], ...updates }
      this.notify(key)
    }
  }

  // Remove item from cache
  remove(key, id) {
    if (!Array.isArray(this.cache[key])) {
      return
    }
    this.cache[key] = this.cache[key].filter(item => item.id !== id)
    this.notify(key)
  }

  // Clear cache
  clear(key) {
    if (key) {
      this.cache[key] = []
      this.notify(key)
    } else {
      this.cache.imports = []
      this.cache.orders = []
      this.notify('imports')
      this.notify('orders')
    }
  }
}

// Export singleton instance
export const dataCache = new DataCache()


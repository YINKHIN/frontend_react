// Mock category service for development/testing
const mockCategories = [
  {
    id: 1,
    cat_id: 1,
    cat_name: 'Electronics',
    cat_desc: 'Electronic devices and accessories',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    cat_id: 2,
    cat_name: 'Clothing',
    cat_desc: 'Apparel and fashion items',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    cat_id: 3,
    cat_name: 'Books',
    cat_desc: 'Books and educational materials',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    cat_id: 4,
    cat_name: 'Home & Garden',
    cat_desc: 'Home improvement and garden supplies',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    cat_id: 5,
    cat_name: 'Sports',
    cat_desc: 'Sports equipment and accessories',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

let nextId = 6

export const mockCategoryService = {
  getAll: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return {
      data: mockCategories,
      success: true,
      message: 'Categories retrieved successfully'
    }
  },

  getById: async (id) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const category = mockCategories.find(cat => cat.id === parseInt(id) || cat.cat_id === parseInt(id))
    
    if (!category) {
      throw new Error('Category not found')
    }
    
    return {
      data: category,
      success: true,
      message: 'Category retrieved successfully'
    }
  },

  create: async (data) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const newCategory = {
      id: nextId,
      cat_id: nextId,
      cat_name: data.cat_name || data.name,
      cat_desc: data.cat_desc || data.description || '',
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockCategories.push(newCategory)
    nextId++
    
    return {
      data: newCategory,
      success: true,
      message: 'Category created successfully'
    }
  },

  update: async (id, data) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const index = mockCategories.findIndex(cat => cat.id === parseInt(id) || cat.cat_id === parseInt(id))
    
    if (index === -1) {
      throw new Error('Category not found')
    }
    
    const updatedCategory = {
      ...mockCategories[index],
      cat_name: data.cat_name || data.name || mockCategories[index].cat_name,
      cat_desc: data.cat_desc || data.description || mockCategories[index].cat_desc,
      status: data.status || mockCategories[index].status,
      updated_at: new Date().toISOString()
    }
    
    mockCategories[index] = updatedCategory
    
    return {
      data: updatedCategory,
      success: true,
      message: 'Category updated successfully'
    }
  },

  delete: async (id) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const index = mockCategories.findIndex(cat => cat.id === parseInt(id) || cat.cat_id === parseInt(id))
    
    if (index === -1) {
      throw new Error('Category not found')
    }
    
    const deletedCategory = mockCategories.splice(index, 1)[0]
    
    return {
      data: deletedCategory,
      success: true,
      message: 'Category deleted successfully'
    }
  }
}
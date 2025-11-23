import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { categoryService } from '../services/categoryService'

export const useCategories = () => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await categoryService.getAll()
      setData(result)
      setError(null)
    } catch (err) {
      console.error('useCategories: Error fetching categories:', err)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, isLoading, error, refetch }
}

export const useCategory = (id) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const result = await categoryService.getById(id)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
      console.error('Error fetching category:', err)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      refetch()
    }
  }, [id, refetch])

  return { data, isLoading, error, refetch }
}

export const useCreateCategory = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (formData) => {
    try {
      setIsLoading(true)
      const result = await categoryService.create(formData)
      toast.success('Category created successfully')

      if (onSuccess) onSuccess()

      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useUpdateCategory = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async ({ id, formData }) => {
    try {
      setIsLoading(true)
      const result = await categoryService.update(id, formData)
      toast.success('Category updated successfully')

      if (onSuccess) onSuccess()

      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useDeleteCategory = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id, forceDelete = false) => {
    try {
      setIsLoading(true)
      const result = await categoryService.delete(id, forceDelete)
      toast.success('Category deleted successfully')

      if (onSuccess) onSuccess()

      return result
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to delete category'
      toast.error(errorMsg)
      console.error('Delete error:', error.response?.data)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}
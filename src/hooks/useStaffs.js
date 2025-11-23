import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { staffService } from '../services/staffService'

export const useStaffs = () => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await staffService.getAll()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
    // Remove aggressive polling - only refetch on mount
    // const interval = setInterval(refetch, 60000)
    // return () => clearInterval(interval)
  }, [refetch])

  return { data, isLoading, error, refetch }
}

export const useStaff = (id) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const result = await staffService.getById(id)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
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

export const useCreateStaff = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (staffData) => {
    try {
      setIsLoading(true)
      const result = await staffService.create(staffData)
      toast.success('Staff created successfully')
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create staff')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useUpdateStaff = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async ({ id, data }) => {
    try {
      setIsLoading(true)
      const result = await staffService.update(id, data)
      toast.success('Staff updated successfully')
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update staff')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useDeleteStaff = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id) => {
    try {
      setIsLoading(true)
      const result = await staffService.delete(id)
      toast.success('Staff deleted successfully')
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete staff')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

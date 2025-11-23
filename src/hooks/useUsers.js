import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { userService } from '../services/userService'

export const useUsers = () => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await userService.getAll()
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
  }, [refetch])

  return { data, isLoading, error, refetch }
}

export const useUser = (id) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const result = await userService.getById(id)
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

export const useCreateUser = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (userData) => {
    try {
      setIsLoading(true)
      const result = await userService.create(userData)
      toast.success('User created successfully')
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useUpdateUser = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async ({ id, data }) => {
    try {
      setIsLoading(true)
      const result = await userService.update(id, data)
      toast.success('User updated successfully')
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

export const useDeleteUser = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id) => {
    try {
      setIsLoading(true)
      const result = await userService.delete(id)
      toast.success('User deleted successfully')
      return result
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, mutateAsync: mutate, isLoading }
}

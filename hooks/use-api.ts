"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseApiOptions {
  retryLimit?: number
  retryDelay?: number
  enableRetry?: boolean
}

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  retryCount: number
}

export function useApi<T>(apiCall: () => Promise<T>, dependencies: any[] = [], options: UseApiOptions = {}) {
  const { retryLimit = 3, retryDelay = 1000, enableRetry = true } = options

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
    retryCount: 0,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(
    async (isRetry = false) => {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      if (!isRetry) {
        setState((prev) => ({ ...prev, loading: true, error: null }))
      }

      try {
        const result = await apiCall()

        setState({
          data: result,
          loading: false,
          error: null,
          retryCount: 0,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"

        setState((prev) => {
          const newRetryCount = isRetry ? prev.retryCount + 1 : 1

          // If we haven't exceeded retry limit and retry is enabled
          if (enableRetry && newRetryCount <= retryLimit) {
            // Schedule retry
            timeoutRef.current = setTimeout(() => {
              fetchData(true)
            }, retryDelay * newRetryCount) // Exponential backoff

            return {
              ...prev,
              loading: true,
              error: `Attempt ${newRetryCount}/${retryLimit}: ${errorMessage}`,
              retryCount: newRetryCount,
            }
          }

          // Max retries exceeded or retry disabled
          return {
            ...prev,
            loading: false,
            error: `Failed after ${newRetryCount} attempts: ${errorMessage}`,
            retryCount: newRetryCount,
          }
        })
      }
    },
    [apiCall, retryLimit, retryDelay, enableRetry],
  )

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, retryCount: 0 }))
    fetchData(false)
  }, [fetchData])

  useEffect(() => {
    fetchData(false)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, dependencies)

  return {
    ...state,
    retry,
  }
}

'use client'

import { useQuery } from '@tanstack/react-query'
// import { useEffect } from 'react'
import type { ConfigurationWithInstances } from '@/types'
// import { useAppStore } from '@/stores/app.store'
import { ReactQueryKeys } from '@/enums'
import { logger } from '@/utils/logger.util'

interface ApiResponse {
    configurations?: ConfigurationWithInstances[]
    error?: string
}

async function fetchDashboardData(): Promise<ConfigurationWithInstances[]> {
    try {
        const response = await fetch('/api/dashboard')

        // Handle non-OK responses
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Network error')
            logger.error(`API Error (${response.status}):`, { error: errorText })
            throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`)
        }

        // Parse response safely
        const data = (await response.json()) as ApiResponse

        // Validate response structure
        if (!data.configurations || !Array.isArray(data.configurations)) {
            logger.error('Invalid API response:', { error: data })
            throw new Error('Invalid response format from API')
        }

        return data.configurations
    } catch (error) {
        // Re-throw with more context
        if (error instanceof Error) {
            throw error
        }
        throw new Error('An unexpected error occurred while fetching dashboard data')
    }
}

export function useInstancesData() {
    // const { setConfigurations } = useAppStore()

    const queryResult = useQuery({
        queryKey: [ReactQueryKeys.INSTANCES],
        queryFn: fetchDashboardData,
        // Retry configuration
        retry: (failureCount, error) => {
            // Don't retry on 4xx errors
            if (error instanceof Error && error.message.includes('4')) {
                return false
            }
            // Retry up to 3 times for other errors
            return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch configuration
        refetchInterval: (data) => {
            // Only refetch if we have data
            return data ? 30000 : false
        },
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        // Stale time - data is fresh for 10 seconds
        staleTime: 10000,
        // Cache time - keep data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
    })

    const { data, isLoading, error, refetch, isRefetching } = queryResult

    // Update store when data changes
    // useEffect(() => {
    //     if (data && data.length > 0) {
    //         setConfigurations(data)
    //     }
    // }, [data, setConfigurations])

    return {
        configurations: data || [],
        isLoading,
        isRefetching,
        error,
        refetch,
        // Helper to check if we're in an error state with no data
        hasError: !!error && (!data || data.length === 0),
    }
}

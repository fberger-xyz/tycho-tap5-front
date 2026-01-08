'use client'

import { useQuery } from '@tanstack/react-query'
import { AppUrls, ReactQueryKeys } from '@/enums'
import { logger } from '@/utils/logger.util'

interface PriceData {
    id: string
    instanceId: string
    price: number
    timestamp: Date
}

interface ApiResponse {
    prices?: PriceData[]
    error?: string
}

async function fetchPrices(instanceId?: string): Promise<PriceData[]> {
    if (!instanceId) return []

    try {
        const response = await fetch(`${AppUrls.API_PRICES}?instanceId=${encodeURIComponent(instanceId)}`)

        // Handle non-OK responses
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Network error')
            logger.error(`API Error (${response.status}):`, { error: errorText })
            throw new Error(`Failed to fetch prices: ${response.status} ${response.statusText}`)
        }

        // Try to parse as direct array first (backward compatibility)
        const text = await response.text()
        let data: PriceData[] | ApiResponse

        try {
            data = JSON.parse(text)
        } catch {
            logger.error('Failed to parse response:', { error: text })
            throw new Error('Invalid JSON response from API')
        }

        // Handle both response formats
        if (Array.isArray(data)) {
            return data
        } else if (data && typeof data === 'object' && 'prices' in data) {
            if (!data.prices || !Array.isArray(data.prices)) {
                logger.error('Invalid API response:', { error: data })
                throw new Error('Invalid response format from API')
            }
            return data.prices
        }

        logger.error('Unexpected response format:', { error: data })
        throw new Error('Unexpected response format from API')
    } catch (error) {
        // Re-throw with more context
        if (error instanceof Error) {
            throw error
        }
        throw new Error('An unexpected error occurred while fetching prices')
    }
}

export function usePricesData(instanceId?: string, refreshInterval = 30000) {
    const queryResult = useQuery({
        queryKey: [ReactQueryKeys.PRICES, instanceId ?? ''],
        queryFn: () => fetchPrices(instanceId),
        enabled: !!instanceId,
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
            // Only refetch if we have data and refreshInterval is positive
            return data && refreshInterval > 0 ? refreshInterval : false
        },
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        // Stale time - data is fresh for 10 seconds
        staleTime: 10000,
        // Cache time - keep data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
    })

    const { data, isLoading, error, refetch, isRefetching } = queryResult

    return {
        prices: data || [],
        isLoading,
        isRefetching,
        error,
        refetch,
        // Helper to check if we're in an error state with no data
        hasError: !!error && (!data || data.length === 0),
    }
}

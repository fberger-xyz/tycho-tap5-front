'use client'

import { AppUrls, ReactQueryKeys } from '@/enums'
import { TradeWithInstanceAndConfiguration } from '@/types'
import { logger } from '@/utils/logger.util'
import { useQuery } from '@tanstack/react-query'

/**
 * ------------------------ 3 fetch trades
 */

async function fetchTrades(configurationId?: string, limit = 1000): Promise<TradeWithInstanceAndConfiguration[]> {
    try {
        const params = new URLSearchParams({ limit: limit.toString() })
        if (configurationId) {
            params.append('configurationId', configurationId)
        }

        const response = await fetch(`${AppUrls.API_TRADES}?${params.toString()}`)

        // Handle non-OK responses
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Network error')
            logger.error(`API Error (${response.status}):`, { error: errorText })
            throw new Error(`Failed to fetch trades: ${response.status} ${response.statusText}`)
        }

        // Parse response safely
        const data: { trades: TradeWithInstanceAndConfiguration[] } = await response.json()

        // Validate response structure
        if (!data.trades || !Array.isArray(data.trades)) {
            logger.error('Invalid API response:', { error: data })
            throw new Error('Invalid response format from API')
        }

        return data.trades
    } catch (error) {
        // Re-throw with more context
        if (error instanceof Error) {
            throw error
        }
        throw new Error('An unexpected error occurred while fetching trades')
    }
}

export function useTradesData(refreshInterval = 5000, configurationId?: string, limit = 500) {
    const queryResult = useQuery({
        queryKey: [ReactQueryKeys.TRADES, configurationId, limit],
        queryFn: () => fetchTrades(configurationId, limit),
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
        // Aggressive caching for 5 users
        // Data is fresh for 3 seconds (matches server cache)
        staleTime: 3000,
        // Keep data in cache for 30 minutes
        gcTime: 30 * 60 * 1000,
    })

    const { data, isLoading, error, refetch, isRefetching } = queryResult

    return {
        trades: data || [],
        isLoading,
        isRefetching,
        error,
        refetch,
        // Helper to check if we're in an error state with no data
        hasError: !!error && (!data || data.length === 0),
    }
}

'use client'

import { useQuery } from '@tanstack/react-query'
import { ReactQueryKeys } from '@/enums'
import { transformTrade } from '@/utils'
import { ApiTrade, TradeData } from '@/interfaces'

/**
 * ------------------------ 3 fetch trades
 */

async function fetchTrades(): Promise<TradeData[]> {
    try {
        const response = await fetch('/api/trades?limit=100')

        // Handle non-OK responses
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Network error')
            console.error(`API Error (${response.status}):`, errorText)
            throw new Error(`Failed to fetch trades: ${response.status} ${response.statusText}`)
        }

        // Parse response safely
        const data: { trades: ApiTrade[] } = await response.json()

        // Validate response structure
        if (!data.trades || !Array.isArray(data.trades)) {
            console.error('Invalid API response:', data)
            throw new Error('Invalid response format from API')
        }

        return data.trades.map(transformTrade)
    } catch (error) {
        // Re-throw with more context
        if (error instanceof Error) {
            throw error
        }
        throw new Error('An unexpected error occurred while fetching trades')
    }
}

export function useTradesData(refreshInterval = 5000) {
    const queryResult = useQuery({
        queryKey: [ReactQueryKeys.TRADES],
        queryFn: fetchTrades,
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
        // Stale time - data is fresh for 2 seconds
        staleTime: 2000,
        // Cache time - keep data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
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

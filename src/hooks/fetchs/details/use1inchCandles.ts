'use client'

import { useQuery } from '@tanstack/react-query'
import { ReactQueryKeys } from '@/enums'
import { CandlesResponse, Use1inchCandlesParams } from '@/interfaces/candles.interface'

// https://portal.1inch.dev/documentation/apis/charts/swagger?method=get&path=%2Fv1.0%2Fchart%2Faggregated%2Fcandle%2F%7Btoken0%7D%2F%7Btoken1%7D%2F%7Bseconds%7D%2F%7BchainId%7D
async function fetch1inchCandles({ token0, token1, seconds, chainId }: Omit<Use1inchCandlesParams, 'enabled'>): Promise<CandlesResponse> {
    try {
        const params = new URLSearchParams({
            token0: token0.toLowerCase(),
            token1: token1.toLowerCase(),
            seconds: seconds.toString(),
            chainId: chainId.toString(),
        })

        const response = await fetch(`/api/1inch/candles?${params}`)

        // Handle non-OK responses
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Network error')
            let errorMessage = 'Failed to fetch candles'

            try {
                const errorData = JSON.parse(errorText)
                errorMessage = errorData.error || errorMessage
            } catch {
                // If parsing fails, use the status text
                errorMessage = `Failed to fetch candles: ${response.status} ${response.statusText}`
            }

            console.error(`API Error (${response.status}):`, errorText)
            throw new Error(errorMessage)
        }

        // Parse response safely
        const data: CandlesResponse = await response.json()

        // Validate response structure
        if (!data.data || !Array.isArray(data.data)) {
            console.error('Invalid API response:', data)
            throw new Error('Invalid response format from 1inch API')
        }

        return data
    } catch (error) {
        // Re-throw with more context
        if (error instanceof Error) {
            throw error
        }
        throw new Error('An unexpected error occurred while fetching candles')
    }
}

export function use1inchCandles({ token0, token1, seconds, chainId, enabled = true }: Use1inchCandlesParams) {
    const queryResult = useQuery({
        queryKey: [ReactQueryKeys.CANDLES, token0, token1, seconds, chainId],
        queryFn: () => fetch1inchCandles({ token0, token1, seconds, chainId }),
        enabled: enabled && !!token0 && !!token1,
        // Retry configuration
        retry: (failureCount, error) => {
            // Don't retry on 4xx errors
            if (error instanceof Error && error.message.includes('4')) {
                return false
            }
            // Retry up to 2 times for other errors (less retries for external API)
            return failureCount < 2
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        // Refetch configuration
        refetchInterval: (data) => {
            // Only refetch if we have data
            if (!data) return false
            // Match server cache TTL
            return seconds === 300 || seconds === 900 ? 15000 : 30000
        },
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        // Stale time - match server cache
        staleTime: seconds === 300 || seconds === 900 ? 10000 : 25000,
        // Cache time - keep data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
    })

    const { data, error } = queryResult

    return {
        ...queryResult,
        candles: data?.data || [],
        hasError: !!error && !data,
    }
}

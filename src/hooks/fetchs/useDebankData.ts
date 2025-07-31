'use client'

import { useQuery } from '@tanstack/react-query'
import { AppUrls, ReactQueryKeys } from '@/enums'
import type { DebankApiResponse, DebankUserNetWorthUsd, UseDebankDataParams } from '@/interfaces/debank.interface'

export async function fetchDebankData({ walletAddress, chainId }: UseDebankDataParams): Promise<DebankApiResponse['data']> {
    if (!walletAddress || !chainId) {
        return {
            networth: { usd_value: 0 } as DebankUserNetWorthUsd,
            debankLast24hNetWorth: [],
        }
    }

    try {
        const response = await fetch(`${AppUrls.API_DEBANK}/networth?walletAddress=${encodeURIComponent(walletAddress)}&chainId=${chainId}`)

        // Handle non-OK responses
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Network error')
            console.error(`Debank API Error (${response.status}):`, errorText)
            throw new Error(`Failed to fetch Debank data: ${response.status} ${response.statusText}`)
        }

        // Parse response
        const text = await response.text()
        let data: DebankApiResponse

        try {
            data = JSON.parse(text)
        } catch {
            console.error('Failed to parse Debank response:', text)
            throw new Error('Invalid JSON response from Debank API')
        }

        // Validate response structure
        if (!data || typeof data !== 'object' || !data.success) {
            console.error('Invalid Debank API response:', data)
            throw new Error(data?.error || 'Invalid response format from Debank API')
        }

        return data.data
    } catch (error) {
        // Re-throw with more context
        if (error instanceof Error) {
            throw error
        }
        throw new Error('An unexpected error occurred while fetching Debank data')
    }
}

export function useDebankData({ walletAddress, chainId }: UseDebankDataParams, refreshInterval = 0) {
    const queryResult = useQuery({
        queryKey: [ReactQueryKeys.DEBANK, walletAddress ?? '', chainId ?? ''],
        queryFn: () => fetchDebankData({ walletAddress, chainId }),
        enabled: !!walletAddress && !!chainId,
        // Retry configuration
        retry: (failureCount, error) => {
            // Don't retry on 4xx errors
            if (error instanceof Error && error.message.includes('4')) {
                return false
            }
            // Retry up to 2 times for other errors (less than prices since this is external API)
            return failureCount < 2
        },
        retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 30000),
        // Refetch configuration
        refetchInterval: (data) => {
            // Only refetch if we have data and refreshInterval is positive
            return data && refreshInterval > 0 ? refreshInterval : false
        },
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        // Stale time - data is fresh for 30 minutes to minimize API calls
        staleTime: 30 * 60 * 1000,
        // Cache time - keep data in cache for 24 hours
        gcTime: 24 * 60 * 60 * 1000,
    })

    const { data, isLoading, error, refetch, isRefetching } = queryResult

    return {
        networth: data?.networth || ({ usd_value: 0 } as DebankUserNetWorthUsd),
        debankLast24hNetWorth: data?.debankLast24hNetWorth || [],
        isLoading,
        isRefetching,
        error,
        refetch,
    }
}

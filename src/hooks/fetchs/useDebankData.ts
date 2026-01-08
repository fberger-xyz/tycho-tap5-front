'use client'

import { useQuery } from '@tanstack/react-query'
import { AppUrls, ReactQueryKeys } from '@/enums'
import type { DebankApiResponse, DebankUserNetWorthUsd, UseDebankDataParams } from '@/interfaces/debank.interface'
import { DEBANK_QUERY_CONFIG } from '@/config/query.config'
import { logger } from '@/utils/logger.util'

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
            logger.error(`Debank API Error (${response.status}):`, { error: errorText })
            throw new Error(`Failed to fetch Debank data: ${response.status} ${response.statusText}`)
        }

        // Parse response
        const text = await response.text()
        let data: DebankApiResponse

        try {
            data = JSON.parse(text)
        } catch {
            logger.error('Failed to parse Debank response:', { response: text })
            throw new Error('Invalid JSON response from Debank API')
        }

        // Validate response structure
        if (!data || typeof data !== 'object' || !data.success) {
            logger.error('Invalid Debank API response:', { error: data })
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
        ...DEBANK_QUERY_CONFIG,
        // Override refetchInterval if provided
        refetchInterval: (data) => {
            // Only refetch if we have data and refreshInterval is positive
            return data && refreshInterval > 0 ? refreshInterval : false
        },
        refetchIntervalInBackground: false,
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

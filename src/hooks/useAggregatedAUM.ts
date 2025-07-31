'use client'

import { useQueries } from '@tanstack/react-query'
import { useStrategies } from './fetchs/useStrategies'
import { fetchDebankData } from './fetchs/useDebankData'
import { extractUniqueWalletChains } from '@/utils'
import { ReactQueryKeys } from '@/enums'

/**
 * Hook to get the total AUM across all strategies
 */
export function useAggregatedAUM() {
    const { configurations, isLoading: isLoadingConfigs, error } = useStrategies()

    // Extract unique wallet/chain combinations
    const walletChainPairs = configurations ? extractUniqueWalletChains(configurations) : []

    // Fetch Debank data for each wallet/chain combination
    const debankQueries = useQueries({
        queries: walletChainPairs.map(({ walletAddress, chainId }) => ({
            queryKey: [ReactQueryKeys.DEBANK, walletAddress, chainId],
            queryFn: () => fetchDebankData({ walletAddress, chainId }),
            enabled: !!walletAddress && !!chainId && !!configurations,
            // Use same caching as useDebankData hook
            staleTime: 30 * 60 * 1000,
            gcTime: 24 * 60 * 60 * 1000,
            refetchInterval: false as const,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        })),
    })

    // Calculate total AUM
    const totalAUM = debankQueries.reduce((sum, query) => {
        if (query.data?.networth?.usd_value) {
            return sum + Number(query.data.networth.usd_value)
        }
        return sum
    }, 0)

    const isLoading = isLoadingConfigs || debankQueries.some((q) => q.isLoading)

    return {
        totalAUM,
        isLoading,
        error,
        formattedTotalAUM: totalAUM.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        }),
    }
}

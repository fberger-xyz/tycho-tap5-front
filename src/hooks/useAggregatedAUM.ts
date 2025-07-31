'use client'

import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useStrategies } from './fetchs/useStrategies'
import { extractUniqueWalletChains } from '@/utils'
import { fetchDebankData } from './fetchs/useDebankData'
import { ReactQueryKeys } from '@/enums'
import { DEBANK_QUERY_CONFIG } from '@/config/query.config'

/**
 * Hook to get the total AUM across all strategies
 * This hook aggregates AUM from all unique wallet/chain combinations
 */
export function useAggregatedAUM() {
    const { configurations, isLoading: isLoadingConfigs, error: configError } = useStrategies()

    // Extract unique wallet/chain combinations
    const walletChainPairs = useMemo(() => (configurations ? extractUniqueWalletChains(configurations) : []), [configurations])

    // Fetch AUM for all wallet/chain pairs in parallel
    const aumQueries = useQueries({
        queries: walletChainPairs.map(({ walletAddress, chainId }) => ({
            queryKey: [ReactQueryKeys.DEBANK, walletAddress, chainId],
            queryFn: () => fetchDebankData({ walletAddress, chainId }),
            enabled: !!walletAddress && !!chainId,
            ...DEBANK_QUERY_CONFIG,
        })),
    })

    // Calculate totals and loading state
    const isLoading = isLoadingConfigs || aumQueries.some((query) => query.isLoading)
    const hasError = configError || aumQueries.some((query) => query.error)

    // Sum up all AUM values
    const totalAUM = useMemo(() => {
        if (isLoading || hasError) return 0

        return aumQueries.reduce((sum, query) => {
            const usdValue = query.data?.networth?.usd_value || 0
            return sum + usdValue
        }, 0)
    }, [aumQueries, isLoading, hasError])

    return {
        totalAUM,
        isLoading,
        error: hasError ? new Error('Failed to fetch AUM data') : undefined,
    }
}

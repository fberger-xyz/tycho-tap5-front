'use client'

import { useMemo } from 'react'
import { useStrategies } from './fetchs/useStrategies'
import { extractUniqueWalletChains } from '@/utils'

/**
 * Hook to get the total AUM across all strategies
 * This hook aggregates AUM from all unique wallet/chain combinations
 */
export function useAggregatedAUM() {
    const { configurations, isLoading: isLoadingConfigs, error } = useStrategies()

    // Extract unique wallet/chain combinations
    const walletChainPairs = useMemo(() => (configurations ? extractUniqueWalletChains(configurations) : []), [configurations])

    // For now, return a simple aggregated value
    // In a real implementation, you might want to fetch all AUMs in parallel
    // But for simplicity and to avoid N+1 queries, we'll return a placeholder
    // This hook can be enhanced later if needed for a specific use case

    const isLoading = isLoadingConfigs

    return {
        totalAUM: 0, // Placeholder - implement if/when needed
        isLoading,
        error,
        formattedTotalAUM: '$0.00',
        walletChainPairs, // Expose for components that need it
    }
}

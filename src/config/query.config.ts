/**
 * React Query configuration constants
 * Standardized caching strategies for consistency across the app
 */

// Fast-changing data (pools, trades, prices)
export const REALTIME_QUERY_CONFIG = {
    staleTime: 0, // Always consider stale for immediate updates
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    refetchInterval: 5000, // 5 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
    retry: 1, // Only retry once for fast data
    retryDelay: 1000,
} as const

// Medium-changing data (strategies, configurations)
export const STANDARD_QUERY_CONFIG = {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: 60000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchIntervalInBackground: false,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
} as const

// Slow-changing data (wallet balances, token lists)
export const DEBANK_QUERY_CONFIG = {
    // Data is fresh for 30 minutes to minimize API calls
    staleTime: 30 * 60 * 1000,
    // Keep data in cache for 24 hours
    gcTime: 24 * 60 * 60 * 1000,
    refetchInterval: false as const,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount: number, error: Error) => {
        // Don't retry on 4xx errors
        if (error.message.includes('4')) {
            return false
        }
        // Retry up to 2 times for other errors
        return failureCount < 2
    },
    retryDelay: (attemptIndex: number) => Math.min(2000 * 2 ** attemptIndex, 30000),
} as const

// Chain-specific configurations
export const getChainSpecificConfig = (chainId: string | number) => {
    // Ethereum mainnet gets slower refresh due to higher block times
    const isMainnet = chainId === 'ethereum' || chainId === 1

    return {
        ...REALTIME_QUERY_CONFIG,
        refetchInterval: isMainnet ? 12000 : 5000, // 12s for mainnet, 5s for others
        staleTime: isMainnet ? 10000 : 0, // 10s stale time for mainnet
    }
}

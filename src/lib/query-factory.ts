import { ReactQueryKeys } from '@/enums'

interface QueryConfig {
    queryKey: readonly unknown[]
    retry?: number | boolean | ((failureCount: number, error: unknown) => boolean)
    retryDelay?: number | ((attemptIndex: number) => number)
    refetchInterval?: number | false | ((data: unknown) => number | false)
    refetchOnWindowFocus?: boolean
    refetchIntervalInBackground?: boolean
    refetchOnMount?: boolean
    staleTime?: number
    gcTime?: number
    enabled?: boolean
}

/**
 * Centralized query configurations for consistent behavior across the app
 */

// Base retry logic - reusable across all queries
const baseRetryConfig = {
    retry: (failureCount: number, error: unknown) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
            return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
}

// Refetch intervals by data type
export const REFETCH_INTERVALS = {
    CRITICAL: 5_000, // 5s for critical real-time data (trades)
    ETHEREUM_BLOCKS: 12_000, // 12s for Ethereum mainnet (block time)
    FREQUENT: 15_000, // 15s for frequently changing data
    STANDARD: 30_000, // 30s for standard data
    SLOW: 45_000, // 45s for rarely changing data
    MINUTE: 60_000, // 1m for slow-changing data
} as const

// Stale times - how long data is considered fresh
export const STALE_TIMES = {
    INSTANT: 2_000, // 2s for real-time data
    SHORT: 10_000, // 10s for frequently changing data
    MEDIUM: 25_000, // 25s for moderate frequency
    LONG: 40_000, // 40s for slow-changing data
} as const

// Cache times - how long to keep data in cache
export const CACHE_TIMES = {
    SHORT: 60_000, // 1 minute
    STANDARD: 5 * 60_000, // 5 minutes
    LONG: 10 * 60_000, // 10 minutes
} as const

/**
 * Query factory for creating consistent query configurations
 */
export const queryFactory = {
    // Strategies & Configurations
    strategies: {
        all: (): QueryConfig => ({
            queryKey: [ReactQueryKeys.STRATEGIES],
            ...baseRetryConfig,
            refetchInterval: REFETCH_INTERVALS.SLOW,
            refetchOnWindowFocus: false,
            refetchIntervalInBackground: false,
            refetchOnMount: false,
            staleTime: STALE_TIMES.LONG,
            gcTime: CACHE_TIMES.STANDARD,
        }),
        byId: (id: string): QueryConfig => ({
            queryKey: [ReactQueryKeys.STRATEGIES, id],
            ...baseRetryConfig,
            enabled: !!id,
            staleTime: STALE_TIMES.LONG,
            gcTime: CACHE_TIMES.STANDARD,
        }),
    },

    // Trades
    trades: {
        all: (configurationId?: string): QueryConfig => ({
            queryKey: [ReactQueryKeys.TRADES, configurationId],
            ...baseRetryConfig,
            refetchInterval: REFETCH_INTERVALS.CRITICAL,
            refetchOnWindowFocus: false,
            refetchIntervalInBackground: false,
            staleTime: STALE_TIMES.INSTANT,
            gcTime: CACHE_TIMES.STANDARD,
        }),
        byInstance: (instanceId: string): QueryConfig => ({
            queryKey: [ReactQueryKeys.TRADES, 'instance', instanceId],
            ...baseRetryConfig,
            enabled: !!instanceId,
            refetchInterval: REFETCH_INTERVALS.CRITICAL,
            staleTime: STALE_TIMES.INSTANT,
            gcTime: CACHE_TIMES.STANDARD,
        }),
    },

    // Prices
    prices: {
        byInstance: (instanceId: string): QueryConfig => ({
            queryKey: [ReactQueryKeys.PRICES, instanceId],
            ...baseRetryConfig,
            enabled: !!instanceId,
            refetchInterval: REFETCH_INTERVALS.STANDARD,
            refetchOnWindowFocus: false,
            refetchIntervalInBackground: false,
            staleTime: STALE_TIMES.SHORT,
            gcTime: CACHE_TIMES.STANDARD,
        }),
        candles: (token0: string, token1: string, seconds: number, chainId: number): QueryConfig => ({
            queryKey: [ReactQueryKeys.CANDLES, token0, token1, seconds, chainId],
            ...baseRetryConfig,
            retry: 2, // Less retries for external API
            enabled: !!token0 && !!token1,
            refetchInterval: seconds === 300 || seconds === 900 ? REFETCH_INTERVALS.FREQUENT : REFETCH_INTERVALS.STANDARD,
            refetchOnWindowFocus: false,
            refetchIntervalInBackground: false,
            refetchOnMount: false,
            staleTime: seconds === 300 || seconds === 900 ? STALE_TIMES.SHORT : STALE_TIMES.MEDIUM,
            gcTime: CACHE_TIMES.LONG,
        }),
    },

    // Pools/Orderbook
    pools: {
        orderbook: (chain: string, token0: string, token1: string, pointToken?: string, pointAmount?: number): QueryConfig => ({
            queryKey: ['orderbook', chain, token0, token1, pointToken, pointAmount],
            ...baseRetryConfig,
            enabled: !!chain && !!token0 && !!token1,
            refetchInterval: chain === 'ethereum' ? REFETCH_INTERVALS.ETHEREUM_BLOCKS : REFETCH_INTERVALS.CRITICAL,
            staleTime: chain === 'ethereum' ? STALE_TIMES.SHORT : STALE_TIMES.INSTANT,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        }),
    },

    // External APIs
    debank: {
        networth: (walletAddress: string, chainId: number): QueryConfig => ({
            queryKey: [ReactQueryKeys.DEBANK, walletAddress, chainId],
            ...baseRetryConfig,
            enabled: !!walletAddress && !!chainId,
            refetchInterval: false, // Manual refresh only by default
            staleTime: STALE_TIMES.LONG,
            gcTime: CACHE_TIMES.LONG,
        }),
        tokenList: (walletAddress: string, chainId: number, isAll: boolean): QueryConfig => ({
            queryKey: ['debank-token-list', walletAddress, chainId, isAll],
            ...baseRetryConfig,
            enabled: !!walletAddress && !!chainId,
            refetchInterval: REFETCH_INTERVALS.MINUTE,
            staleTime: STALE_TIMES.MEDIUM,
            gcTime: CACHE_TIMES.STANDARD,
        }),
    },

    // Balances
    balances: {
        inventories: (walletAddress: string, tokenAddresses: string[], chainId: number, includeNative: boolean): QueryConfig => ({
            queryKey: ['inventories', walletAddress, tokenAddresses, chainId, includeNative],
            ...baseRetryConfig,
            enabled: !!walletAddress,
            refetchInterval: REFETCH_INTERVALS.FREQUENT,
            staleTime: STALE_TIMES.SHORT,
            gcTime: CACHE_TIMES.SHORT,
        }),
        native: (walletAddress: string, chainId: number): QueryConfig => ({
            queryKey: ['native-balance', walletAddress, chainId],
            ...baseRetryConfig,
            enabled: !!walletAddress && !!chainId,
            refetchInterval: REFETCH_INTERVALS.FREQUENT,
            staleTime: STALE_TIMES.SHORT,
            gcTime: CACHE_TIMES.SHORT,
        }),
    },

    // Dashboard/Instances
    instances: {
        all: (): QueryConfig => ({
            queryKey: [ReactQueryKeys.INSTANCES],
            ...baseRetryConfig,
            refetchInterval: REFETCH_INTERVALS.STANDARD,
            refetchOnWindowFocus: false,
            refetchIntervalInBackground: false,
            staleTime: STALE_TIMES.SHORT,
            gcTime: CACHE_TIMES.STANDARD,
        }),
    },
}

/**
 * Helper to coordinate refetch intervals and prevent API hammering
 * Returns staggered intervals to avoid all queries firing at once
 */
export function getStaggeredInterval(baseInterval: number, offset: number): number {
    return baseInterval + offset
}

/**
 * Helper to determine if data should refetch based on age
 */
export function shouldRefetch(dataUpdatedAt: number, maxAge: number): boolean {
    return Date.now() - dataUpdatedAt > maxAge
}

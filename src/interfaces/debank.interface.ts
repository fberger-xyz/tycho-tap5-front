export interface DebankUserNetWorthUsd {
    usd_value: number
}

export interface DebankUserNetWorthUsdSnapshot {
    timestamp: number
    usd_value: number
}

/**
 * api response
 */

export interface DebankApiResponse {
    success: boolean
    error: string
    data: {
        networth: { usd_value: number }
        debankLast24hNetWorth: DebankUserNetWorthUsdSnapshot[]
    }
}

/**
 * client hook
 */

export interface UseDebankDataParams {
    walletAddress?: string
    chainId?: number
}

/**
 * Token list types
 */

export interface DebankToken {
    id: string
    chain: string
    name: string | null
    symbol: string | null
    display_symbol: string | null
    optimized_symbol: string | null
    decimals: number | null
    logo_url: string | null
    is_core: boolean
    price: number
    time_at: number | null
    amount: number
    raw_amount: number
}

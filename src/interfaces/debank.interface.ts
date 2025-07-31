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

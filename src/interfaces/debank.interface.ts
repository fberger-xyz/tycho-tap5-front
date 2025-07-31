export interface DebankUserNetWorthUsd {
    usd_value: number
}

export interface DebankUserNetWorthUsdSnapshot {
    timestamp: number
    usd_value: number
}

export interface DebankUserSimpleProtocolList {
    id: string
    chain: string
    name: string
    site_url: string
    logo_url: string
    has_supported_portfolio: boolean
    tvl: number
    net_usd_value: number
    asset_usd_value: number
    debt_usd_value: number
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

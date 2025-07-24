export interface TokenBalance {
    address: string
    balance: string
    decimals: number
    symbol?: string
}

export interface UseInventoriesParams {
    walletAddress?: string
    tokenAddresses: string[]
    chainId: number
    enabled?: boolean
}

export interface BalancesApiResponse {
    balances: TokenBalance[]
}

export interface BalancesApiRequest {
    walletAddress: string
    tokenAddresses: string[]
    chainId: number
}

export interface BalancesApiError {
    error: string
}

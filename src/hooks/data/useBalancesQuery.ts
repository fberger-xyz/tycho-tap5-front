'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { CHAINS_CONFIG } from '@/config/chains.config'

interface TokenBalance {
    address: string
    balance: string
    decimals: number
    symbol?: string
}

interface UseBalancesQueryParams {
    walletAddress?: string
    tokenAddresses?: string[]
    chainId?: number
    includeNative?: boolean
}

/**
 * Clean hook for fetching token balances
 */
export function useBalancesQuery({ walletAddress, tokenAddresses = [], chainId, includeNative = true }: UseBalancesQueryParams) {
    return useQuery<TokenBalance[]>({
        queryKey: ['inventories', walletAddress || '', tokenAddresses, chainId || 0, includeNative],
        queryFn: () =>
            apiClient.balances.get({
                walletAddress: walletAddress!,
                tokenAddresses,
                chainId: chainId!,
                includeNative,
            }),
        enabled: !!walletAddress && !!chainId,
        refetchInterval: 15000, // 15 seconds
        staleTime: 10000, // 10 seconds
        gcTime: 60000, // 1 minute
    })
}

/**
 * Specialized hook for native token balance with threshold checking
 */
export function useNativeBalanceQuery({ walletAddress, chainId }: { walletAddress?: string; chainId?: number }) {
    const query = useBalancesQuery({
        walletAddress,
        chainId,
        tokenAddresses: [],
        includeNative: true,
    })

    const nativeBalance = query.data?.find((b: TokenBalance) => b.address === '0x0000000000000000000000000000000000000000')

    const balance = nativeBalance ? parseFloat(nativeBalance.balance) / Math.pow(10, 18) : 0

    const chainConfig = chainId ? CHAINS_CONFIG[chainId] : null
    const threshold = chainConfig?.showTopUpBannerIfEthBalanceBelow || 0

    return {
        ...query,
        balance,
        isEthBalanceBelowThreshold: balance < threshold,
        threshold,
    }
}

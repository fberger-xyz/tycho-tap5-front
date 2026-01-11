'use client'

import { useQuery } from '@tanstack/react-query'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { ReactQueryKeys } from '@/enums'
import { logger } from '@/utils/logger.util'

interface UseEthBalanceParams {
    walletAddress?: string
    chainId?: number
}

interface BalanceResponse {
    balances: Array<{
        address: string
        balance: string
        decimals: number
        symbol?: string
    }>
}

async function fetchEthBalance(walletAddress: string, chainId: number): Promise<number> {
    try {
        const response = await fetch('/api/balances', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletAddress,
                tokenAddresses: [],
                chainId,
                includeNative: true,
            }),
        })

        if (!response.ok) throw new Error(`Failed to fetch balance: ${response.status}`)

        const data: BalanceResponse = await response.json()
        const nativeBalance = data.balances?.find((b) => b.address === '0x0000000000000000000000000000000000000000')

        if (nativeBalance) return parseFloat(nativeBalance.balance) / Math.pow(10, 18)
        return 0
    } catch (error) {
        logger.error('Error fetching ETH balance:', { error: error instanceof Error ? error.message : String(error) })
        return 0
    }
}

export function useEthBalance({ walletAddress, chainId }: UseEthBalanceParams) {
    const queryResult = useQuery({
        queryKey: [ReactQueryKeys.ETH_BALANCE, walletAddress ?? '', chainId ?? 0],
        queryFn: () => fetchEthBalance(walletAddress!, chainId!),
        enabled: !!walletAddress && !!chainId,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    })

    // threshold logic
    const chainConfig = chainId ? CHAINS_CONFIG[chainId] : null
    const threshold = chainConfig?.showTopUpBannerIfEthBalanceBelow || 0

    return {
        balance: queryResult.data ?? 0,
        isEthBalanceLoading: queryResult.isLoading,
        isEthBalanceBelowThreshold: !queryResult.isLoading && (queryResult.data ?? 0) < threshold,
        error: queryResult.error,
        threshold,
    }
}

import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { UseInventoriesParams, TokenBalance, BalancesApiResponse } from '@/interfaces'
import { createRequest } from '@/utils/requests.util'

export function useInventories({
    walletAddress,
    tokenAddresses,
    chainId,
    enabled = true,
    includeNative = true,
}: UseInventoriesParams & { includeNative?: boolean }) {
    const fetchBalances = async (): Promise<TokenBalance[]> => {
        if (!walletAddress) {
            return []
        }

        const result = await createRequest<BalancesApiResponse>('/api/balances', {
            method: 'POST',
            body: JSON.stringify({
                walletAddress,
                tokenAddresses,
                chainId,
                includeNative,
            }),
        })

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch balances')
        }

        return result.data?.balances || []
    }

    return useQuery({
        queryKey: ['inventories', walletAddress, tokenAddresses, chainId, includeNative],
        queryFn: fetchBalances,
        enabled: enabled && !!walletAddress,
        refetchInterval: 15000, // Refetch every 15 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
    })
}

// Helper function to format balance with decimals
export function formatTokenBalance(balance: string, decimals: number): string {
    return ethers.utils.formatUnits(balance, decimals)
}

// Helper function to parse balance to wei
export function parseTokenBalance(balance: string, decimals: number): string {
    return ethers.utils.parseUnits(balance, decimals).toString()
}

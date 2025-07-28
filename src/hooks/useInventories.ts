import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { UseInventoriesParams, TokenBalance, BalancesApiResponse } from '@/interfaces'

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

        try {
            const response = await fetch('/api/balances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress,
                    tokenAddresses,
                    chainId,
                    includeNative, // Pass this to the API
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                throw new Error(errorData.error || `Failed to fetch balances: ${response.status}`)
            }

            const data: BalancesApiResponse = await response.json()
            return data.balances
        } catch (error) {
            console.error('Failed to fetch balances:', error)
            throw error
        }
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

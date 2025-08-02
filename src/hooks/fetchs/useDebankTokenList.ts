'use client'

import { useQuery } from '@tanstack/react-query'
import { DebankToken } from '@/interfaces/debank.interface'

interface UseDebankTokenListParams {
    walletAddress?: string
    chainId?: number
    isAll?: boolean
}

interface ApiResponse {
    success: boolean
    error: string
    data: DebankToken[]
}

export function useDebankTokenList({ walletAddress, chainId, isAll = true }: UseDebankTokenListParams) {
    const queryKey = ['debank-token-list', walletAddress, chainId, isAll]

    const { data, isLoading, error } = useQuery<ApiResponse>({
        queryKey,
        queryFn: async () => {
            const params = new URLSearchParams({
                walletAddress: walletAddress || '',
                chainId: chainId?.toString() || '',
                isAll: isAll.toString(),
            })

            const response = await fetch(`/api/debank/token-list?${params}`)
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch token list')
            }

            return result
        },
        enabled: !!walletAddress && !!chainId,
        refetchInterval: 60000, // Refetch every minute
        staleTime: 30000, // Consider data stale after 30 seconds
    })

    return {
        tokens: data?.data || [],
        isLoading,
        hasError: !!error,
        error: error as Error | undefined,
    }
}

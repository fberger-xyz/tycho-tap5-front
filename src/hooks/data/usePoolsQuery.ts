'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

interface UsePoolsQueryParams {
    chain: string
    token0: string
    token1: string
    pointToken?: string
    pointAmount?: number
    enabled?: boolean
}

/**
 * Clean hook for fetching orderbook/pools data
 */
export function usePoolsQuery({ chain, token0, token1, pointToken, pointAmount, enabled = true }: UsePoolsQueryParams) {
    const refetchInterval = chain === 'ethereum' ? 12000 : 5000
    const staleTime = chain === 'ethereum' ? 10000 : 2000

    return useQuery({
        queryKey: ['orderbook', chain, token0, token1, pointToken, pointAmount],
        queryFn: () => apiClient.orderbook.get({ chain, token0, token1, pointToken, pointAmount }),
        enabled: enabled && !!chain && !!token0 && !!token1,
        refetchInterval,
        staleTime,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    })
}

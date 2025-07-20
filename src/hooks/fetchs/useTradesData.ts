'use client'

import { useQuery } from '@tanstack/react-query'
import { ReactQueryKeys } from '@/enums'
import { transformTrade } from '@/utils'
import { ApiTrade, TradeData } from '@/interfaces'

/**
 * ------------------------ 2 api response
 */

interface ApiResponse {
    trades: ApiTrade[]
}

/**
 * ------------------------ 3 fetch trades
 */

async function fetchTrades(): Promise<TradeData[]> {
    const response = await fetch('/api/trades?limit=100')

    if (!response.ok) {
        throw new Error(`Failed to fetch trades: ${response.status} ${response.statusText}`)
    }

    const data: ApiResponse = await response.json()

    if (!data.trades || !Array.isArray(data.trades)) {
        throw new Error('Invalid API response format')
    }

    return data.trades.map(transformTrade)
}

export function useTradesData(refreshInterval = 5000) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [ReactQueryKeys.TRADES],
        queryFn: fetchTrades,
        refetchInterval: refreshInterval,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
    })

    return {
        trades: data || [],
        isLoading,
        error,
        refetch,
    }
}

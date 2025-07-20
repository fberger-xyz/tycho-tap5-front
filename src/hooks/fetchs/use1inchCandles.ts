'use client'

import { useQuery } from '@tanstack/react-query'
import { ReactQueryKeys } from '@/enums'

export interface CandleData {
    time: number
    open: number
    high: number
    low: number
    close: number
}

export interface CandlesResponse {
    data: CandleData[]
}

interface Use1inchCandlesParams {
    token0: string
    token1: string
    seconds: number
    chainId: number
    enabled?: boolean
}

async function fetch1inchCandles({ token0, token1, seconds, chainId }: Omit<Use1inchCandlesParams, 'enabled'>): Promise<CandlesResponse> {
    const params = new URLSearchParams({
        token0,
        token1,
        seconds: seconds.toString(),
        chainId: chainId.toString(),
    })
    const response = await fetch(`/api/1inch/candles?${params}`)
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch candles')
    }
    return response.json()
}

export function use1inchCandles({ token0, token1, seconds, chainId, enabled = true }: Use1inchCandlesParams) {
    return useQuery({
        queryKey: [ReactQueryKeys.CANDLES, token0, token1, seconds, chainId],
        queryFn: () => fetch1inchCandles({ token0, token1, seconds, chainId }),
        enabled: enabled && !!token0 && !!token1,
        refetchInterval: seconds === 300 || seconds === 900 ? 15000 : 30000, // Match server cache TTL
        staleTime: seconds === 300 || seconds === 900 ? 10000 : 25000,
    })
}

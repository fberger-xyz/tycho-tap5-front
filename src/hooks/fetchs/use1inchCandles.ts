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

// https://portal.1inch.dev/documentation/apis/charts/swagger?method=get&path=%2Fv1.0%2Fchart%2Faggregated%2Fcandle%2F%7Btoken0%7D%2F%7Btoken1%7D%2F%7Bseconds%7D%2F%7BchainId%7D
async function fetch1inchCandles({ token0, token1, seconds, chainId }: Omit<Use1inchCandlesParams, 'enabled'>): Promise<CandlesResponse> {
    const params = new URLSearchParams({
        token0: token0.toLowerCase(),
        token1: token1.toLowerCase(),
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

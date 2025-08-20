'use client'

import { useQuery } from '@tanstack/react-query'
import { ReactQueryKeys } from '@/enums'
import { roundPrice } from '@/config/chart-constants.config'

interface BinancePriceParams {
    baseSymbol: string
    quoteSymbol: string
    enabled?: boolean
    refetchInterval?: number
}

interface BinancePriceResponse {
    price: number
    symbol: string
    source: string
    timestamp: string
}

async function fetchBinancePrice({ baseSymbol, quoteSymbol }: Omit<BinancePriceParams, 'enabled' | 'refetchInterval'>): Promise<number | null> {
    try {
        const response = await fetch(`/api/binance/price?base=${baseSymbol}&quote=${quoteSymbol}`)

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Network error')
            console.warn(`Binance price API Error (${response.status}):`, errorText)
            throw new Error('Failed to fetch Binance price')
        }

        const data: BinancePriceResponse = await response.json()

        if (data.price) {
            return roundPrice(data.price)
        }

        return null
    } catch (error) {
        // Don't throw for Binance errors - return null
        // This allows the chart to render with fallback price
        console.warn('Binance price fetch failed:', error)
        return null
    }
}

export function useBinancePrice({ baseSymbol, quoteSymbol, enabled = true, refetchInterval = 12000 }: BinancePriceParams) {
    const queryResult = useQuery({
        queryKey: [ReactQueryKeys.BINANCE_PRICE, baseSymbol, quoteSymbol],
        queryFn: () => fetchBinancePrice({ baseSymbol, quoteSymbol }),
        enabled: enabled && !!baseSymbol && !!quoteSymbol,
        // Retry configuration
        retry: (failureCount) => failureCount < 1,
        retryDelay: 2000,
        // Refetch configuration - frequent updates for live price
        refetchInterval,
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: true, // Keep updating in background for live price
        refetchOnMount: false,
        // Keep previous data during refetches
        placeholderData: (previousData) => previousData,
        // Stale time - consider data fresh for 5 seconds
        staleTime: 5000,
        // Cache time - keep in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
    })

    return {
        ...queryResult,
        binancePrice: queryResult.data ?? null,
    }
}

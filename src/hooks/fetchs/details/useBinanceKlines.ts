'use client'

import { useQuery } from '@tanstack/react-query'
import { ReactQueryKeys } from '@/enums'
import { CandlestickDataPoint } from '@/components/charts/CandlestickChart'
import { roundPrice } from '@/config/chart-constants.config'
import { logger } from '@/utils/logger.util'

interface BinanceKlinesParams {
    baseSymbol: string
    quoteSymbol: string
    seconds: number
    enabled?: boolean
}

interface BinanceKlinesResponse {
    data: Array<{
        time: number
        open: number
        high: number
        low: number
        close: number
        volume: number
    }>
    symbol: string
    source: string
    interval: string
    timestamp: string
}

async function fetchBinanceKlines({ baseSymbol, quoteSymbol, seconds }: Omit<BinanceKlinesParams, 'enabled'>): Promise<CandlestickDataPoint[]> {
    try {
        const response = await fetch(`/api/binance/klines?base=${baseSymbol}&quote=${quoteSymbol}&seconds=${seconds}`)

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Network error')
            let errorMessage = 'Failed to fetch Binance klines'

            try {
                const errorData = JSON.parse(errorText)
                errorMessage = errorData.error || errorMessage
            } catch {
                errorMessage = `Failed to fetch Binance klines: ${response.status} ${response.statusText}`
            }

            logger.warn(`Binance API Error (${response.status}):`, { warning: errorText })
            throw new Error(errorMessage)
        }

        const data: BinanceKlinesResponse = await response.json()

        if (!data.data || !Array.isArray(data.data)) {
            logger.warn('Invalid Binance API response:', { warning: data })
            throw new Error('Invalid response format from Binance API')
        }

        // Transform to CandlestickDataPoint format
        return data.data.map((kline) => ({
            time: kline.time * 1000, // Convert to milliseconds
            open: roundPrice(kline.open),
            high: roundPrice(kline.high),
            low: roundPrice(kline.low),
            close: roundPrice(kline.close),
            volume: kline.volume,
        }))
    } catch (error) {
        // Don't throw for Binance errors - return empty array
        // This allows the chart to render with 1inch data even if Binance fails
        logger.warn('Binance klines fetch failed:', { warning: error })
        return []
    }
}

export function useBinanceKlines({ baseSymbol, quoteSymbol, seconds, enabled = true }: BinanceKlinesParams) {
    const queryResult = useQuery({
        queryKey: [ReactQueryKeys.BINANCE_KLINES, baseSymbol, quoteSymbol, seconds],
        queryFn: () => fetchBinanceKlines({ baseSymbol, quoteSymbol, seconds }),
        enabled: enabled && !!baseSymbol && !!quoteSymbol,
        // Retry configuration - less aggressive for external API
        retry: (failureCount) => failureCount < 1,
        retryDelay: 2000,
        // Refetch configuration - match Binance rate limits
        refetchInterval: 30000, // 30 seconds
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        refetchOnMount: false,
        // Keep previous data during refetches
        placeholderData: (previousData) => previousData,
        // Stale time - consider data fresh for 20 seconds
        staleTime: 20000,
        // Cache time - keep in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
    })

    return {
        ...queryResult,
        binanceKlines: queryResult.data || null,
    }
}

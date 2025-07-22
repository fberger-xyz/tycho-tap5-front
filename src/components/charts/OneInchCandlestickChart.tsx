'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import CandlestickChart, { CandlestickDataPoint } from './CandlestickChart'
import { use1inchCandles } from '@/hooks/fetchs/details/use1inchCandles'
import { ChartColors } from '@/config/chart-colors.config'
import { EnrichedInstance } from '@/types'

export default function OneInchCandlestickChart({
    instance,
    seconds = 300, // Default to 5 minute candles
    chainId = 1, // Default to Ethereum mainnet
    symbol,
}: {
    instance: EnrichedInstance
    seconds?: number
    chainId?: number
    symbol?: string
}) {
    const { resolvedTheme } = useTheme()
    const colors = resolvedTheme === 'dark' ? ChartColors.dark : ChartColors.light
    const { data, isLoading, error } = use1inchCandles({
        token0: instance.base?.address?.toLowerCase() ?? '',
        token1: instance.quote?.address?.toLowerCase() ?? '',
        seconds,
        chainId,
        enabled: !!instance.base?.address && !!instance.quote?.address,
    })

    const candlestickData = useMemo<CandlestickDataPoint[] | null>(() => {
        if (!data?.data) return null
        return data.data.map((candle) => ({
            time: candle.time * 1000, // Convert to milliseconds
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            // 1inch API doesn't provide volume, so we'll omit it
        }))
    }, [data])

    const displaySymbol = symbol || `${instance.baseSymbol}/${instance.quoteSymbol}`

    return (
        <CandlestickChart
            data={candlestickData}
            isLoading={isLoading}
            error={error}
            symbol={displaySymbol}
            baseSymbol={instance.baseSymbol}
            quoteSymbol={instance.quoteSymbol}
            upColor={colors.aquamarine}
            downColor={colors.folly}
        />
    )
}

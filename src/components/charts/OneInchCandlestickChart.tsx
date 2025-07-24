'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import CandlestickChart, { CandlestickDataPoint } from './CandlestickChart'
import { use1inchCandles } from '@/hooks/fetchs/details/use1inchCandles'
import { ChartColors } from '@/config/chart-colors.config'
import { Configuration } from '@prisma/client'

export default function OneInchCandlestickChart({
    configuration,
    seconds = 300, // Default to 5 minute candles
    className,
}: {
    configuration: Configuration
    seconds?: number
    className?: string
}) {
    const { resolvedTheme } = useTheme()
    const colors = resolvedTheme === 'dark' ? ChartColors.dark : ChartColors.light
    const { data, isLoading, error } = use1inchCandles({
        token0: configuration.baseTokenAddress?.toLowerCase() ?? '',
        token1: configuration.quoteTokenAddress?.toLowerCase() ?? '',
        seconds,
        chainId: configuration.chainId,
        enabled: !!configuration.baseTokenAddress && !!configuration.quoteTokenAddress,
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

    return (
        <CandlestickChart
            data={candlestickData}
            isLoading={isLoading}
            error={error}
            baseSymbol={configuration.baseTokenSymbol}
            quoteSymbol={configuration.quoteTokenSymbol}
            upColor={colors.aquamarine}
            downColor={colors.folly}
            className={className}
        />
    )
}

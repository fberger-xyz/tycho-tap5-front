'use client'

import { useMemo } from 'react'
import CandlestickChart, { CandlestickDataPoint } from './CandlestickChart'
import { use1inchCandles } from '@/hooks/fetchs/use1inchCandles'
import { AppColors } from '@/config'
import { OneInchCandlestickChartProps } from '@/interfaces'

export default function OneInchCandlestickChart({
    token0,
    token1,
    seconds = 300, // Default to 5 minute candles
    chainId = 1, // Default to Ethereum mainnet
    symbol,
    upColor = AppColors.aquamarine,
    downColor = AppColors.folly,
}: OneInchCandlestickChartProps) {
    const { data, isLoading, error } = use1inchCandles({
        token0,
        token1,
        seconds,
        chainId,
        enabled: !!token0 && !!token1,
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

    const displaySymbol = symbol || `${token0.slice(0, 6)}.../${token1.slice(0, 6)}...`
    return (
        <CandlestickChart data={candlestickData} isLoading={isLoading} error={error} symbol={displaySymbol} upColor={upColor} downColor={downColor} />
    )
}

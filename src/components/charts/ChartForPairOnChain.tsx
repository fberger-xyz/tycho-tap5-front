'use client'

import { useMemo, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import CandlestickChart, { CandlestickDataPoint } from './CandlestickChart'
import { ChartColors } from '@/config/chart-colors.config'
import { cn } from '@/utils'
import { CHART_CONFIG, INTERVAL_LABELS } from '@/config/charts.config'
import { ChartType } from '@/enums/app.enum'
import { useOneInchCandles } from '@/hooks/fetchs/details/useOneInchCandles'
import { parseAsString, parseAsInteger, useQueryState } from 'nuqs'
import { ButtonDark } from '../figma/Button'

export default function ChartForPairOnChain({
    baseTokenAddress,
    quoteTokenAddress,
    baseTokenSymbol,
    quoteTokenSymbol,
    chainId,
    targetSpreadBps,
    className,
}: {
    baseTokenAddress: string
    quoteTokenAddress: string
    baseTokenSymbol?: string
    quoteTokenSymbol?: string
    chainId: number
    targetSpreadBps?: number
    className?: string
}) {
    const [chartType, setChartType] = useQueryState('chart', parseAsString.withDefault(CHART_CONFIG[ChartType.CANDLES].name))
    const [selectedInterval, selectInterval] = useQueryState('interval', parseAsInteger.withDefault(CHART_CONFIG[ChartType.CANDLES].defaultInterval))
    const { resolvedTheme } = useTheme()
    const colors = resolvedTheme === 'dark' ? ChartColors.dark : ChartColors.light
    const [referencePrice, setReferencePrice] = useState<number | undefined>(undefined)

    // Fetch Binance reference price
    useEffect(() => {
        if (baseTokenSymbol && quoteTokenSymbol) {
            console.log('Fetching Binance price for:', baseTokenSymbol, '/', quoteTokenSymbol)
            fetch(`/api/binance/price?base=${baseTokenSymbol}&quote=${quoteTokenSymbol}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log('Binance API response:', data)
                    if (data.success && data.data?.price) {
                        const roundedPrice = Math.round(data.data.price * 100) / 100
                        console.log('Setting reference price to:', roundedPrice)
                        setReferencePrice(roundedPrice)
                    } else {
                        console.warn('Binance price not available:', data.error || 'Unknown error')
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch Binance price:', err)
                })
        }
    }, [baseTokenSymbol, quoteTokenSymbol])

    const { data, isLoading, error } = useOneInchCandles({
        token0: baseTokenAddress?.toLowerCase() ?? '',
        token1: quoteTokenAddress?.toLowerCase() ?? '',
        seconds: selectedInterval,
        chainId,
        enabled: !!baseTokenAddress && !!quoteTokenAddress,
    })

    const candlestickData = useMemo<CandlestickDataPoint[] | null>(() => {
        if (!data?.data) return null
        return data.data.map((candle) => ({
            time: candle.time * 1000, // Convert to milliseconds
            open: Math.round(candle.open * 100) / 100,
            high: Math.round(candle.high * 100) / 100,
            low: Math.round(candle.low * 100) / 100,
            close: Math.round(candle.close * 100) / 100,
            // 1inch API doesn't provide volume, so we'll omit it
        }))
    }, [data])

    return (
        <div className={cn('w-full flex flex-col', className)}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center text-xs p-5 gap-y-4">
                <div className="flex items-center gap-6">
                    {Object.values(CHART_CONFIG).map((config) => (
                        <button
                            key={config.name}
                            disabled={!config.enabled}
                            className={cn(chartType === config.name ? 'text-milk' : 'text-milk-400', !config.enabled && 'cursor-not-allowed')}
                            onClick={() => setChartType(config.name)}
                        >
                            {config.name}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1">
                    {CHART_CONFIG[ChartType.CANDLES].allowedIntervals.map((interval) => (
                        <ButtonDark key={interval} className="w-10 py-[3px] rounded-xl text-xs" onClick={() => selectInterval(interval)}>
                            {INTERVAL_LABELS(interval)}
                        </ButtonDark>
                    ))}
                </div>
            </div>
            <div className="flex-1 h-full">
                <CandlestickChart
                    data={candlestickData}
                    isLoading={isLoading}
                    error={error}
                    baseSymbol={baseTokenSymbol || baseTokenAddress}
                    quoteSymbol={quoteTokenSymbol || quoteTokenAddress}
                    upColor={colors.aquamarine}
                    downColor={colors.folly}
                    targetSpreadBps={targetSpreadBps}
                    referencePrice={referencePrice}
                />
            </div>
        </div>
    )
}

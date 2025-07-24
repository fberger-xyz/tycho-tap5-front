'use client'

import { useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import CandlestickChart, { CandlestickDataPoint } from './CandlestickChart'
import { ChartColors } from '@/config/chart-colors.config'
import { Configuration, Trade } from '@prisma/client'
import { cn } from '@/utils'
import { CHART_CONFIG, INTERVAL_LABELS } from '@/config/charts.config'
import { ChartIntervalInSeconds, ChartType } from '@/enums/app.enum'
import { useOneInchCandles } from '@/hooks/fetchs/details/useOneInchCandles'

export default function OneInchCandlestickChart({
    configuration,
    trades,
    className,
}: {
    configuration: Configuration
    trades: Trade[]
    className?: string
}) {
    const [chartType, setChartType] = useState<ChartType>(ChartType.CANDLES)
    const [selectedInterval, selectInterval] = useState<ChartIntervalInSeconds>(CHART_CONFIG[ChartType.CANDLES].defaultInterval)
    const { resolvedTheme } = useTheme()
    const colors = resolvedTheme === 'dark' ? ChartColors.dark : ChartColors.light
    const { data, isLoading, error } = useOneInchCandles({
        token0: configuration.baseTokenAddress?.toLowerCase() ?? '',
        token1: configuration.quoteTokenAddress?.toLowerCase() ?? '',
        seconds: selectedInterval,
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
        <div className={cn('w-full flex flex-col', className)}>
            <div className="flex justify-between items-center mb-2 text-xs">
                <div className="flex items-center gap-2">
                    {Object.values(CHART_CONFIG).map((config) => (
                        <button
                            key={config.name}
                            disabled={!config.enabled}
                            className={cn(
                                'px-2 py-1 rounded-lg',
                                chartType === config.name ? 'bg-milk-100' : 'text-milk-400 hover:bg-milk-50',
                                !config.enabled && 'cursor-not-allowed',
                            )}
                            onClick={() => setChartType(config.name as ChartType)}
                        >
                            {config.name}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    {CHART_CONFIG[ChartType.CANDLES].allowedIntervals.map((interval) => (
                        <button
                            key={interval}
                            className={cn('px-2 py-1 rounded-lg', selectedInterval === interval ? 'bg-milk-100' : 'text-milk-400 hover:bg-milk-50')}
                            onClick={() => selectInterval(interval)}
                        >
                            {INTERVAL_LABELS(interval)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 h-full">
                <CandlestickChart
                    data={candlestickData}
                    isLoading={isLoading}
                    error={error}
                    baseSymbol={configuration.baseTokenSymbol}
                    quoteSymbol={configuration.quoteTokenSymbol}
                    upColor={colors.aquamarine}
                    downColor={colors.folly}
                    trades={trades}
                />
            </div>
        </div>
    )
}

'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import CandlestickChart, { CandlestickDataPoint } from './CandlestickChart'
import { ChartColors } from '@/config/chart-colors.config'
import { Trade } from '@prisma/client'
import { cn } from '@/utils'
import { CHART_CONFIG, INTERVAL_LABELS } from '@/config/charts.config'
import { ChartType } from '@/enums/app.enum'
import { useOneInchCandles } from '@/hooks/fetchs/details/useOneInchCandles'
import { parseAsString, parseAsInteger, useQueryState } from 'nuqs'

export default function ChartForPairOnChain({
    baseTokenAddress,
    quoteTokenAddress,
    chainId,
    trades,
    className,
}: {
    baseTokenAddress: string
    quoteTokenAddress: string
    chainId: number
    trades: Trade[]
    className?: string
}) {
    const [chartType, setChartType] = useQueryState('chart', parseAsString.withDefault(ChartType.CANDLES))
    const [selectedInterval, selectInterval] = useQueryState('interval', parseAsInteger.withDefault(CHART_CONFIG[ChartType.CANDLES].defaultInterval))
    const { resolvedTheme } = useTheme()
    const colors = resolvedTheme === 'dark' ? ChartColors.dark : ChartColors.light
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
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            // 1inch API doesn't provide volume, so we'll omit it
        }))
    }, [data])

    return (
        <div className={cn('w-full flex flex-col', className)}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center text-xs p-5 gap-y-4">
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
                            onClick={() => setChartType(config.name)}
                        >
                            {config.name}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 border border-milk-100 p-1 rounded-full">
                    {CHART_CONFIG[ChartType.CANDLES].allowedIntervals.map((interval) => (
                        <button
                            key={interval}
                            className={cn('px-2 py-1 rounded-xl', selectedInterval === interval ? 'bg-milk-100' : 'text-milk-400 hover:bg-milk-50')}
                            style={
                                selectedInterval === interval
                                    ? {
                                          boxShadow: [
                                              '0px -1.92px 0px 0px #080808 inset',
                                              '0px 0.64px 0px 0px #FFFFFF4D inset',
                                              '0px 1.77px 1.41px 0px #0000001F',
                                              '0px 4.25px 3.4px 0px #00000021',
                                              '0px 8px 6.4px 0px #00000022',
                                              '0px 14.28px 11.42px 0px #00000024',
                                              '0px 1.92px 1.92px 0px #00000024',
                                              '0px 1.77px 1.41px 0px #0000001F',
                                          ].join(', '),
                                      }
                                    : undefined
                            }
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
                    baseSymbol={baseTokenAddress}
                    quoteSymbol={quoteTokenAddress}
                    upColor={colors.aquamarine}
                    downColor={colors.folly}
                    trades={trades}
                />
            </div>
        </div>
    )
}

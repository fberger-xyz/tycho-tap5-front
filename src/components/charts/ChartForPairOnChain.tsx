'use client'

import { useMemo, useEffect, useState, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { parseAsString, parseAsInteger, useQueryState } from 'nuqs'
import CandlestickChart, { CandlestickDataPoint } from './CandlestickChart'
import SpreadChart from './SpreadChart'
import { ChartColors } from '@/config/chart-colors.config'
import { cn } from '@/utils'
import { CHART_CONFIG, INTERVAL_LABELS } from '@/config/charts.config'
import { ChartType } from '@/enums/app.enum'
import { useOneInchCandles } from '@/hooks/fetchs/details/useOneInchCandles'
import { usePoolsData } from '@/hooks/fetchs/usePoolsData'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { ButtonDark } from '../figma/Button'

interface BinanceKline {
    time: number
    close: number
}

interface BinancePrice {
    time: number
    price: number
}

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
    targetSpreadBps: number
    className?: string
}) {
    const [chartType, setChartType] = useQueryState('chart', parseAsString.withDefault(CHART_CONFIG[ChartType.CANDLES].name))
    const [selectedInterval, selectInterval] = useQueryState('interval', parseAsInteger.withDefault(CHART_CONFIG[ChartType.CANDLES].defaultInterval))
    const { resolvedTheme } = useTheme()
    const colors = resolvedTheme === 'dark' ? ChartColors.dark : ChartColors.light
    const [referencePrice, setReferencePrice] = useState<number | undefined>(undefined)
    const [referencePrices, setReferencePrices] = useState<BinancePrice[] | undefined>(undefined)

    // Fallback: Fetch single Binance price
    const fetchSinglePrice = useCallback(async () => {
        if (!baseTokenSymbol || !quoteTokenSymbol) return

        try {
            const response = await fetch(`/api/binance/price?base=${baseTokenSymbol}&quote=${quoteTokenSymbol}`)
            const data = await response.json()

            if (data.price) {
                const roundedPrice = Math.round(data.price * 100) / 100
                setReferencePrice(roundedPrice)
                setReferencePrices(undefined) // Clear historical prices
            }
        } catch {
            // Silently fail if Binance price is unavailable
        }
    }, [baseTokenSymbol, quoteTokenSymbol])

    // Fetch Binance historical prices (klines)
    const fetchBinanceKlines = useCallback(async () => {
        if (!baseTokenSymbol || !quoteTokenSymbol || !selectedInterval) return

        try {
            const response = await fetch(`/api/binance/klines?base=${baseTokenSymbol}&quote=${quoteTokenSymbol}&seconds=${selectedInterval}`)
            const data = await response.json()

            if (data.data && Array.isArray(data.data)) {
                // Transform klines to price points
                const prices: BinancePrice[] = data.data.map((kline: BinanceKline) => ({
                    time: kline.time * 1000, // Convert to milliseconds
                    price: Math.round(kline.close * 100) / 100,
                }))

                setReferencePrices(prices)

                // Also set the latest price as the current reference
                if (prices.length > 0) {
                    setReferencePrice(prices[prices.length - 1].price)
                }
            } else if (data.error) {
                // Fallback to single price
                fetchSinglePrice()
            }
        } catch {
            // Fallback to single price on any error
            fetchSinglePrice()
        }
    }, [baseTokenSymbol, quoteTokenSymbol, selectedInterval, fetchSinglePrice])

    // Fetch Binance data when parameters change
    useEffect(() => {
        // For Spread view, only fetch single price
        if (chartType === ChartType.SPREAD) {
            fetchSinglePrice()
        } else {
            fetchBinanceKlines()
        }
    }, [chartType, fetchBinanceKlines, fetchSinglePrice])

    const { data, isLoading, error } = useOneInchCandles({
        token0: baseTokenAddress?.toLowerCase() ?? '',
        token1: quoteTokenAddress?.toLowerCase() ?? '',
        seconds: selectedInterval,
        chainId,
        enabled: !!baseTokenAddress && !!quoteTokenAddress,
    })

    // Fetch pool data
    const chainName = chainId ? CHAINS_CONFIG[chainId]?.idForOrderbookApi : undefined
    const { data: poolsData } = usePoolsData({
        chain: chainName || '',
        token0: baseTokenAddress?.toLowerCase() || '',
        token1: quoteTokenAddress?.toLowerCase() || '',
        enabled: !!chainName && !!baseTokenAddress && !!quoteTokenAddress,
    })

    const candlestickData = useMemo<CandlestickDataPoint[] | null>(() => {
        if (!data?.data || data.data.length === 0) {
            return null
        }
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
                <div className="flex items-center gap-6 font-inter-tight">
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
                {chartType !== ChartType.SPREAD && (
                    <div className="flex items-center gap-1">
                        {CHART_CONFIG[ChartType.CANDLES].allowedIntervals.map((interval) => (
                            <ButtonDark
                                key={interval}
                                selected={interval === selectedInterval}
                                className={cn('py-[3px] px-2.5 rounded-xl text-xs')}
                                onClick={() => selectInterval(interval)}
                            >
                                {INTERVAL_LABELS(interval)}
                            </ButtonDark>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex-1 h-full">
                {chartType === ChartType.SPREAD ? (
                    <SpreadChart
                        referencePrice={referencePrice}
                        poolsData={poolsData}
                        targetSpreadBps={targetSpreadBps}
                        baseSymbol={baseTokenSymbol}
                        quoteSymbol={quoteTokenSymbol}
                        isLoading={!referencePrice || !poolsData}
                        error={null}
                    />
                ) : (
                    <CandlestickChart
                        data={candlestickData}
                        isLoading={isLoading && !candlestickData}
                        error={error}
                        chainId={chainId}
                        baseSymbol={baseTokenSymbol || baseTokenAddress}
                        quoteSymbol={quoteTokenSymbol || quoteTokenAddress}
                        upColor={colors.aquamarine}
                        downColor={colors.folly}
                        targetSpreadBps={targetSpreadBps}
                        referencePrice={referencePrice}
                        referencePrices={referencePrices}
                        poolsData={poolsData}
                    />
                )}
            </div>
        </div>
    )
}

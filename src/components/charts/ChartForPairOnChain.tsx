'use client'

import { useEffect, useState } from 'react'
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
import { roundPrice } from '@/config/chart-constants.config'

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
    const [binanceFetchError, setBinanceFetchError] = useState<boolean>(false)

    // Get refresh interval from chain config for synchronized updates
    const refreshInterval = chainId ? CHAINS_CONFIG[chainId]?.poolRefreshIntervalMs || 12000 : 12000

    // Reset data when chart type changes
    useEffect(() => {
        setReferencePrice(undefined)
        setReferencePrices(undefined)
        setBinanceFetchError(false)
    }, [chartType])

    // Simple Binance data fetching - no memoization needed
    useEffect(() => {
        if (!baseTokenSymbol || !quoteTokenSymbol) return

        const fetchBinanceData = async () => {
            // For spread chart, only fetch single price
            if (chartType === ChartType.SPREAD) {
                try {
                    const response = await fetch(`/api/binance/price?base=${baseTokenSymbol}&quote=${quoteTokenSymbol}`)
                    const data = await response.json()
                    if (data.price) {
                        setReferencePrice(roundPrice(data.price))
                        setReferencePrices(undefined)
                        setBinanceFetchError(false)
                    } else {
                        setBinanceFetchError(true)
                    }
                } catch (error) {
                    console.warn('Failed to fetch Binance price:', error)
                    setBinanceFetchError(true)
                }
                return
            }

            // For candles chart, fetch historical data
            if (chartType === ChartType.CANDLES && selectedInterval) {
                try {
                    const response = await fetch(`/api/binance/klines?base=${baseTokenSymbol}&quote=${quoteTokenSymbol}&seconds=${selectedInterval}`)
                    const data = await response.json()

                    if (data.data && Array.isArray(data.data)) {
                        const prices: BinancePrice[] = data.data.map((kline: BinanceKline) => ({
                            time: kline.time * 1000,
                            price: roundPrice(kline.close),
                        }))

                        setReferencePrices(prices)
                        if (prices.length > 0) {
                            setReferencePrice(prices[prices.length - 1].price)
                        }
                        setBinanceFetchError(false)
                    } else {
                        // Fallback to single price
                        const priceResponse = await fetch(`/api/binance/price?base=${baseTokenSymbol}&quote=${quoteTokenSymbol}`)
                        const priceData = await priceResponse.json()
                        if (priceData.price) {
                            setReferencePrice(roundPrice(priceData.price))
                            setReferencePrices(undefined)
                            setBinanceFetchError(false)
                        } else {
                            setBinanceFetchError(true)
                        }
                    }
                } catch (error) {
                    console.warn('Failed to fetch Binance klines:', error)
                    setBinanceFetchError(true)
                }
            }
        }

        // Initial fetch
        fetchBinanceData()

        // Set up periodic fetching for spread chart
        let intervalId: NodeJS.Timeout | undefined
        if (chartType === ChartType.SPREAD) {
            intervalId = setInterval(fetchBinanceData, refreshInterval)
        }

        return () => {
            if (intervalId) clearInterval(intervalId)
        }
    }, [baseTokenSymbol, quoteTokenSymbol, chartType, selectedInterval, refreshInterval])

    // Fetch 1inch candles data - only for candles chart
    const { data, isLoading, error } = useOneInchCandles({
        token0: baseTokenAddress?.toLowerCase() ?? '',
        token1: quoteTokenAddress?.toLowerCase() ?? '',
        seconds: selectedInterval,
        chainId,
        enabled: !!baseTokenAddress && !!quoteTokenAddress && chartType === ChartType.CANDLES,
    })

    // Fetch pool data - always needed for both charts
    const chainName = chainId ? CHAINS_CONFIG[chainId]?.idForOrderbookApi : undefined
    const { data: poolsData, isLoading: poolsLoading } = usePoolsData({
        chain: chainName || '',
        token0: baseTokenAddress?.toLowerCase() || '',
        token1: quoteTokenAddress?.toLowerCase() || '',
        enabled: !!chainName && !!baseTokenAddress && !!quoteTokenAddress,
    })

    // Simple candlestick data transformation - no useMemo
    let candlestickData: CandlestickDataPoint[] | null = null
    if (data?.data && data.data.length > 0) {
        candlestickData = data.data.map((candle) => ({
            time: candle.time * 1000,
            open: roundPrice(candle.open),
            high: roundPrice(candle.high),
            low: roundPrice(candle.low),
            close: roundPrice(candle.close),
        }))
    }

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
                {chartType === ChartType.SPREAD && (
                    <SpreadChart
                        referencePrice={referencePrice || poolsData?.mpd_base_to_quote?.mid}
                        poolsData={poolsData}
                        targetSpreadBps={targetSpreadBps}
                        baseSymbol={baseTokenSymbol}
                        quoteSymbol={quoteTokenSymbol}
                        isLoading={poolsLoading}
                        error={null}
                        chainId={chainId}
                        useFallbackPrice={binanceFetchError && !!poolsData?.mpd_base_to_quote?.mid}
                    />
                )}
                {chartType === ChartType.CANDLES && (
                    <CandlestickChart
                        data={candlestickData}
                        isLoading={isLoading}
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
                        showPoolSeries={false}
                        showTradeZonesInTooltip={true}
                    />
                )}
            </div>
        </div>
    )
}

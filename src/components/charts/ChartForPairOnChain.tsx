'use client'

import { useEffect, useState } from 'react'
import { parseAsString, parseAsInteger, useQueryState } from 'nuqs'
import CandlestickChart, { type CandlestickDataPoint } from './CandlestickChart'
import SpreadChart from './SpreadChart'
import InventoryChart from './InventoryChart'
import { cn } from '@/utils'
import { CHART_CONFIG, INTERVAL_LABELS } from '@/config/charts.config'
import { ChartType } from '@/enums/app.enum'
import { useOneInchCandles } from '@/hooks/fetchs/details/useOneInchCandles'
import { usePoolsData } from '@/hooks/fetchs/usePoolsData'
import { useTradesData } from '@/hooks/fetchs/useTradesData'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { ButtonDark } from '../figma/Button'
import { roundPrice } from '@/config/chart-constants.config'

export default function ChartForPairOnChain({
    baseTokenAddress,
    quoteTokenAddress,
    baseTokenSymbol,
    quoteTokenSymbol,
    chainId,
    targetSpreadBps,
    className,
    strategyId,
}: {
    baseTokenAddress: string
    quoteTokenAddress: string
    baseTokenSymbol: string
    quoteTokenSymbol: string
    chainId: number
    targetSpreadBps: number
    className?: string
    strategyId?: string
}) {
    const [chartType, setChartType] = useQueryState('chart', parseAsString.withDefault(CHART_CONFIG[ChartType.CANDLES].name))
    const [selectedInterval, selectInterval] = useQueryState('interval', parseAsInteger.withDefault(CHART_CONFIG[ChartType.CANDLES].defaultInterval))
    const [liveReferencePrice, setLiveReferencePrice] = useState<number | undefined>(undefined)
    const [binanceKlines, setBinanceKlines] = useState<CandlestickDataPoint[] | null>(null)
    const [binanceFetchError, setBinanceFetchError] = useState<boolean>(false)

    // Get refresh interval from chain config for synchronized updates
    const refreshInterval = chainId ? CHAINS_CONFIG[chainId]?.poolRefreshIntervalMs || 12000 : 12000

    // Reset data when chart type changes
    useEffect(() => {
        setLiveReferencePrice(undefined)
        setBinanceKlines(null)
        setBinanceFetchError(false)
    }, [chartType])

    // Fetch live price for SpreadChart
    useEffect(() => {
        if (!baseTokenSymbol || !quoteTokenSymbol) return
        if (chartType !== CHART_CONFIG[ChartType.SPREAD].name) return

        const fetchLivePrice = async () => {
            try {
                const response = await fetch(`/api/binance/price?base=${baseTokenSymbol}&quote=${quoteTokenSymbol}`)
                const data = await response.json()
                if (data.price) {
                    setLiveReferencePrice(roundPrice(data.price))
                    setBinanceFetchError(false)
                } else {
                    setBinanceFetchError(true)
                }
            } catch (error) {
                console.warn('Failed to fetch live Binance price:', error)
                setBinanceFetchError(true)
            }
        }

        // Initial fetch
        fetchLivePrice()

        // Set up periodic fetching
        const intervalId = setInterval(fetchLivePrice, refreshInterval)

        return () => clearInterval(intervalId)
    }, [baseTokenSymbol, quoteTokenSymbol, chartType, refreshInterval])

    // Fetch Binance klines for CandlestickChart
    useEffect(() => {
        if (!baseTokenSymbol || !quoteTokenSymbol) return
        if (chartType !== CHART_CONFIG[ChartType.CANDLES].name || !selectedInterval) return

        const fetchBinanceKlines = async () => {
            try {
                const response = await fetch(`/api/binance/klines?base=${baseTokenSymbol}&quote=${quoteTokenSymbol}&seconds=${selectedInterval}`)
                const data = await response.json()

                if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                    // Transform Binance klines to match CandlestickDataPoint format
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const klines: CandlestickDataPoint[] = data.data.map((kline: any) => ({
                        time: kline.time * 1000, // Convert to milliseconds
                        open: roundPrice(kline.open),
                        high: roundPrice(kline.high),
                        low: roundPrice(kline.low),
                        close: roundPrice(kline.close),
                        volume: kline.volume,
                    }))
                    setBinanceKlines(klines)
                    setBinanceFetchError(false)
                } else {
                    setBinanceKlines(null)
                    setBinanceFetchError(true)
                }
            } catch (error) {
                console.warn('Failed to fetch Binance klines:', error)
                setBinanceKlines(null)
                setBinanceFetchError(true)
            }
        }

        // Fetch whenever interval changes
        fetchBinanceKlines()
    }, [baseTokenSymbol, quoteTokenSymbol, chartType, selectedInterval])

    // Fetch 1inch candles data - only for candles chart
    const { data, isLoading } = useOneInchCandles({
        token0: baseTokenAddress?.toLowerCase() ?? '',
        token1: quoteTokenAddress?.toLowerCase() ?? '',
        seconds: selectedInterval,
        chainId,
        enabled: !!baseTokenAddress && !!quoteTokenAddress && chartType === CHART_CONFIG[ChartType.CANDLES].name,
    })

    console.log('📊 [ChartForPairOnChain] 1inch data fetch:', {
        isLoading,
        hasData: !!data,
        dataLength: data?.data?.length || 0,
        enabled: !!baseTokenAddress && !!quoteTokenAddress && chartType === CHART_CONFIG[ChartType.CANDLES].name,
        params: {
            token0: baseTokenAddress?.toLowerCase(),
            token1: quoteTokenAddress?.toLowerCase(),
            seconds: selectedInterval,
            chainId,
        },
    })

    // Fetch pool data - always needed for both charts
    const chainName = chainId ? CHAINS_CONFIG[chainId]?.idForOrderbookApi : undefined
    const { data: poolsData, isLoading: poolsLoading } = usePoolsData({
        chain: chainName || '',
        token0: baseTokenAddress?.toLowerCase() || '',
        token1: quoteTokenAddress?.toLowerCase() || '',
        enabled: !!chainName && !!baseTokenAddress && !!quoteTokenAddress,
    })

    // Fetch trades data for inventory chart
    const { trades, isLoading: tradesLoading } = useTradesData(5000, strategyId, 500)

    console.log('🏊 [ChartForPairOnChain] Pools data fetch:', {
        poolsLoading,
        hasPoolsData: !!poolsData,
        chainName,
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
                {chartType === CHART_CONFIG[ChartType.CANDLES].name && (
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
                {chartType === CHART_CONFIG[ChartType.SPREAD].name && (
                    <SpreadChart
                        referencePrice={liveReferencePrice || poolsData?.mpd_base_to_quote?.mid}
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
                {chartType === CHART_CONFIG[ChartType.CANDLES].name &&
                    (() => {
                        console.log('🟠 [ChartForPairOnChain] Rendering CandlestickChart with:', {
                            timestamp: new Date().toISOString(),
                            chartType,
                            candlestickData: {
                                exists: !!candlestickData,
                                length: candlestickData?.length || 0,
                                firstItem: candlestickData?.[0],
                                lastItem: candlestickData?.[candlestickData.length - 1],
                            },
                            isLoading: {
                                oneInchLoading: isLoading,
                                poolsLoading,
                                combined: isLoading || poolsLoading,
                            },
                            chainId,
                            symbols: { base: baseTokenSymbol, quote: quoteTokenSymbol },
                            targetSpreadBps,
                            binanceKlines,
                            binanceReferencePrice:
                                binanceKlines && binanceKlines.length > 0 ? binanceKlines[binanceKlines.length - 1].close : undefined,
                        })

                        // Extract reference price from Binance klines (last close price)
                        const binanceReferencePrice =
                            binanceKlines && binanceKlines.length > 0 ? binanceKlines[binanceKlines.length - 1].close : undefined

                        // Create reference prices array for historical display
                        const referencePrices =
                            binanceKlines?.map((kline) => ({
                                time: kline.time,
                                price: kline.close,
                            })) || undefined

                        return (
                            <CandlestickChart
                                data={candlestickData}
                                isLoading={isLoading || poolsLoading}
                                chainId={chainId}
                                baseSymbol={baseTokenSymbol}
                                quoteSymbol={quoteTokenSymbol}
                                targetSpreadBps={targetSpreadBps}
                                referencePrice={binanceReferencePrice}
                                referencePrices={referencePrices}
                                showTradeZonesInTooltip={true}
                            />
                        )
                    })()}
                {chartType === CHART_CONFIG[ChartType.INVENTORY].name && (
                    <InventoryChart trades={trades || []} baseSymbol={baseTokenSymbol} quoteSymbol={quoteTokenSymbol} isLoading={tradesLoading} />
                )}
            </div>
        </div>
    )
}

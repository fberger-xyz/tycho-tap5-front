'use client'

import { parseAsString, parseAsInteger, useQueryState } from 'nuqs'
import CandlestickChart, { type CandlestickDataPoint } from '@/components/charts/CandlestickChart'
import SpreadChart from '@/components/charts/SpreadChart'
import InventoryChart from '@/components/charts/InventoryChart'
import { cn } from '@/utils'
import { CHART_CONFIG, INTERVAL_LABELS } from '@/config/charts.config'
import { ChartType } from '@/enums/app.enum'
import { useOneInchCandles } from '@/hooks/fetchs/details/useOneInchCandles'
import { useBinanceKlines } from '@/hooks/fetchs/details/useBinanceKlines'
import { useBinancePrice } from '@/hooks/fetchs/details/useBinancePrice'
import { useTradesData } from '@/hooks/fetchs/useTradesData'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { ButtonDark } from '@/components/figma/Button'
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

    // Get refresh interval from chain config for synchronized updates
    const refreshInterval = chainId ? CHAINS_CONFIG[chainId]?.poolRefreshIntervalMs || 12000 : 12000

    // Fetch Binance klines for CandlestickChart using React Query
    const { binanceKlines, isLoading: binanceKlinesLoading } = useBinanceKlines({
        baseSymbol: baseTokenSymbol,
        quoteSymbol: quoteTokenSymbol,
        seconds: selectedInterval,
        enabled: !!baseTokenSymbol && !!quoteTokenSymbol && chartType === CHART_CONFIG[ChartType.CANDLES].name,
    })

    // Fetch live Binance price for SpreadChart using React Query
    const { binancePrice, isLoading: binancePriceLoading } = useBinancePrice({
        baseSymbol: baseTokenSymbol,
        quoteSymbol: quoteTokenSymbol,
        enabled: !!baseTokenSymbol && !!quoteTokenSymbol && chartType === CHART_CONFIG[ChartType.SPREAD].name,
        refetchInterval: refreshInterval,
    })

    // Fetch 1inch candles data - only for candles chart
    const { data, isLoading } = useOneInchCandles({
        token0: baseTokenAddress?.toLowerCase() ?? '',
        token1: quoteTokenAddress?.toLowerCase() ?? '',
        seconds: selectedInterval,
        chainId,
        enabled: !!baseTokenAddress && !!quoteTokenAddress && chartType === CHART_CONFIG[ChartType.CANDLES].name,
    })

    // Fetch trades data for inventory chart
    const { trades, isLoading: tradesLoading } = useTradesData(5000, strategyId, 500)

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
        <div className={cn('flex w-full flex-col', className)}>
            <div className="flex flex-col gap-y-4 p-5 text-xs md:flex-row md:items-center md:justify-between">
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
                                className={cn('rounded-xl px-2.5 py-[3px] text-xs')}
                                onClick={() => selectInterval(interval)}
                            >
                                {INTERVAL_LABELS(interval)}
                            </ButtonDark>
                        ))}
                    </div>
                )}
            </div>
            <div className="h-full flex-1">
                {chartType === CHART_CONFIG[ChartType.SPREAD].name && (
                    <SpreadChart
                        referencePrice={binancePrice ?? undefined}
                        targetSpreadBps={targetSpreadBps}
                        baseSymbol={baseTokenSymbol}
                        quoteSymbol={quoteTokenSymbol}
                        isLoading={binancePriceLoading}
                        error={null}
                        chainId={chainId}
                    />
                )}
                {chartType === CHART_CONFIG[ChartType.CANDLES].name && (
                    <CandlestickChart
                        data={candlestickData}
                        isLoading={isLoading || binanceKlinesLoading}
                        chainId={chainId}
                        baseSymbol={baseTokenSymbol}
                        quoteSymbol={quoteTokenSymbol}
                        targetSpreadBps={targetSpreadBps}
                        referencePrice={binanceKlines?.[binanceKlines.length - 1]?.close}
                        referencePrices={binanceKlines?.map((kline) => ({
                            time: kline.time,
                            price: kline.close,
                        }))}
                        showTradeZonesInTooltip={true}
                    />
                )}
                {chartType === CHART_CONFIG[ChartType.INVENTORY].name && (
                    <InventoryChart trades={trades || []} baseSymbol={baseTokenSymbol} quoteSymbol={quoteTokenSymbol} isLoading={tradesLoading} />
                )}
            </div>
        </div>
    )
}

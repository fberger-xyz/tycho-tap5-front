'use client'

import { useMemo, useEffect, useState, useRef, Suspense } from 'react'
import EchartWrapper, { CustomFallback } from '@/components/charts/EchartWrapper'
import { IS_DEV } from '@/config/app.config'
import { ChartColors } from '@/config/chart-colors.config'
import { cn } from '@/utils'
import numeral from 'numeral'
import { INTER_FONT } from '@/config'
import type { EChartsOption } from 'echarts'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { DAYJS_FORMATS } from '@/utils'
import { ErrorBoundaryFallback } from '@/components/common/ErrorBoundaryFallback'
import { ErrorBoundary } from 'react-error-boundary'
import { CHART_CONSTANTS } from '@/config/chart-constants.config'
import { logger } from '@/utils/logger.util'

// debug logging helper
const debugLog = (message: string, data?: unknown) => {
    if (IS_DEV) {
        logger.debug(message, (data as Record<string, unknown>) || {})
    }
}

interface SpreadChartProps {
    referencePrice?: number
    targetSpreadBps: number
    baseSymbol?: string
    quoteSymbol?: string
    isLoading?: boolean
    error?: Error | null
    className?: string
    chainId?: number
}

interface TimeSeriesPoint {
    time: number
    value: number
}

export default function SpreadChart({ referencePrice, targetSpreadBps, error, className, chainId }: SpreadChartProps) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    const colors = ChartColors

    // state to accumulate time series data
    const [binanceTimeSeries, setBinanceTimeSeries] = useState<TimeSeriesPoint[]>([])
    const lastUpdateTime = useRef<number>(0)

    // get refresh interval from chain config
    const refreshInterval = chainId
        ? CHAINS_CONFIG[chainId]?.poolRefreshIntervalMs || CHART_CONSTANTS.DEFAULT_REFRESH_INTERVAL
        : CHART_CONSTANTS.DEFAULT_REFRESH_INTERVAL

    // maximum number of points to keep
    const maxPoints = Math.floor((CHART_CONSTANTS.DATA_WINDOW_MINUTES * 60 * 1000) / refreshInterval)

    // helper function to check if enough time has passed for update
    const shouldUpdate = (now: number): boolean => {
        if (lastUpdateTime.current === 0) return true
        const timeSinceLastUpdate = now - lastUpdateTime.current
        const minTimeBetweenUpdates = refreshInterval * CHART_CONSTANTS.MIN_UPDATE_INTERVAL_RATIO
        return timeSinceLastUpdate >= minTimeBetweenUpdates
    }

    // update time series data when new data arrives
    useEffect(() => {
        if (!referencePrice) return

        const now = Date.now()

        // only throttle if we already have some data
        if (binanceTimeSeries.length > 0) {
            if (!shouldUpdate(now)) return
        }

        lastUpdateTime.current = now

        // update Binance price time series
        if (referencePrice && referencePrice > 0) {
            setBinanceTimeSeries((prev) => [...prev, { time: now, value: referencePrice }].slice(-maxPoints))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [referencePrice, refreshInterval, maxPoints, binanceTimeSeries.length])

    // check if we have enough data points to show actual chart
    const hasEnoughData = useMemo(() => binanceTimeSeries.length >= 2, [binanceTimeSeries])

    const chartOptions = useMemo(() => {
        debugLog('[SpreadChart] Building chart options with:', {
            binanceTimeSeriesLength: binanceTimeSeries.length,
            referencePrice,
            targetSpreadBps,
        })

        // find min/max for y-axis from all time series data
        const allPrices: number[] = []

        // add Binance prices and their spread bands
        binanceTimeSeries.forEach((point) => {
            allPrices.push(point.value)
            if (targetSpreadBps > 0) {
                allPrices.push(point.value * (1 + targetSpreadBps / 10000))
                allPrices.push(point.value * (1 - targetSpreadBps / 10000))
            }
        })

        const minPrice = allPrices.length > 0 ? Math.min(...allPrices) * 0.998 : 100
        const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) * 1.002 : 100

        return {
            backgroundColor: 'transparent',
            grid: { top: 5, left: 0, right: 70, bottom: isMobile ? 100 : 70 },
            axisPointer: {
                link: [{ xAxisIndex: 'all' }],
                label: { backgroundColor: colors.milkOpacity[100] },
            },
            xAxis: {
                type: 'time' as const,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    show: true,
                    color: colors.milkOpacity[400],
                    fontSize: 10,
                    formatter: (value: number) => {
                        const date = new Date(value)
                        return date.toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' })
                    },
                },
                splitLine: { show: false },
                axisPointer: {
                    show: true,
                    type: 'line',
                    lineStyle: { color: colors.milkOpacity[400], type: 'dashed' },
                    label: { show: false },
                },
            },
            yAxis: {
                type: 'value' as const,
                min: minPrice,
                max: maxPrice,
                position: 'right' as const,
                axisLine: { show: false },
                axisLabel: {
                    formatter: (value: number) => `$${numeral(value).format('0,0')}`,
                    color: colors.milkOpacity[400],
                    fontSize: 10,
                    margin: 15,
                },
                splitLine: {
                    lineStyle: { color: colors.milkOpacity[100], type: 'dashed' as const, opacity: 0.3 },
                },
            },
            tooltip: {
                show: true,
                borderColor: 'rgba(55, 65, 81, 0.5)',
                triggerOn: 'mousemove|click',
                backgroundColor: '#FFF4E005',
                borderRadius: 12,
                extraCssText: 'backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding:12px;',
                borderWidth: 1,
                padding: [6, 10],
                trigger: 'axis',
                appendToBody: true,
                hideDelay: 0,
                transitionDuration: 0,
                enterable: false,
                confine: true,
                axisPointer: { type: 'cross', animation: false },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter: function (params: any) {
                    if (!params || params.length === 0) return ''

                    const timestamp = params[0].axisValue
                    const dateLong = DAYJS_FORMATS.dateLong(timestamp)
                    const timeAgo = DAYJS_FORMATS.timeAgo(timestamp)

                    let tooltipContent = `
                        <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid ${colors.milkOpacity[100]};">
                            <div style="font-size: 12px; font-weight: 500; color: ${colors.milk}; margin-bottom: 2px;">${dateLong}</div>
                            <div style="font-size: 11px; color: ${colors.milkOpacity[400]};">${timeAgo}</div>
                        </div>
                    `

                    const shownSeries = new Set<string>()

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    params.forEach((item: any) => {
                        if (!item.seriesName || item.seriesName.includes('Band')) return

                        const value = Array.isArray(item.value) ? item.value[1] : item.value
                        if (!value) return

                        const displayColor = item.seriesName === 'Market Price (Binance)' ? '#F3BA2F' : item.color
                        const displayName = item.seriesName

                        if (shownSeries.has(displayName)) return
                        shownSeries.add(displayName)

                        tooltipContent += `
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                                <div style="display: flex; align-items: center;">
                                    <span style="display: inline-block; width: 10px; height: 10px; background: ${displayColor}; border-radius: 2px; margin-right: 8px;"></span>
                                    <span style="color: ${colors.milkOpacity[600]};">${displayName}</span>
                                </div>
                                <span style="color: ${colors.milk}; margin-left: 24px;">$${numeral(value).format('0,0.00')}</span>
                            </div>
                        `
                    })

                    return tooltipContent
                },
            },
            series: [
                // spread bands (follow Binance price over time)
                ...(binanceTimeSeries.length > 0 && targetSpreadBps > 0
                    ? [
                          {
                              name: 'Upper Band',
                              type: 'line' as const,
                              data: binanceTimeSeries.map((point) => [point.time, point.value * (1 + targetSpreadBps / 10000)]),
                              symbol: 'none',
                              lineStyle: { color: colors.milkOpacity[200], type: 'dashed', width: 1 },
                              silent: true,
                          },
                          {
                              name: 'Lower Band',
                              type: 'line' as const,
                              data: binanceTimeSeries.map((point) => [point.time, point.value * (1 - targetSpreadBps / 10000)]),
                              symbol: 'none',
                              lineStyle: { color: colors.milkOpacity[200], type: 'dashed', width: 1 },
                              silent: true,
                          },
                      ]
                    : []),

                // binance reference price time series
                ...(binanceTimeSeries.length > 0
                    ? [
                          {
                              name: 'Market Price (Binance)',
                              type: 'line' as const,
                              data: binanceTimeSeries.map((point) => [point.time, point.value]),
                              smooth: true,
                              symbol: 'none',
                              lineStyle: { color: '#F3BA2F', width: 2, opacity: 1 },
                              itemStyle: { color: '#F3BA2F', opacity: 1 },
                              emphasis: { focus: 'series', lineStyle: { width: 2.5, opacity: 1 } },
                          },
                      ]
                    : []),
            ],
            legend: {
                show: true,
                bottom: 15,
                left: 10,
                orient: 'horizontal',
                itemGap: 15,
                itemWidth: 14,
                itemHeight: 10,
                textStyle: { fontSize: 11, color: colors.milkOpacity[600], fontFamily: INTER_FONT.style.fontFamily },
                selectedMode: 'multiple',
                data: binanceTimeSeries.length
                    ? [{ name: 'Market Price (Binance)', icon: 'roundRect', itemStyle: { color: '#F3BA2F' } }]
                    : [],
            },
        } as EChartsOption
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [binanceTimeSeries, targetSpreadBps, colors, isMobile])

    // loading placeholder with animated skeleton
    const loadingOptions = useMemo((): EChartsOption => {
        const basePrice = 3400
        const now = Date.now()
        const skeletonPoints = 30
        const timePoints = Array.from({ length: skeletonPoints }, (_, i) => now - (skeletonPoints - i - 1) * refreshInterval)

        const createSkeletonLine = (offset: number, amplitudePercent: number) => {
            const amplitude = basePrice * amplitudePercent
            return timePoints.map((time, i) => {
                const wave = Math.sin((i + offset) * 0.2) * amplitude
                const microWave = Math.sin((i + offset) * 0.8) * (amplitude * 0.3)
                return [time, basePrice + wave + microWave]
            })
        }

        return {
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 2000,
            animationEasing: 'cubicInOut',
            animationLoop: true,
            grid: { top: 5, left: 0, right: 70, bottom: isMobile ? 100 : 70 },
            tooltip: { show: false },
            xAxis: {
                type: 'time',
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: true, color: colors.milkOpacity[100], fontSize: 10, formatter: () => '••:••' },
                splitLine: { show: false },
            },
            yAxis: {
                type: 'value',
                position: 'right',
                min: basePrice * 0.995,
                max: basePrice * 1.005,
                axisLine: { show: false },
                axisLabel: { show: true, color: colors.milkOpacity[100], fontSize: 10, margin: 15, formatter: () => '$•,•••' },
                splitLine: { show: true, lineStyle: { color: colors.milkOpacity[50], type: 'dashed', opacity: 0.3 } },
            },
            series: [
                {
                    name: 'skeleton1',
                    type: 'line',
                    data: createSkeletonLine(0, 0.002),
                    smooth: true,
                    symbol: 'none',
                    lineStyle: { color: colors.milkOpacity[200], width: 2, opacity: 0.6 },
                    animation: true,
                    animationDuration: 3000,
                    animationDelay: 0,
                },
            ],
            legend: {
                show: true,
                bottom: 15,
                left: 10,
                data: [{ name: 'Loading...', icon: 'roundRect', itemStyle: { color: colors.milkOpacity[100] } }],
                textStyle: { fontSize: 11, color: colors.milkOpacity[200], fontFamily: INTER_FONT.style.fontFamily },
            },
        }
    }, [refreshInterval, isMobile, colors])

    if (error) {
        return (
            <div className={cn('flex h-[400px] items-center justify-center', className)}>
                <div className="text-folly">Error loading spread data</div>
            </div>
        )
    }

    const options = hasEnoughData ? chartOptions : loadingOptions

    debugLog('[SpreadChart] Rendering with:', {
        hasEnoughData,
        binanceTimeSeriesLength: binanceTimeSeries.length,
        isUsingChartOptions: hasEnoughData,
    })

    return (
        <Suspense fallback={<CustomFallback />}>
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <EchartWrapper options={options} className={cn('size-full', className)} forceReplace={!hasEnoughData} />
            </ErrorBoundary>
        </Suspense>
    )
}

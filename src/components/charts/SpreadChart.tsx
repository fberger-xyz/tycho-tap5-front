'use client'

import { useMemo, useEffect, useState, useRef, Suspense } from 'react'
import EchartWrapper, { CustomFallback } from './EchartWrapper'
import { IS_DEV } from '@/config/app.config'
import { useTheme } from 'next-themes'
import { ChartColors } from '@/config/chart-colors.config'
import { cn } from '@/utils'
import numeral from 'numeral'
import { INTER_FONT } from '@/config'
import { AmmAsOrderbook } from '@/interfaces'
import type { EChartsOption } from 'echarts'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { DAYJS_FORMATS } from '@/utils'
import { ErrorBoundaryFallback } from '../common/ErrorBoundaryFallback'
import { ErrorBoundary } from 'react-error-boundary'
import { CHART_CONSTANTS } from '@/config/chart-constants.config'

// Debug logging helper
const debugLog = (message: string, data?: unknown) => {
    if (IS_DEV) {
        console.log(message, data)
    }
}

// Simple protocol colors
const PROTOCOL_COLORS: Record<string, string> = {
    uniswap: '#FF007A',
    sushiswap: '#0E0F23',
    curve: '#861FFF',
    balancer: '#1E1E1E',
    pancakeswap: '#1FC7D4',
    default: '#6B7280',
}

interface SpreadChartProps {
    referencePrice?: number
    poolsData?: AmmAsOrderbook | null
    targetSpreadBps: number
    baseSymbol?: string
    quoteSymbol?: string
    isLoading?: boolean
    error?: Error | null
    className?: string
    chainId?: number
    useFallbackPrice?: boolean
}

interface TimeSeriesPoint {
    time: number
    value: number
}

interface PoolTimeSeries {
    name: string
    color: string
    data: TimeSeriesPoint[]
}

export default function SpreadChart({
    referencePrice,
    poolsData,
    targetSpreadBps,
    // isLoading, // Keeping for future use
    error,
    className,
    chainId,
    useFallbackPrice,
}: SpreadChartProps) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    const { resolvedTheme } = useTheme()
    const colors = resolvedTheme === 'dark' ? ChartColors.dark : ChartColors.light

    // State to accumulate time series data
    const [binanceTimeSeries, setBinanceTimeSeries] = useState<TimeSeriesPoint[]>([])
    const [poolsTimeSeries, setPoolsTimeSeries] = useState<Map<string, PoolTimeSeries>>(new Map())
    const lastUpdateTime = useRef<number>(0)

    // Get refresh interval from chain config
    const refreshInterval = chainId
        ? CHAINS_CONFIG[chainId]?.poolRefreshIntervalMs || CHART_CONSTANTS.DEFAULT_REFRESH_INTERVAL
        : CHART_CONSTANTS.DEFAULT_REFRESH_INTERVAL

    // Maximum number of points to keep
    const maxPoints = Math.floor((CHART_CONSTANTS.DATA_WINDOW_MINUTES * 60 * 1000) / refreshInterval)

    // Helper function to get protocol display name
    const getProtocolDisplayName = (protocolSystem: string): string => {
        const protocol = protocolSystem?.toLowerCase() || 'unknown'
        if (protocol.includes('uniswap')) return 'Uniswap'
        if (protocol.includes('sushi')) return 'Sushiswap'
        if (protocol.includes('curve')) return 'Curve'
        if (protocol.includes('balancer')) return 'Balancer'
        if (protocol.includes('pancake')) return 'Pancakeswap'
        return 'Unknown'
    }

    // Helper function to check if enough time has passed for update
    const shouldUpdate = (now: number): boolean => {
        if (lastUpdateTime.current === 0) return true
        const timeSinceLastUpdate = now - lastUpdateTime.current
        const minTimeBetweenUpdates = refreshInterval * CHART_CONSTANTS.MIN_UPDATE_INTERVAL_RATIO
        return timeSinceLastUpdate >= minTimeBetweenUpdates
    }

    // Update time series data when new data arrives
    useEffect(() => {
        // Skip if no data
        if (!poolsData && !referencePrice) return

        const now = Date.now()

        // Only throttle if we already have some data
        // For initial data collection, always accept the data
        if (binanceTimeSeries.length > 0 || poolsTimeSeries.size > 0) {
            if (!shouldUpdate(now)) return
        }

        lastUpdateTime.current = now

        // Update Binance price time series
        if (referencePrice && referencePrice > 0) {
            setBinanceTimeSeries((prev) => [...prev, { time: now, value: referencePrice }].slice(-maxPoints))
        }

        // Update pools time series
        if (poolsData?.pools && poolsData?.prices_base_to_quote) {
            setPoolsTimeSeries((prevPoolsMap) => {
                const newPoolsMap = new Map(prevPoolsMap)

                poolsData.pools.forEach((pool, index) => {
                    const price = poolsData.prices_base_to_quote[index]
                    const fallbackPrice = poolsData.mpd_base_to_quote?.mid || referencePrice || 0
                    const finalPrice = price && price > 0 ? price : fallbackPrice

                    if (finalPrice > 0) {
                        const poolId = `${pool.protocol_system}_${pool.fee}_${index}`
                        const displayName = getProtocolDisplayName(pool.protocol_system)
                        const poolName = `${displayName} (${numeral(pool.fee).format('0.[00]')} bps)`
                        const poolColor = PROTOCOL_COLORS[displayName.toLowerCase()] || PROTOCOL_COLORS.default

                        const existingPool = newPoolsMap.get(poolId) || {
                            name: poolName,
                            color: poolColor,
                            data: [],
                        }

                        existingPool.data = [...existingPool.data, { time: now, value: finalPrice }].slice(-maxPoints)
                        newPoolsMap.set(poolId, existingPool)
                    }
                })

                return newPoolsMap
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poolsData, referencePrice, refreshInterval, maxPoints, binanceTimeSeries.length, poolsTimeSeries.size])

    // Check if we have enough data points to show actual chart (need at least 2 points for a line)
    const hasEnoughData = useMemo(() => {
        // Need at least 2 points to draw a meaningful line
        if (binanceTimeSeries.length >= 2) return true

        // Check if any pool has at least 2 points
        for (const pool of poolsTimeSeries.values()) {
            if (pool.data.length >= 2) return true
        }

        return false
    }, [binanceTimeSeries, poolsTimeSeries])

    const chartOptions = useMemo(() => {
        // Build the chart configuration for when we have real data
        debugLog('[SpreadChart] Building chart options with:', {
            binanceTimeSeriesLength: binanceTimeSeries.length,
            poolsTimeSeriesSize: poolsTimeSeries.size,
            referencePrice,
            targetSpreadBps,
        })

        // Find min/max for y-axis from all time series data
        const allPrices: number[] = []

        // Add Binance prices and their spread bands
        binanceTimeSeries.forEach((point) => {
            allPrices.push(point.value)
            if (targetSpreadBps > 0) {
                allPrices.push(point.value * (1 + targetSpreadBps / 10000))
                allPrices.push(point.value * (1 - targetSpreadBps / 10000))
            }
        })

        // Add pool prices
        poolsTimeSeries.forEach((pool) => {
            pool.data.forEach((point) => allPrices.push(point.value))
        })

        const minPrice = allPrices.length > 0 ? Math.min(...allPrices) * 0.998 : 100
        const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) * 1.002 : 100

        // Create time axis labels (last 5 minutes)
        const timeLabels: string[] = []
        const now = Date.now()
        for (let i = maxPoints - 1; i >= 0; i--) {
            const time = now - i * refreshInterval
            const date = new Date(time)
            if (i % Math.floor(maxPoints / 6) === 0) {
                timeLabels.push(date.toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }))
            } else {
                timeLabels.push('')
            }
        }

        return {
            backgroundColor: 'transparent',
            grid: { top: 5, left: 0, right: 70, bottom: isMobile ? 100 : 70 },
            axisPointer: {
                link: [{ xAxisIndex: 'all' }],
                label: {
                    backgroundColor: colors.milkOpacity[100],
                },
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
                splitLine: {
                    show: false,
                },
                axisPointer: {
                    show: true,
                    type: 'line',
                    lineStyle: {
                        color: colors.milkOpacity[400],
                        type: 'dashed',
                    },
                    label: {
                        show: false,
                    },
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
                    lineStyle: {
                        color: colors.milkOpacity[100],
                        type: 'dashed' as const,
                        opacity: 0.3,
                    },
                },
            },
            tooltip: {
                show: true,
                borderColor: 'rgba(55, 65, 81, 0.5)', // subtle border
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
                axisPointer: {
                    type: 'cross',
                    animation: false,
                },
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

                    // Track which series we've already shown to avoid duplicates
                    const shownSeries = new Set<string>()

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    params.forEach((item: any) => {
                        if (!item.seriesName || item.seriesName.includes('Band')) return

                        const value = Array.isArray(item.value) ? item.value[1] : item.value
                        if (!value) return

                        let displayColor = item.color
                        const displayName = item.seriesName

                        // Format Market price
                        if (item.seriesName === 'Market Price (Binance)') {
                            displayColor = useFallbackPrice ? '#888888' : '#F3BA2F'
                        }

                        // Skip if we've already shown this series name
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
                // Spread bands (follow Binance price over time)
                ...(binanceTimeSeries.length > 0 && targetSpreadBps > 0
                    ? [
                          {
                              name: 'Upper Band',
                              type: 'line' as const,
                              data: binanceTimeSeries.map((point) => [point.time, point.value * (1 + targetSpreadBps / 10000)]),
                              symbol: 'none',
                              lineStyle: {
                                  color: colors.milkOpacity[200],
                                  type: 'dashed',
                                  width: 1,
                              },
                              silent: true,
                          },
                          {
                              name: 'Lower Band',
                              type: 'line' as const,
                              data: binanceTimeSeries.map((point) => [point.time, point.value * (1 - targetSpreadBps / 10000)]),
                              symbol: 'none',
                              lineStyle: {
                                  color: colors.milkOpacity[200],
                                  type: 'dashed',
                                  width: 1,
                              },
                              silent: true,
                          },
                      ]
                    : []),

                // Binance reference price time series
                ...(binanceTimeSeries.length > 0
                    ? [
                          {
                              name: 'Market Price (Binance)',
                              type: 'line' as const,
                              data: binanceTimeSeries.map((point) => [point.time, point.value]),
                              smooth: true,
                              symbol: 'none',
                              lineStyle: {
                                  color: useFallbackPrice ? '#888888' : '#F3BA2F',
                                  width: 2,
                                  opacity: 1,
                              },
                              itemStyle: {
                                  color: useFallbackPrice ? '#888888' : '#F3BA2F',
                                  opacity: 1,
                              },
                              emphasis: {
                                  focus: 'series',
                                  lineStyle: {
                                      width: 2.5,
                                      opacity: 1,
                                  },
                              },
                          },
                      ]
                    : []),

                // Pool price time series
                ...Array.from(poolsTimeSeries.values()).map((pool) => ({
                    name: pool.name,
                    type: 'line' as const,
                    data: pool.data.map((point) => [point.time, point.value]),
                    smooth: true,
                    symbol: 'none',
                    lineStyle: {
                        color: pool.color,
                        width: 1.5,
                        opacity: 1,
                    },
                    itemStyle: {
                        color: pool.color,
                        opacity: 1,
                    },
                    emphasis: {
                        focus: 'series',
                        lineStyle: {
                            width: 2,
                            opacity: 1,
                        },
                    },
                })),
            ],
            legend: {
                show: true,
                bottom: 15,
                left: 10,
                orient: 'horizontal',
                itemGap: 15,
                itemWidth: 14,
                itemHeight: 10,
                textStyle: {
                    fontSize: 11,
                    color: colors.milkOpacity[600],
                    fontFamily: INTER_FONT.style.fontFamily,
                },
                selectedMode: 'multiple',
                data: [
                    // ...(binanceTimeSeries.length > 0 ? ['Binance'] : []),
                    ...(binanceTimeSeries.length
                        ? [
                              {
                                  name: 'Market Price (Binance)',
                                  icon: 'roundRect',
                                  itemStyle: {
                                      color: useFallbackPrice ? '#888888' : '#F3BA2F',
                                  },
                              },
                          ]
                        : []),
                    ...Array.from(poolsTimeSeries.values()).map((pool) => {
                        return {
                            name: pool.name,
                            icon: 'roundRect',
                            itemStyle: {
                                color: pool.color,
                            },
                        }
                    }),
                ],
            },
            // No graphic overlay when we have actual data
        } as EChartsOption
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [binanceTimeSeries, poolsTimeSeries, targetSpreadBps, colors, isMobile, useFallbackPrice])

    // Loading placeholder with animated skeleton
    const loadingOptions = useMemo((): EChartsOption => {
        // Use a reasonable default price range for loading state
        const basePrice = 3400
        const now = Date.now()

        // Generate time points for skeleton
        const skeletonPoints = 30
        const timePoints = Array.from({ length: skeletonPoints }, (_, i) => now - (skeletonPoints - i - 1) * refreshInterval)

        // Create smooth animated lines with VISIBLE amplitudes
        const createSkeletonLine = (offset: number, amplitudePercent: number) => {
            // Use percentage of base price for more visible waves
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
                axisLabel: {
                    show: true,
                    color: colors.milkOpacity[100],
                    fontSize: 10,
                    formatter: () => '••:••',
                },
                splitLine: { show: false },
            },
            yAxis: {
                type: 'value',
                position: 'right',
                min: basePrice * 0.995,
                max: basePrice * 1.005,
                axisLine: { show: false },
                axisLabel: {
                    show: true,
                    color: colors.milkOpacity[100],
                    fontSize: 10,
                    margin: 15,
                    formatter: () => '$•,•••',
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: colors.milkOpacity[50],
                        type: 'dashed',
                        opacity: 0.3,
                    },
                },
            },
            series: [
                // Skeleton line 1 - simulating Binance price
                {
                    name: 'skeleton1',
                    type: 'line',
                    data: createSkeletonLine(0, 0.002), // 0.2% amplitude for visibility
                    smooth: true,
                    symbol: 'none',
                    lineStyle: {
                        color: colors.milkOpacity[200],
                        width: 2,
                        opacity: 0.6,
                    },
                    animation: true,
                    animationDuration: 3000,
                    animationDelay: 0,
                },
                // Skeleton line 2 - simulating pool 1
                {
                    name: 'skeleton2',
                    type: 'line',
                    data: createSkeletonLine(10, 0.0015), // 0.15% amplitude
                    smooth: true,
                    symbol: 'none',
                    lineStyle: {
                        color: colors.milkOpacity[150],
                        width: 1.5,
                        opacity: 0.5,
                    },
                    animation: true,
                    animationDuration: 3000,
                    animationDelay: 200,
                },
                // Skeleton line 3 - simulating pool 2
                {
                    name: 'skeleton3',
                    type: 'line',
                    data: createSkeletonLine(20, 0.001), // 0.1% amplitude
                    smooth: true,
                    symbol: 'none',
                    lineStyle: {
                        color: colors.milkOpacity[100],
                        width: 1.5,
                        opacity: 0.4,
                    },
                    animation: true,
                    animationDuration: 3000,
                    animationDelay: 400,
                },
            ],
            legend: {
                show: true,
                bottom: 15,
                left: 10,
                data: [{ name: 'Loading...', icon: 'roundRect', itemStyle: { color: colors.milkOpacity[100] } }],
                textStyle: {
                    fontSize: 11,
                    color: colors.milkOpacity[200],
                    fontFamily: INTER_FONT.style.fontFamily,
                },
            },
            // graphic: [
            //     {
            //         type: 'text',
            //         left: 'center',
            //         top: 'center',
            //         style: {
            //             text: 'Collecting price data...',
            //             fontSize: 14,
            //             fontWeight: 'normal',
            //             fill: colors.milkOpacity[400],
            //             fontFamily: INTER_FONT.style.fontFamily,
            //         },
            //         z: 100,
            //     },
            // ],
        }
    }, [refreshInterval, isMobile, colors]) // Removed referencePrice dependency - always use fixed basePrice for loading

    // Error state
    if (error) {
        return (
            <div className={cn('flex h-[400px] items-center justify-center', className)}>
                <div className="text-folly">Error loading spread data</div>
            </div>
        )
    }

    // Simple logic: show chart if we have enough data, otherwise show loading
    const options = hasEnoughData ? chartOptions : loadingOptions

    debugLog('[SpreadChart] Rendering with:', {
        hasEnoughData,
        binanceTimeSeriesLength: binanceTimeSeries.length,
        poolsTimeSeriesSize: poolsTimeSeries.size,
        isUsingChartOptions: hasEnoughData,
    })

    return (
        <Suspense fallback={<CustomFallback />}>
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <EchartWrapper
                    options={options}
                    className={cn('size-full', className)}
                    forceReplace={!hasEnoughData} // Force replace when transitioning from loading to chart
                />
            </ErrorBoundary>
        </Suspense>
    )
}

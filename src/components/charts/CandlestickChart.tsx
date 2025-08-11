'use client'

import { useEffect, useState, useMemo } from 'react'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { ErrorBoundary } from 'react-error-boundary'
import { Suspense } from 'react'
import { useTheme } from 'next-themes'
import EchartWrapper, { CustomFallback } from './EchartWrapper'
import { ErrorBoundaryFallback } from '../common/ErrorBoundaryFallback'
import { INTER_FONT } from '@/config'
import { ChartColors } from '@/config/chart-colors.config'
import { cn } from '@/utils'
import numeral from 'numeral'
import { CHAINS_CONFIG } from '@/config/chains.config'

dayjs.extend(timezone)

export interface CandlestickDataPoint {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume?: number
}

interface CandlestickChartProps {
    data: CandlestickDataPoint[] | null
    isLoading?: boolean
    error?: Error | null
    symbol?: string
    baseSymbol?: string
    quoteSymbol?: string
    chainId: number
    upColor?: string
    downColor?: string
    targetSpreadBps?: number
    referencePrice?: number
    referencePrices?: Array<{ time: number; price: number }>
    className?: string
}

// https://app.1inch.io/advanced/limit?network=1&src=WETH&dst=USDC
export default function CandlestickChart({
    data,
    isLoading = false,
    error = null,
    symbol = 'Chart',
    baseSymbol = '',
    quoteSymbol = '',
    chainId,
    upColor,
    downColor,
    targetSpreadBps = 5,
    referencePrice,
    referencePrices,
    className,
}: CandlestickChartProps) {
    const [options, setOptions] = useState<echarts.EChartsOption | null>(null)
    const { resolvedTheme } = useTheme()
    const colors = resolvedTheme === 'dark' ? ChartColors.dark : ChartColors.light

    // Check for mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

    // Data state checks
    const hasData = data && data.length > 0
    const showLoading = isLoading && !hasData
    const showNoData = !isLoading && !hasData && !error

    useEffect(() => {
        if (isLoading || error || !data || data.length === 0) {
            setOptions(null)
            return
        }

        const ohlc = data.map((item) => [item.time, item.open, item.close, item.low, item.high])

        // Compute spread band - using each candle's high and low
        // Make sure spread is visible by using a minimum of 50 bps for visualization
        // const effectiveSpreadBps = Math.max(targetSpreadBps, 50)
        const effectiveSpreadBps = targetSpreadBps

        // Lower bound: candle's low - target spread
        const lowerBound = data.map((item) => {
            return [item.time, item.low * (1 - effectiveSpreadBps / 10000)]
        })

        // For the stack, we need the difference between upper and lower
        // Upper bound: candle's high + target spread
        const spreadBand = data.map((item) => {
            const lower = item.low * (1 - effectiveSpreadBps / 10000)
            const upper = item.high * (1 + effectiveSpreadBps / 10000)
            return [item.time, upper - lower]
        })

        // Also create explicit upper bound for the dashed line
        const upperBound = data.map((item) => {
            return [item.time, item.high * (1 + effectiveSpreadBps / 10000)]
        })

        // Create reference price line data
        let referencePriceLine = null

        if (referencePrices && referencePrices.length > 0) {
            // Use historical prices if available
            // Map Binance prices to chart data timestamps
            referencePriceLine = data.map((item) => {
                // Find the closest Binance price for this timestamp
                const closestPrice = referencePrices.reduce((prev, curr) => {
                    return Math.abs(curr.time - item.time) < Math.abs(prev.time - item.time) ? curr : prev
                })
                return [item.time, closestPrice.price]
            })
        } else if (referencePrice) {
            // Fallback to static price line
            referencePriceLine = data.map((item) => {
                return [item.time, referencePrice]
            })
        }

        // Calculate the time range to determine appropriate label formatting
        const timeRange = data.length > 1 ? data[data.length - 1].time - data[0].time : 0
        const hourRange = timeRange / (1000 * 60 * 60) // Convert to hours
        const dayRange = hourRange / 24

        // series names
        const chartSeriesNames = {
            lowerBound: 'Lower Bound',
            spreadBand: `${targetSpreadBps} bps spread band`,
            upperBound: 'Upper Bound',
            ohlc: `${CHAINS_CONFIG[chainId].name} Price `,
            ohlcUp: `${baseSymbol} / ${quoteSymbol} Up`,
            ohlcDown: `${baseSymbol} / ${quoteSymbol} Down`,
            referencePrice: 'Market Price (Binance)',
        }

        const chartOptions: echarts.EChartsOption = {
            animation: true,
            grid: { top: 5, left: 0, right: 55, bottom: 70 },
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
                    ...(referencePrice
                        ? [
                              {
                                  name: chartSeriesNames.referencePrice,
                                  icon: 'roundRect',
                                  itemStyle: {
                                      color: '#F3BA2F',
                                  },
                              },
                          ]
                        : []),
                    {
                        name: chartSeriesNames.ohlc,
                        icon:
                            'image://data:image/svg+xml;base64,' +
                            btoa(`
                            <svg width="14" height="10" xmlns="http://www.w3.org/2000/svg">
                                <rect x="0" y="0" width="7" height="10" rx="2" ry="2" fill="${upColor || colors.aquamarine}" />
                                <rect x="7" y="0" width="7" height="10" rx="2" ry="2" fill="${downColor || colors.folly}" />
                            </svg>
                        `),
                    },
                    {
                        name: chartSeriesNames.spreadBand,
                        icon: 'roundRect',
                        itemStyle: {
                            color: 'rgba(0, 255, 180, 0.5)',
                        },
                    },
                ],
            },
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0],
                    start: 0,
                    end: 100,
                    minValueSpan: 3600 * 1000 * 2, // Minimum 2 hours visible
                    zoomOnMouseWheel: true,
                    moveOnMouseMove: true,
                    moveOnMouseWheel: false,
                    preventDefaultMouseMove: true,
                },
            ],
            tooltip: {
                borderColor: 'rgba(55, 65, 81, 0.5)', // subtle border
                triggerOn: 'mousemove|click',
                backgroundColor: '#FFF4E005',
                borderRadius: 12,
                extraCssText: 'backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding:12px;',
                borderWidth: 1,
                padding: [6, 10],
                trigger: 'axis',
                appendToBody: true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter: function (params: any) {
                    if (!params || params.length === 0) return ''

                    const date = dayjs(params[0].axisValue).tz('America/New_York')
                    const formatString = hourRange <= 1 ? 'HH:mm' : dayRange <= 2 ? 'ddd, MMM D, HH:mm' : 'ddd, MMM D, YYYY'
                    const formattedDate = date.format(formatString)

                    let tooltipContent = `<div style="font-size: 11px; color: ${colors.milkOpacity[600]}; margin-bottom: 8px;">${formattedDate}</div>`

                    // Process params in reverse order to show legend items first
                    const items = [...params].reverse()

                    items.forEach((item) => {
                        const seriesName = item.seriesName

                        // Skip Lower Bound and Upper Bound display
                        if (seriesName === chartSeriesNames.lowerBound || seriesName === chartSeriesNames.upperBound) {
                            return
                        }

                        if (seriesName === chartSeriesNames.ohlc && item.data) {
                            // Candlestick data
                            const [, open, close, low, high] = item.data
                            tooltipContent += `
                                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                                    <span style="display: inline-block; width: 10px; height: 10px; background: ${item.color}; border-radius: 2px; margin-right: 8px;"></span>
                                    <span style="color: ${colors.milkOpacity[600]};">${item.seriesName}</span>
                                </div>
                                <div style="padding-left: 18px; margin-bottom: 8px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                        <span style="color: ${colors.milkOpacity[400]}; margin-right: 24px;">open</span>
                                        <span style="color: ${colors.milk};">${(Math.round(open * 100) / 100).toFixed(2)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                        <span style="color: ${colors.milkOpacity[400]}; margin-right: 24px;">close</span>
                                        <span style="color: ${colors.milk};">${(Math.round(close * 100) / 100).toFixed(2)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                        <span style="color: ${colors.milkOpacity[400]}; margin-right: 24px;">lowest</span>
                                        <span style="color: ${colors.milk};">${(Math.round(low * 100) / 100).toFixed(2)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: ${colors.milkOpacity[400]}; margin-right: 24px;">highest</span>
                                        <span style="color: ${colors.milk};">${(Math.round(high * 100) / 100).toFixed(2)}</span>
                                    </div>
                                </div>
                            `
                        } else if (item.seriesName && item.value !== undefined) {
                            // Line data (Target Spread Band, Binance Reference Price)
                            const value = Array.isArray(item.value) ? item.value[1] : item.value

                            // Only show color for reference price
                            const showColor = seriesName === chartSeriesNames.referencePrice
                            // Always use yellow for reference price
                            const displayColor = showColor ? '#F3BA2F' : item.color

                            tooltipContent += `
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                                    <div style="display: flex; align-items: center;">
                                        ${showColor ? `<span style="display: inline-block; width: 10px; height: 10px; background: ${displayColor}; border-radius: 2px; margin-right: 8px;"></span>` : ''}
                                        <span style="color: ${colors.milkOpacity[600]};">${item.seriesName}</span>
                                    </div>
                                    <span style="color: ${colors.milk}; margin-left: 24px;">${(Math.round(value * 100) / 100).toFixed(2)}</span>
                                </div>
                            `
                        }
                    })

                    return tooltipContent
                },
            },
            xAxis: [
                {
                    id: 'ohlcv',
                    type: 'time',
                    boundaryGap: ['0%', '0%'],
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        hideOverlap: true, // ✅ avoid overlapping
                        // @ts-expect-error TODO: fix this
                        interval: 'auto', // ✅ let echarts auto-decide spacing
                        showMinLabel: false,
                        showMaxLabel: false,
                        formatter: (value: string | number) => {
                            const date = dayjs(value)

                            // For intraday data (less than 2 days), show date + time
                            if (dayRange < 2) {
                                // For very short timeframes (less than 6 hours), only show time
                                if (hourRange < 6) {
                                    return date.format('HH:mm')
                                }
                                // For single day, show time with date only on first label
                                return date.format('HH:mm')
                            }

                            // For multi-day data (2-7 days), show day and date
                            if (dayRange < 7) {
                                return date.format('MMM D')
                            }

                            // For weekly to monthly data
                            if (dayRange < 30) {
                                return date.format('MMM D')
                            }

                            // For longer timeframes, include year if needed
                            return date.format('MMM D')
                        },
                        color: colors.milkOpacity[200],
                        fontSize: 10,
                        margin: 15,
                        rotate: 0, // Keep labels horizontal
                    },
                    // Control label interval separately
                    // minInterval: 3600 * 1000 * 2, // optional: adjust min spacing between ticks (e.g. 2 hours),
                    minInterval:
                        dayRange < 1
                            ? 3600 * 1000 * 2 // 2 hours for intraday
                            : dayRange < 7
                              ? 3600 * 1000 * 24 // 1 day for weekly
                              : 3600 * 1000 * 24 * 7, // 1 week for monthly
                    axisPointer: {
                        show: true,
                        label: {
                            show: true,
                            margin: 10,
                            padding: [6, 10],
                            fontSize: 11,
                            borderRadius: 4,
                            formatter: ({ value }) => {
                                return dayjs(value).format('dddd, MMMM D, YYYY ∙ hh:mm A')
                            },
                            backgroundColor: colors.milkOpacity[50],
                            color: colors.milk,
                            borderColor: 'transparent',
                        },
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: colors.milkOpacity[150],
                        },
                    },
                    axisTick: {
                        show: false,
                    },
                },
            ],
            yAxis: [
                {
                    scale: true,
                    position: 'right',
                    axisLabel: {
                        formatter: (value: number) => numeral(value).format('0.[00]a'),
                        show: true,
                        color: colors.milkOpacity[200],
                        fontSize: 10,
                        margin: 20,
                        hideOverlap: true,
                        showMinLabel: true,
                        showMaxLabel: true,
                    },
                    splitLine: {
                        show: false,
                        // lineStyle: { color: colors.milkOpacity[100], type: 'dashed' },
                    },
                    axisLine: {
                        show: false,
                    },
                },
            ],
            axisPointer: {
                link: [
                    {
                        xAxisIndex: 'all',
                    },
                ],
            },
            textStyle: {
                color: colors.milkOpacity[600],
                fontFamily: INTER_FONT.style.fontFamily,
            },
            series: [
                // Lower bound - base of the stack (hidden from legend)
                {
                    name: chartSeriesNames.lowerBound,
                    type: 'line',
                    data: lowerBound,
                    symbol: 'none',
                    silent: true,
                    stack: 'spread',
                    legendHoverLink: false,
                    showSymbol: false,
                    lineStyle: {
                        // type: 'dashed',
                        color: 'transparent',
                        opacity: 0.7,
                        width: 1.5,
                    },
                    areaStyle: {
                        opacity: 0,
                    },
                    z: 1,
                },
                // Spread band - stacked on top of lower bound (shown in legend as Target Spread Band)
                {
                    name: chartSeriesNames.spreadBand,
                    type: 'line',
                    data: spreadBand,
                    symbol: 'none',
                    silent: true,
                    stack: 'spread',
                    legendHoverLink: false,
                    showSymbol: false,
                    lineStyle: {
                        opacity: 0,
                    },
                    areaStyle: {
                        color: 'rgba(0, 255, 180, 0.15)',
                    },
                    z: 1,
                },
                // Upper bound line (hidden from legend)
                {
                    name: chartSeriesNames.upperBound,
                    type: 'line',
                    data: upperBound,
                    symbol: 'none',
                    silent: true,
                    legendHoverLink: false,
                    showSymbol: false,
                    lineStyle: {
                        // type: 'dashed',
                        color: 'transparent',
                        opacity: 0.7,
                        width: 1.5,
                    },
                    z: 2,
                },
                // Candlestick series (shown in legend as 1inch OHLCV)
                {
                    name: chartSeriesNames.ohlc,
                    type: 'candlestick',
                    data: ohlc,
                    itemStyle: {
                        color: upColor || colors.aquamarine,
                        color0: downColor || colors.folly,
                        borderColor: upColor || colors.aquamarine,
                        borderColor0: downColor || colors.folly,
                        borderWidth: 1,
                    },
                    emphasis: {
                        itemStyle: {
                            borderWidth: 2,
                        },
                    },
                    z: 10,
                },
                // Reference price line (Binance)
                ...(referencePriceLine
                    ? [
                          {
                              name: chartSeriesNames.referencePrice,
                              type: 'line' as const,
                              data: referencePriceLine,
                              symbol: 'circle',
                              symbolSize: 0,
                              legendHoverLink: false,
                              showSymbol: false,
                              lineStyle: {
                                  color: '#F3BA2F',
                                  width: 3,
                                  //   type: 'dashed' as const,
                                  dashOffset: 5,
                                  cap: 'round' as const,
                                  join: 'round' as const,
                              },
                              z: 15,
                          },
                      ]
                    : []),
            ],
        }

        setOptions(chartOptions)
    }, [
        data,
        isLoading,
        error,
        symbol,
        baseSymbol,
        quoteSymbol,
        colors,
        isMobile,
        upColor,
        downColor,
        targetSpreadBps,
        referencePrice,
        referencePrices,
        resolvedTheme,
        chainId,
    ])

    // Loading and no data state options
    const emptyStateOptions = useMemo((): echarts.EChartsOption => {
        const isLoadingState = isLoading && !data

        if (isLoadingState) {
            // Generate dummy candlestick data for loading animation
            const dummyDataPoints = 20
            const basePrice = 3400
            const now = Date.now()
            const intervalMs = 3600000 // 1 hour in milliseconds

            const dummyTimestamps = Array.from({ length: dummyDataPoints }, (_, i) => now - (dummyDataPoints - i) * intervalMs)

            const dummyOhlc = Array.from({ length: dummyDataPoints }, (_, i) => {
                const variation = Math.sin(i * 0.5) * 50 + Math.random() * 20
                const open = basePrice + variation
                const close = open + (Math.random() - 0.5) * 30
                const high = Math.max(open, close) + Math.random() * 10
                const low = Math.min(open, close) - Math.random() * 10
                return [open, close, low, high]
            })

            return {
                animation: true,
                animationDuration: 2000,
                animationEasing: 'linear',
                animationDurationUpdate: 1000,
                tooltip: { show: false },
                xAxis: {
                    type: 'category',
                    data: dummyTimestamps,
                    boundaryGap: false,
                    axisLine: { show: true, lineStyle: { color: colors.milkOpacity[150] } },
                    axisLabel: {
                        show: false,
                    },
                    splitLine: { show: false },
                    axisTick: { show: false },
                },
                yAxis: {
                    type: 'value',
                    position: 'right',
                    scale: true,
                    axisLine: { show: false },
                    axisLabel: {
                        show: false,
                    },
                    splitLine: { show: false },
                },
                grid: { top: 5, left: 0, right: 55, bottom: 40 },
                series: [
                    {
                        type: 'candlestick',
                        data: dummyOhlc,
                        itemStyle: {
                            color: colors.milkOpacity[200],
                            color0: colors.milkOpacity[150],
                            borderColor: colors.milkOpacity[200],
                            borderColor0: colors.milkOpacity[150],
                            borderWidth: 1,
                            opacity: 0.5,
                        },
                    },
                ],
                graphic: [
                    {
                        type: 'text',
                        left: 'center',
                        top: 'center',
                        style: {
                            text: 'Loading...',
                            fontSize: 14,
                            fontWeight: 'normal',
                            fill: colors.milkOpacity[100],
                            fontFamily: INTER_FONT.style.fontFamily,
                        },
                        z: 100,
                    },
                ],
            }
        }

        // No data state
        return {
            tooltip: { show: false },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                axisLine: { show: true, lineStyle: { color: colors.milkOpacity[150] } },
                axisLabel: {
                    color: colors.milkOpacity[200],
                    fontSize: 10,
                    margin: 15,
                },
                splitLine: { show: false },
                axisTick: { show: false },
            },
            yAxis: {
                type: 'value',
                position: 'right',
                scale: true,
                axisLine: { show: false },
                axisLabel: {
                    color: colors.milkOpacity[200],
                    fontSize: 10,
                    margin: 20,
                },
                splitLine: { show: false },
            },
            grid: { top: 5, left: 0, right: 55, bottom: 40 },
            graphic: [
                {
                    type: 'text',
                    left: 'center',
                    top: 'center',
                    style: {
                        text: 'No chart data available',
                        fontSize: isMobile ? 16 : 20,
                        fontWeight: 'normal',
                        fill: colors.milkOpacity[400],
                        fontFamily: INTER_FONT.style.fontFamily,
                    },
                    z: 100,
                },
            ],
        }
    }, [isLoading, data, isMobile, colors])

    // Determine which options to use
    const displayOptions = showLoading || showNoData ? emptyStateOptions : options

    return (
        <Suspense fallback={<CustomFallback />}>
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <EchartWrapper options={displayOptions || emptyStateOptions} className={cn('size-full', className)} />
            </ErrorBoundary>
        </Suspense>
    )
}

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
    upColor?: string
    downColor?: string
    targetSpreadBps?: number
    referencePrice?: number
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
    upColor,
    downColor,
    targetSpreadBps = 5,
    referencePrice,
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

        // Create reference price line data if provided
        console.log('CandlestickChart - referencePrice:', referencePrice)
        const referencePriceLine = referencePrice
            ? data.map((item) => {
                  return [item.time, referencePrice]
              })
            : null
        console.log('CandlestickChart - referencePriceLine:', referencePriceLine?.slice(0, 3))

        // Calculate the time range to determine appropriate label formatting
        const timeRange = data.length > 1 ? data[data.length - 1].time - data[0].time : 0
        const hourRange = timeRange / (1000 * 60 * 60) // Convert to hours
        const dayRange = hourRange / 24

        const chartOptions: echarts.EChartsOption = {
            animation: true,
            grid: { top: 5, left: 0, right: 55, bottom: 60 },
            legend: {
                show: true,
                bottom: 5,
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
                selectedMode: false,
                data: [
                    {
                        name: '1inch OHLCV',
                        icon: 'rect',
                        itemStyle: {
                            color: colors.milkOpacity[400],
                        },
                    },
                    {
                        name: 'Target Spread Band',
                        icon: 'rect',
                        itemStyle: {
                            color: 'rgba(0, 255, 180, 0.5)',
                        },
                    },
                    ...(referencePrice
                        ? [
                              {
                                  name: 'Binance Reference Price',
                                  icon: 'rect',
                                  itemStyle: {
                                      color: '#FF6B6B',
                                  },
                              },
                          ]
                        : []),
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
                    name: 'Lower Bound',
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
                    name: 'Target Spread Band',
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
                    name: 'Upper Bound',
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
                    name: '1inch OHLCV',
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
                              name: 'Binance Reference Price',
                              type: 'line' as const,
                              data: referencePriceLine,
                              symbol: 'circle',
                              symbolSize: 0,
                              legendHoverLink: false,
                              showSymbol: false,
                              lineStyle: {
                                  color: '#FF6B6B',
                                  width: 2.5,
                                  type: 'dashed' as const,
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
        resolvedTheme,
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

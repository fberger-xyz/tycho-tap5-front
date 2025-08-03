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

        // Calculate the time range to determine appropriate label formatting
        const timeRange = data.length > 1 ? data[data.length - 1].time - data[0].time : 0
        const hourRange = timeRange / (1000 * 60 * 60) // Convert to hours
        const dayRange = hourRange / 24

        const chartOptions: echarts.EChartsOption = {
            animation: true,
            // grid: { top: 5, left: 0, right: 50, bottom: 90 }, // datazoom
            grid: { top: 5, left: 0, right: 55, bottom: 40 },
            legend: {
                show: false,
            },
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
                        showMinLabel: false, // Hide min label to prevent cropping
                        showMaxLabel: true,
                        rotate: 0, // Keep labels horizontal
                    },
                    // Control label interval separately
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
                {
                    name: symbol,
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
                },
            ],
        }

        setOptions(chartOptions)
    }, [data, isLoading, error, symbol, baseSymbol, quoteSymbol, colors, isMobile, upColor, downColor])

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

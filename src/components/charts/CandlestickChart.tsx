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
import { Trade } from '@prisma/client'
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
    trades?: Trade[]
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
    trades,
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
                        formatter: (value) => {
                            return dayjs(value).format('MMM D')
                        },
                        color: colors.milkOpacity[200],
                        fontSize: 10,
                        margin: 15,
                        showMinLabel: false,
                        showMaxLabel: true,
                    },
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
            // dataZoom: [
            //     {
            //         xAxisIndex: 0,
            //         show: true,
            //         type: 'slider',
            //         height: 20,
            //         bottom: 30,
            //         backgroundColor: colors.milkOpacity[100],
            //         fillerColor: 'transparent',
            //         borderColor: colors.milkOpacity[200],
            //         labelFormatter: (valueIndex) => dayjs(timestamps[valueIndex]).format('MMM D, HH:mm UTC'),
            //         textStyle: { color: colors.milkOpacity[200], fontSize: 10 },
            //         handleLabel: { show: true },
            //         dataBackground: {
            //             lineStyle: { color: colors.milkOpacity[200], opacity: 0.3 },
            //             areaStyle: { color: colors.milkOpacity[50], opacity: 0.3 },
            //         },
            //         selectedDataBackground: {
            //             lineStyle: { color: colors.aquamarine, opacity: 0.5 },
            //             areaStyle: { color: colors.aquamarine, opacity: 0.2 },
            //         },
            //         brushStyle: { color: 'transparent' },
            //         handleStyle: { color: colors.milkOpacity[400], borderColor: colors.milkOpacity[200] },
            //         moveHandleStyle: { color: colors.milkOpacity[400] },
            //         emphasis: {
            //             handleLabel: { show: true },
            //             moveHandleStyle: { color: colors.milkOpacity[400] },
            //         },
            //         rangeMode: ['value', 'value'],
            //         left: 110,
            //         right: 110,
            //         brushSelect: false,
            //     },
            //     {
            //         xAxisIndex: 0,
            //         type: 'inside',
            //         zoomOnMouseWheel: 'ctrl',
            //         moveOnMouseMove: 'ctrl',
            //         moveOnMouseWheel: false,
            //         preventDefaultMouseMove: false,
            //     },
            // ],
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
                    // markLine:
                    //     trades && trades.length > 0
                    //         ? {
                    //               animation: false,
                    //               symbol: ['none', 'none'],
                    //               lineStyle: {
                    //                   color: colors.aquamarine,
                    //                   type: 'solid',
                    //                   width: 2,
                    //                   opacity: 0.8,
                    //               },
                    //               data: (() => {
                    //                   // First pass: calculate all positions
                    //                   const tradeData = trades.map((trade, tradeIndex) => {
                    //                       const tradeTimestamp = new Date(trade.createdAt).getTime()
                    //                       let closestIndex = 0
                    //                       let minDiff = Math.abs(timestamps[0] - tradeTimestamp)

                    //                       timestamps.forEach((ts, idx) => {
                    //                           const diff = Math.abs(ts - tradeTimestamp)
                    //                           if (diff < minDiff) {
                    //                               minDiff = diff
                    //                               closestIndex = idx
                    //                           }
                    //                       })

                    //                       return { trade, tradeIndex, closestIndex }
                    //                   })

                    //                   // Group by position to detect overlaps
                    //                   const positionGroups = tradeData.reduce(
                    //                       (groups, data) => {
                    //                           if (!groups[data.closestIndex]) {
                    //                               groups[data.closestIndex] = []
                    //                           }
                    //                           groups[data.closestIndex].push(data)
                    //                           return groups
                    //                       },
                    //                       {} as Record<number, typeof tradeData>,
                    //                   )

                    //                   // Create mark line data with smart label positioning
                    //                   return tradeData.map(({ trade, tradeIndex, closestIndex }) => {
                    //                       const group = positionGroups[closestIndex]
                    //                       const positionInGroup = group.findIndex((d) => d.tradeIndex === tradeIndex)

                    //                       // Calculate vertical offset based on position in group
                    //                       const baseOffset = -10
                    //                       const spacing = 20
                    //                       const yOffset = baseOffset - positionInGroup * spacing

                    //                       return {
                    //                           xAxis: closestIndex,
                    //                           label: {
                    //                               show: true,
                    //                               formatter: `${tradeIndex + 1}`,
                    //                               position: 'start',
                    //                               distance: 5,
                    //                               offset: [0, yOffset],
                    //                               color: colors.milk,
                    //                               backgroundColor: colors.aquamarine,
                    //                               padding: [2, 4],
                    //                               borderRadius: 10,
                    //                               fontSize: 10,
                    //                               fontWeight: 'bold',
                    //                           },
                    //                           tooltip: {
                    //                               formatter: () => {
                    //                                   return `Trade #${tradeIndex + 1}: ${dayjs(trade.createdAt).format('MMM D, HH:mm:ss UTC')}`
                    //                               },
                    //                           },
                    //                       }
                    //                   })
                    //               })(),
                    //           }
                    //         : undefined,
                },
            ],
        }

        setOptions(chartOptions)
    }, [data, isLoading, error, symbol, baseSymbol, quoteSymbol, colors, isMobile, upColor, downColor, trades])

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

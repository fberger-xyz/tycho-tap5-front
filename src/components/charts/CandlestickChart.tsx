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
import { APP_METADATA } from '@/config/app.config'
import { ChartColors } from '@/config/chart-colors.config'
import { cn } from '@/utils'
import { Trade } from '@prisma/client'

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

        const timestamps = data.map((item) => item.time)
        const ohlc = data.map((item) => [item.open, item.close, item.low, item.high])

        // Debug logging
        if (trades && trades.length > 0) {
            const tradeTimestamps = trades.map((t) => {
                return {
                    createdAt: t.createdAt,
                    timestamp: new Date(t.createdAt).getTime(),
                    formatted: dayjs(t.createdAt).format('MMM D, HH:mm:ss'),
                }
            })
            console.log('Trade timestamps:', tradeTimestamps)
            console.log('Chart data range:', {
                first: dayjs(timestamps[0]).format('MMM D, HH:mm:ss'),
                last: dayjs(timestamps[timestamps.length - 1]).format('MMM D, HH:mm:ss'),
                totalCandles: timestamps.length,
            })

            // Log the timestamp values to check if they're in the expected range
            console.log('Chart timestamps sample:', {
                first5: timestamps.slice(0, 5).map((t) => dayjs(t).format('MMM D HH:mm')),
                last5: timestamps.slice(-5).map((t) => dayjs(t).format('MMM D HH:mm')),
            })
        }

        const chartOptions: echarts.EChartsOption = {
            animation: true,
            grid: { top: 5, left: 10, right: 50, bottom: 90 },
            legend: {
                show: false,
            },
            tooltip: {
                trigger: 'axis',
                appendToBody: true,
                triggerOn: 'mousemove|click',
                backgroundColor: '#FFF4E005',
                borderRadius: 12,
            },
            xAxis: [
                {
                    id: 'ohlcv',
                    type: 'category',
                    data: timestamps,
                    boundaryGap: false,
                    splitLine: {
                        show: true,
                        lineStyle: { color: colors.milkOpacity[100], type: 'dashed' },
                    },
                    axisLabel: {
                        formatter: (value) => dayjs(Number(value)).format('MMM D, HH:mm A UTC'),
                        color: colors.milkOpacity[200],
                        fontSize: 10,
                        margin: 15,
                        hideOverlap: true,
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
                            formatter: ({ value }) => dayjs(Number(value)).format('MMM D, HH:mm UTC'),
                            backgroundColor: colors.milkOpacity[50],
                            color: colors.milk,
                            borderColor: 'transparent',
                        },
                    },
                    axisLine: {
                        lineStyle: {
                            color: colors.milkOpacity[150],
                        },
                    },
                    axisTick: {
                        show: false,
                    },
                    min: 'dataMin',
                    max: 'dataMax',
                },
            ],
            yAxis: [
                {
                    scale: true,
                    position: 'right',
                    axisLabel: {
                        show: true,
                        color: colors.milkOpacity[200],
                        fontSize: 11,
                        margin: 10,
                        hideOverlap: true,
                        showMinLabel: true,
                        showMaxLabel: true,
                    },
                    splitLine: {
                        show: true,
                        lineStyle: { color: colors.milkOpacity[100], type: 'dashed' },
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
            dataZoom: [
                {
                    xAxisIndex: 0,
                    show: true,
                    type: 'slider',
                    height: 20,
                    bottom: 30,
                    backgroundColor: colors.milkOpacity[100],
                    fillerColor: 'transparent',
                    borderColor: colors.milkOpacity[200],
                    labelFormatter: (valueIndex) => dayjs(timestamps[valueIndex]).format('MMM D, HH:mm UTC'),
                    textStyle: { color: colors.milkOpacity[200], fontSize: 10 },
                    handleLabel: { show: true },
                    dataBackground: {
                        lineStyle: { color: colors.milkOpacity[200], opacity: 0.3 },
                        areaStyle: { color: colors.milkOpacity[50], opacity: 0.3 },
                    },
                    selectedDataBackground: {
                        lineStyle: { color: colors.aquamarine, opacity: 0.5 },
                        areaStyle: { color: colors.aquamarine, opacity: 0.2 },
                    },
                    brushStyle: { color: 'transparent' },
                    handleStyle: { color: colors.milkOpacity[400], borderColor: colors.milkOpacity[200] },
                    moveHandleStyle: { color: colors.milkOpacity[400] },
                    emphasis: {
                        handleLabel: { show: true },
                        moveHandleStyle: { color: colors.milkOpacity[400] },
                    },
                    rangeMode: ['value', 'value'],
                    left: 110,
                    right: 110,
                    brushSelect: false,
                },
                {
                    xAxisIndex: 0,
                    type: 'inside',
                    zoomOnMouseWheel: 'ctrl',
                    moveOnMouseMove: 'ctrl',
                    moveOnMouseWheel: false,
                    preventDefaultMouseMove: false,
                },
            ],
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
                    markLine:
                        trades && trades.length > 0
                            ? {
                                  animation: false,
                                  symbol: ['none', 'none'],
                                  lineStyle: {
                                      color: colors.aquamarine,
                                      type: 'solid',
                                      width: 2,
                                      opacity: 0.8,
                                  },
                                  data: (() => {
                                      // First pass: calculate all positions
                                      const tradeData = trades.map((trade, tradeIndex) => {
                                          const tradeTimestamp = new Date(trade.createdAt).getTime()
                                          let closestIndex = 0
                                          let minDiff = Math.abs(timestamps[0] - tradeTimestamp)

                                          timestamps.forEach((ts, idx) => {
                                              const diff = Math.abs(ts - tradeTimestamp)
                                              if (diff < minDiff) {
                                                  minDiff = diff
                                                  closestIndex = idx
                                              }
                                          })

                                          return { trade, tradeIndex, closestIndex }
                                      })

                                      // Group by position to detect overlaps
                                      const positionGroups = tradeData.reduce(
                                          (groups, data) => {
                                              if (!groups[data.closestIndex]) {
                                                  groups[data.closestIndex] = []
                                              }
                                              groups[data.closestIndex].push(data)
                                              return groups
                                          },
                                          {} as Record<number, typeof tradeData>,
                                      )

                                      // Create mark line data with smart label positioning
                                      return tradeData.map(({ trade, tradeIndex, closestIndex }) => {
                                          const group = positionGroups[closestIndex]
                                          const positionInGroup = group.findIndex((d) => d.tradeIndex === tradeIndex)

                                          // Calculate vertical offset based on position in group
                                          const baseOffset = -10
                                          const spacing = 20
                                          const yOffset = baseOffset - positionInGroup * spacing

                                          return {
                                              xAxis: closestIndex,
                                              label: {
                                                  show: true,
                                                  formatter: `${tradeIndex + 1}`,
                                                  position: 'start',
                                                  distance: 5,
                                                  offset: [0, yOffset],
                                                  color: colors.milk,
                                                  backgroundColor: colors.aquamarine,
                                                  padding: [2, 4],
                                                  borderRadius: 10,
                                                  fontSize: 10,
                                                  fontWeight: 'bold',
                                              },
                                              tooltip: {
                                                  formatter: () => {
                                                      return `Trade #${tradeIndex + 1}: ${dayjs(trade.createdAt).format('MMM D, HH:mm:ss UTC')}`
                                                  },
                                              },
                                          }
                                      })
                                  })(),
                              }
                            : undefined,
                },
            ],
        }

        setOptions(chartOptions)
    }, [data, isLoading, error, symbol, baseSymbol, quoteSymbol, colors, isMobile, upColor, downColor, trades])

    // Loading state options
    const loadingOptions = useMemo((): echarts.EChartsOption => {
        return {
            tooltip: { show: false },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                axisLine: { show: false, lineStyle: { color: colors.milkOpacity[150] } },
                axisLabel: { color: colors.milkOpacity[200] },
                splitLine: { show: false },
            },
            yAxis: {
                type: 'value',
                position: 'right',
                axisLine: { show: false },
                axisLabel: { color: colors.milkOpacity[200] },
                splitLine: {
                    show: true,
                    lineStyle: { color: colors.milkOpacity[50], type: 'dashed' },
                },
            },
            grid: { top: '10%', left: '1%', right: '8%', bottom: '15%' },
            graphic: [
                {
                    type: 'text',
                    left: 'center',
                    top: 'center',
                    style: {
                        text: 'Loading chart data...',
                        fontSize: isMobile ? 24 : 32,
                        fontWeight: 'bold',
                        lineDash: [0, 200],
                        lineDashOffset: 0,
                        fill: 'transparent',
                        stroke: colors.aquamarine,
                        lineWidth: 1.5,
                        fontFamily: INTER_FONT.style.fontFamily,
                    },
                    keyframeAnimation: {
                        duration: 2000,
                        loop: true,
                        keyframes: [
                            {
                                percent: 0.7,
                                style: {
                                    fill: 'transparent',
                                    lineDashOffset: 200,
                                    lineDash: [200, 0],
                                },
                            },
                            {
                                percent: 0.8,
                                style: {
                                    fill: 'transparent',
                                },
                            },
                            {
                                percent: 1,
                                style: {
                                    fill: colors.aquamarine,
                                },
                            },
                        ],
                    },
                    z: 100,
                },
                {
                    type: 'text',
                    right: 10,
                    top: 10,
                    style: {
                        text: APP_METADATA.SITE_URL,
                        fontSize: 16,
                        fontWeight: 'normal',
                        fill: 'rgba(156, 163, 175, 0.15)',
                        fontFamily: INTER_FONT.style.fontFamily,
                    },
                    z: 0,
                    silent: true,
                },
            ],
        }
    }, [isMobile, colors])

    // No data state options
    const noDataOptions = useMemo((): echarts.EChartsOption => {
        return {
            tooltip: { show: false },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                axisLine: { lineStyle: { color: colors.milkOpacity[150] } },
                axisLabel: { color: colors.milkOpacity[200] },
                splitLine: { show: false },
            },
            yAxis: {
                type: 'value',
                position: 'right',
                axisLine: { show: false },
                axisLabel: { color: colors.milkOpacity[200] },
                splitLine: {
                    show: true,
                    lineStyle: { color: colors.milkOpacity[50], type: 'dashed' },
                },
            },
            grid: { top: '10%', left: '1%', right: '8%', bottom: '15%' },
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
                {
                    type: 'text',
                    right: 10,
                    top: 10,
                    style: {
                        text: APP_METADATA.SITE_URL,
                        fontSize: 16,
                        fontWeight: 'normal',
                        fill: 'rgba(156, 163, 175, 0.15)',
                        fontFamily: INTER_FONT.style.fontFamily,
                    },
                    z: 0,
                    silent: true,
                },
            ],
        }
    }, [isMobile, colors])

    // Determine which options to use
    const displayOptions = showLoading ? loadingOptions : showNoData ? noDataOptions : options

    return (
        <Suspense fallback={<CustomFallback />}>
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <EchartWrapper options={displayOptions || loadingOptions} className={cn('size-full', className)} />
            </ErrorBoundary>
        </Suspense>
    )
}

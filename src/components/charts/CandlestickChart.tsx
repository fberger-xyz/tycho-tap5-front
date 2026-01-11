'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { ErrorBoundary } from 'react-error-boundary'
import { Suspense } from 'react'
import EchartWrapper, { CustomFallback } from '@/components/charts/EchartWrapper'
import { ErrorBoundaryFallback } from '@/components/common/ErrorBoundaryFallback'
import { INTER_FONT } from '@/config'
import { ChartColors } from '@/config/chart-colors.config'
import { cn, DAYJS_FORMATS } from '@/utils'
import numeral from 'numeral'
import { logger } from '@/utils/logger.util'
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
    targetSpreadBps: number
    referencePrice?: number
    referencePrices?: Array<{ time: number; price: number }>
    showTradeZonesInTooltip?: boolean
    className?: string
}

// https://app.1inch.io/advanced/limit?network=1&src=WETH&dst=USDC
// Helper function to create diagonal stripe pattern
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createDiagonalStripePattern(color: string, backgroundColor: string = 'transparent'): any {
    // Return simple color during SSR or when no document available
    if (typeof document === 'undefined') {
        return backgroundColor || color
    }

    try {
        const canvas = document.createElement('canvas')
        const size = 10 // Pattern size
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return color

        // Fill background
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, size, size)

        // Draw diagonal stripes
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.lineCap = 'square'

        // Draw diagonal lines
        for (let i = -size; i <= size * 2; i += 4) {
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i - size, size)
            ctx.stroke()
        }

        return {
            image: canvas,
            repeat: 'repeat',
        }
    } catch (e) {
        logger.warn('[createDiagonalStripePattern] Failed to create pattern:', { error: e instanceof Error ? e.message : String(e) })
        return backgroundColor || color
    }
}

export default function CandlestickChart({
    data,
    isLoading = false,
    baseSymbol = '',
    quoteSymbol = '',
    chainId,
    upColor,
    downColor,
    targetSpreadBps,
    referencePrice,
    referencePrices,
    showTradeZonesInTooltip = false,
    className,
}: CandlestickChartProps) {
    const [options, setOptions] = useState<echarts.EChartsOption | null>(null)
    const [forceReplace, setForceReplace] = useState(false)
    const prevDataLength = useRef(0)
    const zoomStateRef = useRef({ start: 70, end: 100 })
    const colors = ChartColors
    const isMobile = false // You can add proper mobile detection if needed
    const isClient = typeof window !== 'undefined'

    // Generate fixed skeleton candlesticks for smooth appearance
    const skeletonBars = useMemo(
        () =>
            Array.from({ length: 20 }, (_, i) => {
                // Use sine wave for smooth height variation
                const wave = Math.sin((i / 20) * Math.PI * 2.5 + 1.5)
                const height = 25 + wave * 15
                const top = 35 + Math.sin((i / 20) * Math.PI * 3) * 10
                return { height, top, delay: i * 0.05 }
            }),
        [],
    )

    // DETAILED DEBUG LOGGING
    logger.info('🔵 [CandlestickChart] Component Rendered', {
        timestamp: new Date().toISOString(),
        props: {
            hasData: !!data,
            dataLength: data?.length || 0,
            isLoading,
            chainId,
            baseSymbol,
            quoteSymbol,
            targetSpreadBps,
            hasReferencePrice: !!referencePrice,
            referencePrice,
            className,
        },
        state: {
            hasOptions: !!options,
            forceReplace,
        },
        willShowPlaceholder: isLoading || !data || data?.length === 0,
    })

    useEffect(() => {
        logger.info('🟢 [CandlestickChart] useEffect triggered', {
            timestamp: new Date().toISOString(),
            isLoading,
            hasData: !!data,
            dataLength: data?.length,
            willSkip: !data || data.length === 0,
        })

        // Skip if no data
        if (!data || data.length === 0) {
            logger.info('⚠️ [CandlestickChart] useEffect SKIPPING - No data')
            return
        }

        // Check if we need to force replace (data length changed significantly or first load)
        const shouldForceReplace = prevDataLength.current === 0 || Math.abs(data.length - prevDataLength.current) > 10
        if (shouldForceReplace !== forceReplace) {
            setForceReplace(shouldForceReplace)
        }
        prevDataLength.current = data.length

        const ohlc = data.map((item) => [item.time, item.open, item.close, item.low, item.high])

        // Compute spread bands
        const effectiveSpreadBps = targetSpreadBps

        // Create reference price line data first
        let referencePriceLine = null
        let noTradeLowerBound = null
        let noTradeUpperBound = null
        let noTradeSpreadBand = null

        if (referencePrices && referencePrices.length > 0) {
            // Use historical prices if available
            referencePriceLine = data.map((item) => {
                // Find the closest reference price for this timestamp
                const closestPrice = referencePrices.reduce((prev, curr) => {
                    return Math.abs(curr.time - item.time) < Math.abs(prev.time - item.time) ? curr : prev
                })
                return [item.time, closestPrice.price]
            })

            // Calculate no-trade zone around reference prices
            noTradeLowerBound = referencePriceLine.map(([time, price]) => {
                return [time, price * (1 - effectiveSpreadBps / 10000)]
            })

            noTradeSpreadBand = referencePriceLine.map(([time, price]) => {
                const lower = price * (1 - effectiveSpreadBps / 10000)
                const upper = price * (1 + effectiveSpreadBps / 10000)
                return [time, upper - lower]
            })

            noTradeUpperBound = referencePriceLine.map(([time, price]) => {
                return [time, price * (1 + effectiveSpreadBps / 10000)]
            })
        } else if (referencePrice) {
            // Fallback to static price line
            referencePriceLine = data.map((item) => {
                return [item.time, referencePrice]
            })

            // Calculate no-trade zone around static reference price
            noTradeLowerBound = data.map((item) => {
                return [item.time, referencePrice * (1 - effectiveSpreadBps / 10000)]
            })

            noTradeSpreadBand = data.map((item) => {
                const lower = referencePrice * (1 - effectiveSpreadBps / 10000)
                const upper = referencePrice * (1 + effectiveSpreadBps / 10000)
                return [item.time, upper - lower]
            })

            noTradeUpperBound = data.map((item) => {
                return [item.time, referencePrice * (1 + effectiveSpreadBps / 10000)]
            })
        } else {
            // No reference price - use midpoint of candles as fallback
            const midpoints = data.map((item) => (item.high + item.low) / 2)

            noTradeLowerBound = data.map((item, i) => {
                return [item.time, midpoints[i] * (1 - effectiveSpreadBps / 10000)]
            })

            noTradeSpreadBand = data.map((item, i) => {
                const lower = midpoints[i] * (1 - effectiveSpreadBps / 10000)
                const upper = midpoints[i] * (1 + effectiveSpreadBps / 10000)
                return [item.time, upper - lower]
            })

            noTradeUpperBound = data.map((item, i) => {
                return [item.time, midpoints[i] * (1 + effectiveSpreadBps / 10000)]
            })
        }

        // Calculate trading zones (areas outside the no-trade zone)
        // Lower trading zone: from candle low to bottom of no-trade zone
        const lowerTradingZone = data.map((item, i) => {
            const candleLow = item.low
            const noTradeBottom = noTradeLowerBound[i][1]
            // Only show if candle low is below no-trade zone
            const height = Math.max(0, noTradeBottom - candleLow)
            return [item.time, height]
        })

        // Upper trading zone: from top of no-trade zone to candle high
        const upperTradingZoneBase = data.map((item, i) => {
            const noTradeTop = noTradeUpperBound[i][1]
            return [item.time, noTradeTop]
        })

        const upperTradingZone = data.map((item, i) => {
            const candleHigh = item.high
            const noTradeTop = noTradeUpperBound[i][1]
            // Only show if candle high is above no-trade zone
            const height = Math.max(0, candleHigh - noTradeTop)
            return [item.time, height]
        })

        // Calculate the time range to determine appropriate label formatting
        const timeRange = data.length > 1 ? data[data.length - 1].time - data[0].time : 0
        const hourRange = timeRange / (1000 * 60 * 60) // Convert to hours
        const dayRange = hourRange / 24

        // series names
        const chartSeriesNames = {
            lowerTradingZone: 'Trade Zone',
            upperTradingZone: 'Upper Trading Zone',
            noTradeLowerBound: 'No-Trade Lower Bound',
            noTradeSpreadBand: `No-Trade Zone (±${targetSpreadBps} bps)`,
            noTradeUpperBound: 'No-Trade Upper Bound',
            ohlc: `${CHAINS_CONFIG[chainId].name} OHLC`,
            ohlcUp: `${baseSymbol} / ${quoteSymbol} Up`,
            ohlcDown: `${baseSymbol} / ${quoteSymbol} Down`,
            referencePrice: 'Market Price (Binance)',
        }

        const chartOptions: echarts.EChartsOption = {
            animation: true,
            animationDuration: 300,
            animationEasing: 'cubicOut',
            animationDurationUpdate: 300,
            animationEasingUpdate: 'cubicOut',
            grid: { top: 5, left: 0, right: 55, bottom: isMobile ? 100 : 70 },
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
                        name: chartSeriesNames.noTradeSpreadBand,
                        icon: 'roundRect',
                        itemStyle: {
                            color: 'rgba(128, 128, 128, 0.4)',
                        },
                    },
                    {
                        name: chartSeriesNames.lowerTradingZone,
                        icon: 'roundRect',
                        itemStyle: {
                            color: 'rgba(255, 100, 100, 0.4)',
                        },
                    },
                ],
            },
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0],
                    start: zoomStateRef.current.start,
                    end: zoomStateRef.current.end,
                    minValueSpan: 3600 * 1000 * 2, // Minimum 2 hours visible
                    zoomOnMouseWheel: true,
                    moveOnMouseMove: true,
                    moveOnMouseWheel: false,
                    preventDefaultMouseMove: true,
                },
            ],
            tooltip: {
                borderColor: 'rgba(55, 65, 81, 0.5)', // subtle border
                triggerOn: 'mousemove',
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

                    // Get the trade zone boundaries for this point
                    let noTradeLower = 0
                    let noTradeUpper = 0

                    // Find reference price for this data point
                    let currentReferencePrice = 0
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const refPriceItem = params.find((item: any) => item.seriesName === chartSeriesNames.referencePrice)
                    if (refPriceItem && refPriceItem.value) {
                        currentReferencePrice = Array.isArray(refPriceItem.value) ? refPriceItem.value[1] : refPriceItem.value
                    }

                    // Calculate no-trade zone boundaries based on reference price and spread
                    if (currentReferencePrice > 0) {
                        noTradeLower = currentReferencePrice * (1 - targetSpreadBps / 10000)
                        noTradeUpper = currentReferencePrice * (1 + targetSpreadBps / 10000)
                    } else {
                        // Fallback: try to find the no-trade spread band which contains the width
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const spreadBandItem = params.find((item: any) => item.seriesName === chartSeriesNames.noTradeSpreadBand)
                        if (spreadBandItem && spreadBandItem.value) {
                            const spreadBandValue = Array.isArray(spreadBandItem.value) ? spreadBandItem.value[1] : spreadBandItem.value
                            // The spread band value is the width, so we need the lower bound
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const lowerBoundItem = params.find((item: any) => item.seriesName === chartSeriesNames.noTradeLowerBound)
                            if (lowerBoundItem && lowerBoundItem.value) {
                                noTradeLower = Array.isArray(lowerBoundItem.value) ? lowerBoundItem.value[1] : lowerBoundItem.value
                                noTradeUpper = noTradeLower + spreadBandValue
                            }
                        }
                    }

                    // Process params in reverse order to show legend items first
                    const items = [...params].reverse()

                    items.forEach((item) => {
                        const seriesName = item.seriesName

                        // Skip internal series that shouldn't be displayed
                        if (
                            seriesName === chartSeriesNames.noTradeLowerBound ||
                            seriesName === chartSeriesNames.noTradeUpperBound ||
                            seriesName === chartSeriesNames.upperTradingZone ||
                            seriesName === chartSeriesNames.upperTradingZone + '_base' ||
                            seriesName === chartSeriesNames.lowerTradingZone + '_fill'
                        ) {
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
                                        <span style="color: ${colors.milk};">$${(Math.round(open * 100) / 100).toFixed(2)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                        <span style="color: ${colors.milkOpacity[400]}; margin-right: 24px;">close</span>
                                        <span style="color: ${colors.milk};">$${(Math.round(close * 100) / 100).toFixed(2)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                        <span style="color: ${colors.milkOpacity[400]}; margin-right: 24px;">lowest</span>
                                        <span style="color: ${colors.milk};">$${(Math.round(low * 100) / 100).toFixed(2)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: ${colors.milkOpacity[400]}; margin-right: 24px;">highest</span>
                                        <span style="color: ${colors.milk};">$${(Math.round(high * 100) / 100).toFixed(2)}</span>
                                    </div>
                                </div>
                            `
                        } else if (seriesName === chartSeriesNames.noTradeSpreadBand) {
                            // No-Trade Zone with detailed explanation
                            tooltipContent += `
                                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                                    <span style="display: inline-block; width: 10px; height: 10px; background: rgba(128, 128, 128, 0.4); border-radius: 2px; margin-right: 8px;"></span>
                                    <span style="color: ${colors.milkOpacity[600]};">${item.seriesName}</span>
                                </div>
                                <div style="padding-left: 18px; margin-bottom: 8px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                        <span style="color: ${colors.milkOpacity[400]}; margin-right: 24px;">upper bound</span>
                                        <span style="color: ${colors.milk};">$${noTradeUpper.toFixed(2)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                        <span style="color: ${colors.milkOpacity[400]}; margin-right: 24px;">lower bound</span>
                                        <span style="color: ${colors.milk};">$${noTradeLower.toFixed(2)}</span>
                                    </div>
                                    <div style="font-size: 10px; color: ${colors.milkOpacity[400]}; margin-top: 4px;">
                                        Bot won't trade within this range
                                    </div>
                                </div>
                            `
                        } else if (seriesName === chartSeriesNames.lowerTradingZone && showTradeZonesInTooltip) {
                            // Do nothing
                        } else if (item.seriesName && item.value !== undefined) {
                            // Skip Trade Zone series if showTradeZonesInTooltip is false
                            if (seriesName === chartSeriesNames.lowerTradingZone && !showTradeZonesInTooltip) {
                                return // Skip this series
                            }

                            // Line data (Binance Reference Price)
                            const value = Array.isArray(item.value) ? item.value[1] : item.value

                            // Show color for reference price
                            const showColor = seriesName === chartSeriesNames.referencePrice

                            // Determine the display color
                            let displayColor = item.color
                            if (seriesName === chartSeriesNames.referencePrice) {
                                displayColor = '#F3BA2F'
                            }

                            tooltipContent += `
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                                    <div style="display: flex; align-items: center;">
                                        ${showColor ? `<span style="display: inline-block; width: 10px; height: 10px; background: ${displayColor}; border-radius: 2px; margin-right: 8px;"></span>` : ''}
                                        <span style="color: ${colors.milkOpacity[600]};">${item.seriesName}</span>
                                    </div>
                                    <span style="color: ${colors.milk}; margin-left: 24px;">$${(Math.round(value * 100) / 100).toFixed(2)}</span>
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
                            align: 'center', // center the text
                            formatter: ({ value }) => {
                                // return dayjs(value).format('dddd, MMMM D, YYYY ∙ hh:mm A')
                                // return [DAYJS_FORMATS.dateLong(value), DAYJS_FORMATS.timeAgo(value)].join('\n')
                                return DAYJS_FORMATS.dateLong(value)
                            },
                            backgroundColor: colors.milkOpacity[50],
                            color: colors.milk,
                            borderColor: 'transparent',
                        },
                    },
                    axisLine: {
                        show: false,
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
                // Lower trading zone - from candle low to no-trade zone bottom
                {
                    name: chartSeriesNames.lowerTradingZone,
                    type: 'line',
                    data: data.map((item) => [item.time, item.low]),
                    symbol: 'none',
                    silent: true,
                    stack: 'trading-lower',
                    legendHoverLink: false,
                    showSymbol: false,
                    lineStyle: {
                        opacity: 0,
                    },
                    areaStyle: {
                        opacity: 0,
                    },
                    z: 1,
                },
                {
                    name: chartSeriesNames.lowerTradingZone + '_fill',
                    type: 'line',
                    data: lowerTradingZone,
                    symbol: 'none',
                    silent: true,
                    stack: 'trading-lower',
                    legendHoverLink: false,
                    showSymbol: false,
                    lineStyle: {
                        opacity: 0,
                    },
                    areaStyle: {
                        color: isClient
                            ? createDiagonalStripePattern('rgba(255, 100, 100, 0.4)', 'rgba(255, 100, 100, 0.1)')
                            : 'rgba(255, 100, 100, 0.2)',
                    },
                    z: 1,
                },

                // No-trade zone - centered around reference price
                {
                    name: chartSeriesNames.noTradeLowerBound,
                    type: 'line',
                    data: noTradeLowerBound,
                    symbol: 'none',
                    silent: true,
                    stack: 'no-trade',
                    legendHoverLink: false,
                    showSymbol: false,
                    lineStyle: {
                        color: 'transparent',
                        opacity: 0,
                    },
                    areaStyle: {
                        opacity: 0,
                    },
                    z: 2,
                },
                {
                    name: chartSeriesNames.noTradeSpreadBand,
                    type: 'line',
                    data: noTradeSpreadBand,
                    symbol: 'none',
                    silent: true,
                    stack: 'no-trade',
                    legendHoverLink: false,
                    showSymbol: false,
                    lineStyle: {
                        opacity: 0,
                    },
                    areaStyle: {
                        color: isClient
                            ? createDiagonalStripePattern('rgba(128, 128, 128, 0.3)', 'rgba(128, 128, 128, 0.1)')
                            : 'rgba(128, 128, 128, 0.15)',
                    },
                    z: 2,
                },

                // Upper trading zone - from no-trade zone top to candle high
                {
                    name: chartSeriesNames.upperTradingZone + '_base',
                    type: 'line',
                    data: upperTradingZoneBase,
                    symbol: 'none',
                    silent: true,
                    stack: 'trading-upper',
                    legendHoverLink: false,
                    showSymbol: false,
                    lineStyle: {
                        opacity: 0,
                    },
                    areaStyle: {
                        opacity: 0,
                    },
                    z: 3,
                },
                {
                    name: chartSeriesNames.upperTradingZone,
                    type: 'line',
                    data: upperTradingZone,
                    symbol: 'none',
                    silent: true,
                    stack: 'trading-upper',
                    legendHoverLink: false,
                    showSymbol: false,
                    lineStyle: {
                        opacity: 0,
                    },
                    areaStyle: {
                        color: isClient
                            ? createDiagonalStripePattern('rgba(255, 100, 100, 0.4)', 'rgba(255, 100, 100, 0.1)')
                            : 'rgba(255, 100, 100, 0.2)',
                    },
                    z: 3,
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

        logger.info('✅ [CandlestickChart] Setting chart options with data', {
            dataPoints: data.length,
            hasReferencePriceLine: !!referencePriceLine,
            seriesCount: Array.isArray(chartOptions.series) ? chartOptions.series.length : 0,
        })
        setOptions(chartOptions)
    }, [
        data,
        colors,
        upColor,
        downColor,
        targetSpreadBps,
        referencePrice,
        referencePrices,
        chainId,
        baseSymbol,
        quoteSymbol,
        showTradeZonesInTooltip,
        forceReplace,
        isClient,
        isMobile,
        isLoading,
    ])

    // Fallback empty state options (should rarely be used since useEffect handles loading)
    const emptyStateOptions = useMemo((): echarts.EChartsOption => {
        return {
            tooltip: { show: false },
            legend: { show: false },
            series: [], // Explicitly empty series
            xAxis: {
                type: 'category',
                data: [], // Empty data
                boundaryGap: false,
                axisLine: { show: false },
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
    }, [colors, isMobile])

    // Show subtle loading placeholder when loading
    if (isLoading || !data || data.length === 0) {
        logger.info('🟡 [CandlestickChart] SHOWING LOADING PLACEHOLDER', {
            reason: isLoading ? 'isLoading=true' : !data ? 'data is null/undefined' : 'data is empty array',
            isLoading,
            data,
            dataLength: data?.length,
            className,
        })

        return (
            <div className={cn('relative overflow-hidden bg-transparent', className || 'h-[400px]')}>
                {/* Subtle grid lines */}
                <div className="absolute inset-0" style={{ opacity: 0.03 }}>
                    {/* Horizontal lines */}
                    {[20, 40, 60, 80].map((y) => (
                        <div key={y} className="absolute w-full border-t border-milk/20" style={{ top: `${y}%` }} />
                    ))}
                    {/* Vertical lines */}
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
                        <div key={x} className="absolute h-full border-l border-milk/20" style={{ left: `${x}%` }} />
                    ))}
                </div>

                {/* Subtle candlestick bars */}
                <div className="absolute inset-0 flex items-end justify-around px-4 pb-12">
                    {skeletonBars.map((bar, i) => (
                        <div key={i} className="relative" style={{ width: '3%', height: '100%' }}>
                            {/* Wick */}
                            <div
                                className="absolute left-1/2 -translate-x-1/2 transform bg-milk/5"
                                style={{
                                    width: '1px',
                                    height: `${bar.height + 8}%`,
                                    top: `${bar.top - 4}%`,
                                    animation: `subtleFade 3s infinite ${bar.delay}s`,
                                }}
                            />
                            {/* Candle body */}
                            <div
                                className="absolute left-0 right-0 rounded-sm bg-milk/5"
                                style={{
                                    height: `${bar.height}%`,
                                    top: `${bar.top}%`,
                                    animation: `subtleFade 3s infinite ${bar.delay}s`,
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Very subtle loading indicator */}
                {isLoading && (
                    <div className="absolute bottom-4 right-4">
                        <div className="flex items-center gap-2 text-xs text-milk/30">
                            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Loading...
                        </div>
                    </div>
                )}

                {/* CSS animations */}
                <style jsx>{`
                    @keyframes subtleFade {
                        0%,
                        100% {
                            opacity: 0.8;
                        }
                        50% {
                            opacity: 1;
                        }
                    }
                `}</style>
            </div>
        )
    }

    logger.info('🔴 [CandlestickChart] RENDERING ECHART WRAPPER', {
        hasOptions: !!options,
        optionsOrEmpty: !!(options || emptyStateOptions),
        className,
    })

    return (
        <Suspense fallback={<CustomFallback />}>
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <EchartWrapper
                    options={options || emptyStateOptions}
                    className={cn('size-full', className)}
                    forceReplace={forceReplace}
                    onDataZoomChange={(start, end) => {
                        // Save zoom state directly as percentages
                        // ECharts already provides these as percentages when using percentage-based zoom
                        zoomStateRef.current = {
                            start: start,
                            end: end,
                        }
                    }}
                />
            </ErrorBoundary>
        </Suspense>
    )
}

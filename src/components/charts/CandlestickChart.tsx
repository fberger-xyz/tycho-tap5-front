'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
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
import { cn, DAYJS_FORMATS } from '@/utils'
import numeral from 'numeral'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { AmmAsOrderbook } from '@/interfaces'
import { getProtocolConfig } from '@/config/protocols.config'

dayjs.extend(timezone)

export interface CandlestickDataPoint {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume?: number
}

export interface PoolPriceSeries {
    poolId: string
    poolAddress: string
    protocolName: string
    protocolSystem: string
    color: string
    data: Array<[number, number]> // [timestamp, price]
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
    poolsData?: AmmAsOrderbook | null
    showPoolSeries?: boolean
    showTradeZonesInTooltip?: boolean
    className?: string
}

// Protocol colors mapping
const PROTOCOL_COLORS: Record<string, string> = {
    uniswap: '#FF007A',
    sushiswap: '#0E0F23',
    curve: '#861FFF',
    balancer: '#1E1E1E',
    pancakeswap: '#1FC7D4',
    default: '#6B7280',
}

// Function to extract pool prices from orderbook data
function extractPoolPrices(orderbookData: AmmAsOrderbook | null | undefined, existingPoolData: PoolPriceSeries[]): PoolPriceSeries[] {
    if (!orderbookData || !orderbookData.pools || orderbookData.pools.length === 0) {
        console.log('[extractPoolPrices] No pools data available')
        return existingPoolData
    }

    console.log('[extractPoolPrices] Processing pools:', orderbookData.pools.length, 'pools')
    console.log('[extractPoolPrices] Orderbook data:', {
        timestamp: orderbookData.timestamp,
        poolsCount: orderbookData.pools.length,
        hasAsks: orderbookData.asks?.length > 0,
        hasBids: orderbookData.bids?.length > 0,
        midPrice: orderbookData.mpd_base_to_quote?.mid,
        bestBid: orderbookData.mpd_base_to_quote?.best_bid,
        bestAsk: orderbookData.mpd_base_to_quote?.best_ask,
        firstAskPrice: orderbookData.asks?.[0]?.average_sell_price,
        pools: orderbookData.pools.map((p) => ({
            protocol: p.protocol_system,
            address: p.address,
            fee: p.fee,
        })),
    })

    const poolSeriesMap = new Map<string, PoolPriceSeries>()

    // Initialize with existing data
    existingPoolData.forEach((series) => {
        poolSeriesMap.set(series.protocolName, {
            ...series,
            data: [...series.data], // Copy existing data
        })
    })

    // Calculate pool-specific prices from the asks (selling base for quote)
    // The distribution array shows which pools participate in each trade

    // Get reference price with multiple fallbacks
    let referencePrice = orderbookData.mpd_base_to_quote?.mid || 0

    // Fallback: calculate mid price from best bid and ask
    if (referencePrice === 0 && orderbookData.mpd_base_to_quote) {
        const bestBid = orderbookData.mpd_base_to_quote.best_bid
        const bestAsk = orderbookData.mpd_base_to_quote.best_ask
        if (bestBid > 0 && bestAsk > 0) {
            referencePrice = (bestBid + bestAsk) / 2
        }
    }

    // Fallback: use first ask price if available
    if (referencePrice === 0 && orderbookData.asks && orderbookData.asks.length > 0) {
        const firstAsk = orderbookData.asks[0]
        if (firstAsk.average_sell_price > 0) {
            referencePrice = firstAsk.average_sell_price
        }
    }

    // Log warning if we still don't have a reference price
    if (referencePrice === 0) {
        console.warn('[extractPoolPrices] No valid reference price found in orderbook data')
        return existingPoolData // Return existing data without updates
    }

    // Handle timestamp - check if it's already in milliseconds or needs conversion
    let currentTimestamp = orderbookData.timestamp

    // If timestamp is too small, it's likely in seconds and needs conversion
    if (currentTimestamp < 10000000000) {
        currentTimestamp = currentTimestamp * 1000 // Convert to milliseconds
    }

    // Validate timestamp is reasonable (between 2020 and 2030)
    const year2020 = 1577836800000
    const year2030 = 1893456000000
    if (currentTimestamp < year2020 || currentTimestamp > year2030) {
        console.warn(`[extractPoolPrices] Invalid timestamp: ${orderbookData.timestamp}, using current time`)
        currentTimestamp = Date.now()
    }

    // Create a map of pool index to protocol
    const poolIndexToProtocol = new Map<number, string>()
    orderbookData.pools.forEach((pool, index) => {
        const protocolConfig = getProtocolConfig(pool.protocol_system)
        poolIndexToProtocol.set(index, protocolConfig.name)
    })

    // Since individual pool prices aren't available in the orderbook data,
    // we'll simulate pool prices based on their participation in trades
    // and use small offsets from the reference price

    const protocolOffsets: Record<string, number> = {
        Uniswap: 0.0002, // 0.02% offset
        Curve: -0.0001, // -0.01% offset for stableswap
        Balancer: 0.0003, // 0.03% offset
        Sushiswap: 0.0004, // 0.04% offset
        Pancakeswap: 0.0005, // 0.05% offset
    }

    // Special handling for single pool - use the orderbook mid price directly
    if (orderbookData.pools.length === 1) {
        console.log('[extractPoolPrices] Single pool detected, using orderbook mid price directly')
        const pool = orderbookData.pools[0]
        const protocolConfig = getProtocolConfig(pool.protocol_system)
        const protocolName = protocolConfig.name
        const protocolNameLower = protocolName.toLowerCase()

        // Use the mid price directly for single pool
        const poolPrice = referencePrice

        // For WETH/USDC, validate price is reasonable (should be > 1000)
        const isWethUsdc = orderbookData.base?.symbol === 'WETH' && (orderbookData.quote?.symbol === 'USDC' || orderbookData.quote?.symbol === 'USDT')

        if (isWethUsdc && poolPrice < 1000) {
            console.warn(`[extractPoolPrices] Invalid WETH/USDC price: ${poolPrice}, skipping pool series`)
            return existingPoolData
        }

        // Get or create series (preserving existing data)
        let series = poolSeriesMap.get(protocolName)
        if (!series) {
            series = {
                poolId: pool.id,
                poolAddress: pool.address,
                protocolName: protocolName,
                protocolSystem: pool.protocol_system,
                color: PROTOCOL_COLORS[protocolNameLower] || PROTOCOL_COLORS.default,
                data: [],
            }
            poolSeriesMap.set(protocolName, series)
        }
        const hasTimestamp = series.data.some(([t]) => t === currentTimestamp)

        if (!hasTimestamp && poolPrice > 0) {
            series.data.push([currentTimestamp, poolPrice])
            console.log(`[extractPoolPrices] Single pool ${protocolName} using mid price: ${poolPrice}`)

            // Keep only the last 100 points
            if (series.data.length > 100) {
                series.data = series.data.slice(-100)
            }

            series.data.sort((a, b) => a[0] - b[0])
        }

        // Return early for single pool
        const result = Array.from(poolSeriesMap.values())
        console.log('[extractPoolPrices] Single pool result:', result)
        return result
    }

    // Process pools to create price series (multi-pool case)
    if (orderbookData.asks && orderbookData.asks.length > 0) {
        // Check which pools are active in trades
        const activePoolIndices = new Set<number>()

        orderbookData.asks.slice(0, 5).forEach((ask) => {
            if (ask.distribution && ask.distribution.length > 0) {
                ask.distribution.forEach((participation, poolIndex) => {
                    if (participation > 0) {
                        activePoolIndices.add(poolIndex)
                    }
                })
            }
        })

        // Create series for active pools
        activePoolIndices.forEach((poolIndex) => {
            const pool = orderbookData.pools[poolIndex]
            if (!pool) return

            const protocolConfig = getProtocolConfig(pool.protocol_system)
            const protocolName = protocolConfig.name
            const protocolNameLower = protocolName.toLowerCase()

            // Try to get actual pool price from ask data
            let poolPrice = 0

            // Check if this pool participates in the first few asks to get its actual price
            for (const ask of orderbookData.asks.slice(0, 10)) {
                if (ask.distribution && ask.distribution[poolIndex] > 0) {
                    // This pool participates in this ask
                    // Use the average sell price as the pool's effective price
                    poolPrice = ask.average_sell_price
                    break
                }
            }

            // Fallback: Calculate pool price based on reference with small offset
            if (poolPrice === 0) {
                const offset = protocolOffsets[protocolName] || poolIndex * 0.0001
                poolPrice = referencePrice * (1 + offset)
            }

            // Get or create series
            if (!poolSeriesMap.has(protocolName)) {
                poolSeriesMap.set(protocolName, {
                    poolId: pool.id,
                    poolAddress: pool.address,
                    protocolName: protocolName,
                    protocolSystem: pool.protocol_system,
                    color: PROTOCOL_COLORS[protocolNameLower] || PROTOCOL_COLORS.default,
                    data: [],
                })
            }

            const series = poolSeriesMap.get(protocolName)!

            // Check if we already have a data point for this timestamp
            const hasTimestamp = series.data.some(([t]) => t === currentTimestamp)

            // Validate pool price is within reasonable bounds (within 50% of reference)
            const isValidPrice = poolPrice > 0 && poolPrice > referencePrice * 0.5 && poolPrice < referencePrice * 1.5

            if (!hasTimestamp && isValidPrice) {
                // Add the price point
                series.data.push([currentTimestamp, poolPrice])
                console.log(`[extractPoolPrices] Added ${protocolName} price: ${poolPrice} (ref: ${referencePrice})`)

                // Keep only the last 100 points
                if (series.data.length > 100) {
                    series.data = series.data.slice(-100)
                }

                // Sort by timestamp
                series.data.sort((a, b) => a[0] - b[0])
            }
        })
    }

    // If no ask data, use reference price with protocol-specific offsets for visualization
    if (poolSeriesMap.size === 0 && referencePrice > 0) {
        console.log('[extractPoolPrices] No distribution data, using reference price with offsets')

        orderbookData.pools.forEach((pool, index) => {
            const protocolConfig = getProtocolConfig(pool.protocol_system)
            const protocolName = protocolConfig.name

            if (!poolSeriesMap.has(protocolName)) {
                const protocolNameLower = protocolName.toLowerCase()
                const offset = protocolOffsets[protocolName] || index * 0.0001
                const poolPrice = referencePrice * (1 + offset)

                poolSeriesMap.set(protocolName, {
                    poolId: pool.id,
                    poolAddress: pool.address,
                    protocolName: protocolName,
                    protocolSystem: pool.protocol_system,
                    color: PROTOCOL_COLORS[protocolNameLower] || PROTOCOL_COLORS.default,
                    data: [[currentTimestamp, poolPrice]],
                })
            } else {
                // Add new data point to existing series
                const series = poolSeriesMap.get(protocolName)!
                const offset = protocolOffsets[protocolName] || index * 0.0001
                const poolPrice = referencePrice * (1 + offset)

                const hasTimestamp = series.data.some(([t]) => t === currentTimestamp)

                // Validate pool price is within reasonable bounds
                const isValidPrice = poolPrice > 0 && poolPrice > referencePrice * 0.5 && poolPrice < referencePrice * 1.5

                if (!hasTimestamp && isValidPrice) {
                    series.data.push([currentTimestamp, poolPrice])
                    console.log(`[extractPoolPrices] Added ${protocolName} price (fallback): ${poolPrice} (ref: ${referencePrice})`)

                    // Keep only the last 100 points
                    if (series.data.length > 100) {
                        series.data = series.data.slice(-100)
                    }

                    series.data.sort((a, b) => a[0] - b[0])
                }
            }
        })
    }

    const result = Array.from(poolSeriesMap.values())
    console.log(
        '[extractPoolPrices] Returning pool series:',
        result.map((s) => {
            const lastDataPoint = s.data[s.data.length - 1]
            const timestamp = lastDataPoint?.[0]
            let timestampStr = 'N/A'

            if (timestamp && !isNaN(timestamp)) {
                try {
                    timestampStr = new Date(timestamp).toISOString()
                } catch {
                    timestampStr = `Invalid timestamp: ${timestamp}`
                }
            }

            return {
                protocol: s.protocolName,
                dataPoints: s.data.length,
                latestPrice: lastDataPoint?.[1],
                firstPrice: s.data[0]?.[1],
                timestamp: timestampStr,
            }
        }),
    )

    // Log warning if we have series with zero or invalid prices
    result.forEach((series) => {
        const invalidPrices = series.data.filter(([, price]) => price <= 0 || isNaN(price))
        if (invalidPrices.length > 0) {
            console.warn(`[extractPoolPrices] ${series.protocolName} has ${invalidPrices.length} invalid prices`)
        }
    })

    return result
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
        console.warn('[createDiagonalStripePattern] Failed to create pattern:', e)
        return backgroundColor || color
    }
}

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
    targetSpreadBps,
    referencePrice,
    referencePrices,
    poolsData,
    showPoolSeries = false,
    showTradeZonesInTooltip = false,
    className,
}: CandlestickChartProps) {
    const [options, setOptions] = useState<echarts.EChartsOption | null>(null)
    const [poolPriceSeries, setPoolPriceSeries] = useState<PoolPriceSeries[]>([])
    const [isClient, setIsClient] = useState(false)
    const [forceReplace, setForceReplace] = useState(true) // Start with true for initial load
    const zoomStateRef = useRef<{ start: number; end: number }>({ start: 0, end: 100 })
    const prevDataLength = useRef<number>(0)
    const { resolvedTheme } = useTheme()
    const colors = resolvedTheme === 'dark' ? ChartColors.dark : ChartColors.light

    // Set isClient to true after mounting to avoid hydration issues
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Check for mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

    // Data state checks
    const hasData = data && data.length > 0
    const showLoading = isLoading && !hasData
    const showNoData = !isLoading && !hasData && !error

    // Extract pool prices when pools data changes
    useEffect(() => {
        // Don't extract pool prices if there's no main chart data
        if (!data || data.length === 0) {
            console.log('[CandlestickChart] No main chart data, clearing pool series')
            setPoolPriceSeries([])
            return
        }

        if (showPoolSeries && poolsData) {
            console.log('[CandlestickChart] Updating pool series, showPoolSeries:', showPoolSeries, 'poolsData available:', !!poolsData)

            setPoolPriceSeries((prevSeries) => {
                const newPoolSeries = extractPoolPrices(poolsData, prevSeries)
                console.log('[CandlestickChart] Pool series updated:', newPoolSeries.length, 'series')
                return newPoolSeries
            })
        } else if (!showPoolSeries) {
            // Clear pool series when disabled
            console.log('[CandlestickChart] Clearing pool series (showPoolSeries = false)')
            setPoolPriceSeries([])
        }
    }, [poolsData, data, showPoolSeries])

    useEffect(() => {
        // Only clear options if we have no data at all (not during refetches)
        if ((isLoading && !data) || error || !data || data.length === 0) {
            setOptions(null)
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
                    // Add pool series to legend
                    ...(showPoolSeries && poolPriceSeries.length > 0
                        ? poolPriceSeries.map((series) => ({
                              name: series.protocolName,
                              icon: 'roundRect',
                              itemStyle: {
                                  color: series.color,
                              },
                          }))
                        : []),
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
                            <div style="font-size: 12px; font-weight: 500; color: ${colors.milk}; margin-bottom: 4px;">${dateLong}</div>
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
                            // Trading Zone with detailed explanation (only show if enabled)
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const candleData = params.find((p: any) => p.seriesName === chartSeriesNames.ohlc)?.data
                            const candleLow = candleData ? candleData[3] : 0
                            const candleHigh = candleData ? candleData[4] : 0

                            // Check if trading zones are active
                            const buyZoneActive = candleLow < noTradeLower && noTradeLower > 0
                            const sellZoneActive = candleHigh > noTradeUpper && noTradeUpper > 0
                            const isActive = buyZoneActive || sellZoneActive

                            tooltipContent += `
                                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                                    <span style="display: inline-block; width: 10px; height: 10px; background: rgba(255, 100, 100, 0.4); border-radius: 2px; margin-right: 8px;"></span>
                                    <span style="color: ${colors.milkOpacity[600]};">Trade Zones</span>
                                </div>
                                <div style="padding-left: 18px; margin-bottom: 8px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                        <span style="color: ${colors.milkOpacity[400]}; margin-right: 24px;">buy zone</span>
                                        <span style="color: ${colors.milk};">
                                            ${buyZoneActive ? `$${candleLow.toFixed(2)} - $${noTradeLower.toFixed(2)}` : 'inactive'}
                                        </span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                        <span style="color: ${colors.milkOpacity[400]}; margin-right: 24px;">sell zone</span>
                                        <span style="color: ${colors.milk};">
                                            ${sellZoneActive ? `$${noTradeUpper.toFixed(2)} - $${candleHigh.toFixed(2)}` : 'inactive'}
                                        </span>
                                    </div>
                                    <div style="font-size: 10px; color: ${colors.milkOpacity[400]}; margin-top: 4px;">
                                        ${isActive ? 'Bot will execute trades in these ranges' : 'No profitable trades available'}
                                    </div>
                                </div>
                            `
                        } else if (item.seriesName && item.value !== undefined) {
                            // Skip Trade Zone series if showTradeZonesInTooltip is false
                            if (seriesName === chartSeriesNames.lowerTradingZone && !showTradeZonesInTooltip) {
                                return // Skip this series
                            }

                            // Line data (Binance Reference Price, Pool prices)
                            const value = Array.isArray(item.value) ? item.value[1] : item.value

                            // Check if this is a pool series
                            const isPoolSeries = poolPriceSeries.some((s) => s.protocolName === seriesName)

                            // Show color for reference price and pool series
                            const showColor = seriesName === chartSeriesNames.referencePrice || isPoolSeries

                            // Determine the display color
                            let displayColor = item.color
                            if (seriesName === chartSeriesNames.referencePrice) {
                                displayColor = '#F3BA2F'
                            } else if (isPoolSeries) {
                                const poolSeries = poolPriceSeries.find((s) => s.protocolName === seriesName)
                                displayColor = poolSeries?.color || item.color
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
                                return [DAYJS_FORMATS.dateLong(value), DAYJS_FORMATS.timeAgo(value)].join('\n')
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
                // Add pool price series with validation
                ...(showPoolSeries && poolPriceSeries.length > 0
                    ? poolPriceSeries
                          .filter((series) => {
                              // Validate series has valid data
                              if (!series.data || series.data.length === 0) {
                                  console.warn(`[Chart Series] Skipping ${series.protocolName}: no data`)
                                  return false
                              }

                              // Check if any prices are valid
                              const hasValidPrices = series.data.some(([, price]) => price > 0 && !isNaN(price))
                              if (!hasValidPrices) {
                                  console.warn(`[Chart Series] Skipping ${series.protocolName}: no valid prices`)
                                  return false
                              }

                              // For WETH/USDC, ensure prices are in reasonable range
                              if (baseSymbol === 'WETH' && (quoteSymbol === 'USDC' || quoteSymbol === 'USDT')) {
                                  const invalidPrices = series.data.filter(([, price]) => price < 1000 || price > 10000)
                                  if (invalidPrices.length > 0) {
                                      console.warn(
                                          `[Chart Series] ${series.protocolName} has ${invalidPrices.length} out-of-range prices for WETH/USDC`,
                                      )
                                      // Filter out invalid prices instead of skipping entire series
                                      series.data = series.data.filter(([, price]) => price >= 1000 && price <= 10000)
                                  }
                              }

                              return series.data.length > 0
                          })
                          .map((series) => {
                              console.log(
                                  '[Chart Series] Adding pool series:',
                                  series.protocolName,
                                  'with',
                                  series.data.length,
                                  'points, latest price:',
                                  series.data[series.data.length - 1]?.[1],
                              )
                              return {
                                  name: series.protocolName,
                                  type: 'line' as const,
                                  data: series.data,
                                  symbol: 'circle',
                                  symbolSize: 0,
                                  legendHoverLink: true,
                                  showSymbol: false,
                                  lineStyle: {
                                      color: series.color,
                                      width: 2,
                                      cap: 'round' as const,
                                      join: 'round' as const,
                                      opacity: 0.8,
                                  },
                                  emphasis: {
                                      lineStyle: {
                                          width: 3,
                                          opacity: 1,
                                      },
                                  },
                                  z: 12,
                              }
                          })
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
        showPoolSeries,
        poolPriceSeries,
        isClient,
        forceReplace,
        showTradeZonesInTooltip,
    ])

    // Loading and no data state options
    const emptyStateOptions = useMemo((): echarts.EChartsOption => {
        const isLoadingState = isLoading && !data

        if (isLoadingState) {
            // Generate subtle skeleton candlestick data for loading animation
            const dummyDataPoints = 30
            const basePrice = 3400
            const now = Date.now()
            const intervalMs = 3600000 // 1 hour in milliseconds

            const dummyTimestamps = Array.from({ length: dummyDataPoints }, (_, i) => now - (dummyDataPoints - i) * intervalMs)

            // Create smooth wave pattern for skeleton candlesticks
            const dummyOhlc = Array.from({ length: dummyDataPoints }, (_, i) => {
                // Use sine wave for smooth skeleton effect
                const wave = Math.sin(i * 0.3) * 30
                const microVariation = Math.sin(i * 1.5) * 5
                const open = basePrice + wave + microVariation
                const close = open + Math.sin(i * 0.7) * 10
                const high = Math.max(open, close) + Math.abs(Math.sin(i * 0.5) * 8)
                const low = Math.min(open, close) - Math.abs(Math.sin(i * 0.5) * 8)
                return [open, close, low, high]
            })

            return {
                animation: true,
                animationDuration: 2000,
                animationEasing: 'cubicInOut',
                animationDurationUpdate: 1500,
                animationLoop: true,
                tooltip: { show: false },
                xAxis: {
                    type: 'category',
                    data: dummyTimestamps,
                    boundaryGap: false,
                    axisLine: { show: false },
                    axisLabel: {
                        show: true,
                        color: colors.milkOpacity[50],
                        fontSize: 10,
                        formatter: () => '', // Show empty labels for skeleton effect
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
                        show: true,
                        color: colors.milkOpacity[50],
                        fontSize: 10,
                        formatter: () => '', // Show empty labels for skeleton effect
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
                grid: { top: 5, left: 0, right: 55, bottom: 40 },
                series: [
                    {
                        type: 'candlestick',
                        data: dummyOhlc,
                        itemStyle: {
                            color: colors.milkOpacity[100],
                            color0: colors.milkOpacity[100],
                            borderColor: colors.milkOpacity[150],
                            borderColor0: colors.milkOpacity[150],
                            borderWidth: 0.5,
                            opacity: 0.3,
                        },
                        emphasis: {
                            disabled: true,
                        },
                        animation: true,
                        animationDuration: 2000,
                        animationEasing: 'linear',
                        animationDelay: (idx: number) => idx * 30,
                    },
                    // Add subtle shimmer effect
                    {
                        type: 'line',
                        data: dummyOhlc.map((candle, i) => [dummyTimestamps[i], (candle[0] + candle[1]) / 2]),
                        symbol: 'none',
                        lineStyle: {
                            color: colors.milkOpacity[100],
                            width: 1,
                            opacity: 0.2,
                        },
                        animation: true,
                        animationDuration: 3000,
                        animationEasing: 'linear',
                        animationDelay: 500,
                    },
                ],
                graphic: [
                    // Removed "Loading..." text for a cleaner skeleton effect
                ],
            }
        }

        // No data state - ensure clean slate
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
    }, [isLoading, data, isMobile, colors])

    // Determine which options to use
    const displayOptions = showLoading || showNoData ? emptyStateOptions : options

    return (
        <Suspense fallback={<CustomFallback />}>
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <EchartWrapper
                    options={displayOptions || emptyStateOptions}
                    className={cn('size-full', className)}
                    forceReplace={forceReplace || showLoading || showNoData}
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

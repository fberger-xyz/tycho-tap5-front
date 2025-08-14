'use client'

import { useMemo, Suspense } from 'react'
import EchartWrapper, { CustomFallback } from './EchartWrapper'
import { useTheme } from 'next-themes'
import { ChartColors } from '@/config/chart-colors.config'
import { cn } from '@/utils'
import numeral from 'numeral'
import { INTER_FONT } from '@/config'
import type { EChartsOption } from 'echarts'
import { DAYJS_FORMATS } from '@/utils'
import { ErrorBoundaryFallback } from '../common/ErrorBoundaryFallback'
import { ErrorBoundary } from 'react-error-boundary'
import { TradeWithInstanceAndConfiguration } from '@/types'
import { TradeValuesV2, isSuccessfulTrade } from '@/interfaces/database/trade.interface'

interface InventoryChartProps {
    trades: TradeWithInstanceAndConfiguration[]
    baseSymbol?: string
    quoteSymbol?: string
    isLoading?: boolean
    className?: string
}

interface InventoryDataPoint {
    time: number
    baseBalance: number
    quoteBalance: number
    nonce: number
}

// Token decimals configuration
const TOKEN_DECIMALS: Record<string, number> = {
    WETH: 18,
    ETH: 18,
    USDC: 6,
    USDT: 6,
    DAI: 18,
    WBTC: 8,
}

function getTokenDecimals(symbol?: string): number {
    if (!symbol) return 18
    const upperSymbol = symbol.toUpperCase()
    return TOKEN_DECIMALS[upperSymbol] || 18
}

function normalizeBalance(balance: number, decimals: number): number {
    return balance / Math.pow(10, decimals)
}

export default function InventoryChart({ trades, baseSymbol, quoteSymbol, isLoading, className }: InventoryChartProps) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    const { resolvedTheme } = useTheme()
    const colors = resolvedTheme === 'dark' ? ChartColors.dark : ChartColors.light

    // Extract inventory data from trades
    const inventoryData = useMemo(() => {
        const dataPoints: InventoryDataPoint[] = []

        // Filter and process trades
        trades.forEach((trade) => {
            try {
                const tradeValues = trade.values as unknown as TradeValuesV2

                // Only process successful trades with inventory data
                if (isSuccessfulTrade(tradeValues) && tradeValues.data.inventory) {
                    const { nonce, base_balance, quote_balance } = tradeValues.data.inventory
                    const timestamp = new Date(trade.createdAt).getTime()

                    // Get decimals for normalization
                    const baseDecimals = getTokenDecimals(baseSymbol)
                    const quoteDecimals = getTokenDecimals(quoteSymbol)

                    dataPoints.push({
                        time: timestamp,
                        baseBalance: normalizeBalance(base_balance, baseDecimals),
                        quoteBalance: normalizeBalance(quote_balance, quoteDecimals),
                        nonce,
                    })
                }
            } catch (error) {
                console.warn('Failed to process trade for inventory:', error)
            }
        })

        // Sort by time (oldest first)
        return dataPoints.sort((a, b) => a.time - b.time)
    }, [trades, baseSymbol, quoteSymbol])

    // Chart options
    const chartOptions = useMemo(() => {
        if (inventoryData.length === 0) {
            // Show empty state
            return {
                backgroundColor: 'transparent',
                grid: { top: 5, left: 80, right: 80, bottom: isMobile ? 100 : 70 },
                xAxis: {
                    type: 'time' as const,
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: {
                        show: true,
                        color: colors.milkOpacity[400],
                        fontSize: 10,
                    },
                    splitLine: { show: false },
                },
                yAxis: [
                    {
                        type: 'value' as const,
                        position: 'left' as const,
                        axisLine: { show: false },
                        axisLabel: {
                            formatter: (value: number) => numeral(value).format('0,0.[00]'),
                            color: colors.milkOpacity[400],
                            fontSize: 10,
                        },
                        splitLine: {
                            lineStyle: {
                                color: colors.milkOpacity[100],
                                type: 'dashed' as const,
                                opacity: 0.3,
                            },
                        },
                    },
                    {
                        type: 'value' as const,
                        position: 'right' as const,
                        axisLine: { show: false },
                        axisLabel: {
                            formatter: (value: number) => numeral(value).format('0,0.[00]'),
                            color: colors.milkOpacity[400],
                            fontSize: 10,
                        },
                        splitLine: { show: false },
                    },
                ],
                tooltip: { show: false },
                graphic: [
                    {
                        type: 'text',
                        left: 'center',
                        top: 'center',
                        style: {
                            text: 'No trade data available',
                            fontSize: 14,
                            fontWeight: 'normal',
                            fill: colors.milkOpacity[400],
                            fontFamily: INTER_FONT.style.fontFamily,
                        },
                        z: 100,
                    },
                ],
            } as EChartsOption
        }

        // Calculate min/max for y-axes
        const baseBalances = inventoryData.map((d) => d.baseBalance)
        const quoteBalances = inventoryData.map((d) => d.quoteBalance)

        const baseMin = Math.min(...baseBalances) * 0.95
        const baseMax = Math.max(...baseBalances) * 1.05
        const quoteMin = Math.min(...quoteBalances) * 0.95
        const quoteMax = Math.max(...quoteBalances) * 1.05

        // Calculate start percentage for showing last 6 hours
        const calculateDataZoomStart = () => {
            if (inventoryData.length === 0) return 0

            const now = Date.now()
            const sixHoursAgo = now - 6 * 60 * 60 * 1000 // 6 hours in milliseconds
            const firstTime = inventoryData[0].time
            const lastTime = inventoryData[inventoryData.length - 1].time
            const totalDuration = lastTime - firstTime

            if (totalDuration === 0) return 0

            // Find the index of the first data point within the last 6 hours
            const sixHourIndex = inventoryData.findIndex((d) => d.time >= sixHoursAgo)

            if (sixHourIndex === -1) {
                // All data is older than 6 hours, show everything
                return 0
            }

            // Calculate percentage
            const startPercentage = (sixHourIndex / inventoryData.length) * 100
            return Math.max(0, Math.min(startPercentage, 90)) // Cap at 90% to always show some data
        }

        const dataZoomStart = calculateDataZoomStart()

        return {
            backgroundColor: 'transparent',
            // grid: { top: 50, left: 70, right: 70, bottom: isMobile ? 140 : 110 },
            grid: { top: 5, left: 80, right: 80, bottom: isMobile ? 115 : 95 },
            dataZoom: [
                {
                    type: 'slider',
                    show: true,
                    xAxisIndex: [0],
                    start: dataZoomStart,
                    end: 100,
                    bottom: isMobile ? 70 : 50,
                    height: 20,
                    borderColor: colors.milkOpacity[200],
                    backgroundColor: colors.milkOpacity[50],
                    showDataShadow: false,
                    fillerColor: colors.milkOpacity[100],
                    handleStyle: {
                        color: colors.milk,
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2,
                    },
                    textStyle: {
                        color: colors.milkOpacity[600],
                        fontSize: 10,
                    },
                    moveHandleSize: 7,
                    moveHandleStyle: {
                        color: colors.milkOpacity[400],
                    },
                },
                {
                    type: 'inside',
                    xAxisIndex: [0],
                    start: dataZoomStart,
                    end: 100,
                    zoomOnMouseWheel: 'shift',
                    moveOnMouseMove: true,
                    moveOnMouseWheel: true,
                },
            ],
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
                        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
                    },
                },
                splitLine: { show: false },
                axisPointer: {
                    show: true,
                    type: 'line',
                    lineStyle: {
                        color: colors.milkOpacity[400],
                        type: 'dashed',
                    },
                    label: { show: false },
                },
            },
            yAxis: [
                {
                    type: 'value' as const,
                    name: baseSymbol || 'Base',
                    nameLocation: 'middle' as const,
                    nameGap: 50,
                    nameTextStyle: {
                        color: '#10B981',
                        fontSize: 11,
                        fontWeight: 500,
                    },
                    position: 'left' as const,
                    min: baseMin,
                    max: baseMax,
                    axisLine: { show: false },
                    axisLabel: {
                        formatter: (value: number) => numeral(value).format('0,0.[00]'),
                        color: '#10B981',
                        fontSize: 10,
                    },
                    splitLine: {
                        lineStyle: {
                            color: colors.milkOpacity[100],
                            type: 'dashed' as const,
                            opacity: 0.3,
                        },
                    },
                },
                {
                    type: 'value' as const,
                    name: quoteSymbol || 'Quote',
                    nameLocation: 'middle' as const,
                    nameGap: 50,
                    nameTextStyle: {
                        color: '#3B82F6',
                        fontSize: 11,
                        fontWeight: 500,
                    },
                    position: 'right' as const,
                    min: quoteMin,
                    max: quoteMax,
                    axisLine: { show: false },
                    axisLabel: {
                        formatter: (value: number) => numeral(value).format('0,0.[00]'),
                        color: '#3B82F6',
                        fontSize: 10,
                    },
                    splitLine: { show: false },
                },
            ],
            tooltip: {
                borderColor: 'rgba(55, 65, 81, 0.5)',
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

                    const dataIndex = params[0].dataIndex
                    const dataPoint = inventoryData[dataIndex]
                    if (!dataPoint) return ''

                    const timestamp = dataPoint.time
                    const dateLong = DAYJS_FORMATS.dateLong(timestamp)
                    const timeAgo = DAYJS_FORMATS.timeAgo(timestamp)

                    return `
                        <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid ${colors.milkOpacity[100]};">
                            <div style="font-size: 12px; font-weight: 500; color: ${colors.milk}; margin-bottom: 2px;">${dateLong}</div>
                            <div style="font-size: 11px; color: ${colors.milkOpacity[400]};">${timeAgo}</div>
                            <div style="font-size: 10px; color: ${colors.milkOpacity[400]}; margin-top: 4px;">Nonce: ${numeral(dataPoint.nonce).format('0,0')}</div>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                            <div style="display: flex; align-items: center;">
                                <span style="display: inline-block; width: 10px; height: 10px; background: #10B981; border-radius: 2px; margin-right: 8px;"></span>
                                <span style="color: ${colors.milkOpacity[600]};">${baseSymbol || 'Base'}</span>
                            </div>
                            <span style="color: ${colors.milk}; margin-left: 24px;">${numeral(dataPoint.baseBalance).format('0,0.[0000]')}</span>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center;">
                                <span style="display: inline-block; width: 10px; height: 10px; background: #3B82F6; border-radius: 2px; margin-right: 8px;"></span>
                                <span style="color: ${colors.milkOpacity[600]};">${quoteSymbol || 'Quote'}</span>
                            </div>
                            <span style="color: ${colors.milk}; margin-left: 24px;">${numeral(dataPoint.quoteBalance).format('0,0.[00]')}</span>
                        </div>
                    `
                },
            },
            series: [
                {
                    name: baseSymbol || 'Base',
                    type: 'line' as const,
                    yAxisIndex: 0,
                    data: inventoryData.map((d) => [d.time, d.baseBalance]),
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 4,
                    lineStyle: {
                        color: '#10B981',
                        width: 2,
                    },
                    itemStyle: {
                        color: '#10B981',
                    },
                    emphasis: {
                        focus: 'series',
                        lineStyle: {
                            width: 3,
                        },
                    },
                },
                {
                    name: quoteSymbol || 'Quote',
                    type: 'line' as const,
                    yAxisIndex: 1,
                    data: inventoryData.map((d) => [d.time, d.quoteBalance]),
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 4,
                    lineStyle: {
                        color: '#3B82F6',
                        width: 2,
                    },
                    itemStyle: {
                        color: '#3B82F6',
                    },
                    emphasis: {
                        focus: 'series',
                        lineStyle: {
                            width: 3,
                        },
                    },
                },
            ],
            legend: {
                show: true,
                bottom: isMobile ? 10 : 10,
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
                    {
                        name: baseSymbol || 'Base',
                        icon: 'roundRect',
                        itemStyle: { color: '#10B981' },
                    },
                    {
                        name: quoteSymbol || 'Quote',
                        icon: 'roundRect',
                        itemStyle: { color: '#3B82F6' },
                    },
                ],
            },
        } as EChartsOption
    }, [inventoryData, baseSymbol, quoteSymbol, colors, isMobile])

    // Loading state
    const loadingOptions = useMemo((): EChartsOption => {
        const now = Date.now()
        const skeletonPoints = 30
        const timePoints = Array.from({ length: skeletonPoints }, (_, i) => now - (skeletonPoints - i - 1) * 60000)

        const createSkeletonLine = (offset: number, base: number, amplitude: number) => {
            return timePoints.map((time, i) => {
                const wave = Math.sin((i + offset) * 0.2) * amplitude
                return [time, base + wave]
            })
        }

        return {
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 2000,
            animationEasing: 'cubicInOut',
            animationLoop: true,
            grid: { top: 50, left: 70, right: 70, bottom: isMobile ? 100 : 70 },
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
            yAxis: [
                {
                    type: 'value',
                    position: 'left',
                    nameGap: 40,
                    axisLine: { show: false },
                    axisLabel: {
                        show: true,
                        color: colors.milkOpacity[100],
                        fontSize: 10,
                        formatter: () => '•••',
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
                {
                    type: 'value',
                    position: 'right',
                    nameGap: 40,
                    axisLine: { show: false },
                    axisLabel: {
                        show: true,
                        color: colors.milkOpacity[100],
                        fontSize: 10,
                        formatter: () => '•••',
                    },
                    splitLine: { show: false },
                },
            ],
            series: [
                {
                    name: 'skeleton1',
                    type: 'line',
                    yAxisIndex: 0,
                    data: createSkeletonLine(0, 0.05, 0.005),
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
                {
                    name: 'skeleton2',
                    type: 'line',
                    yAxisIndex: 1,
                    data: createSkeletonLine(10, 1000, 50),
                    smooth: true,
                    symbol: 'none',
                    lineStyle: {
                        color: colors.milkOpacity[150],
                        width: 2,
                        opacity: 0.5,
                    },
                    animation: true,
                    animationDuration: 3000,
                    animationDelay: 200,
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
        }
    }, [isMobile, colors])

    const options = isLoading ? loadingOptions : chartOptions

    return (
        <Suspense fallback={<CustomFallback />}>
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <EchartWrapper options={options} className={cn('size-full', className)} forceReplace={isLoading} />
            </ErrorBoundary>
        </Suspense>
    )
}

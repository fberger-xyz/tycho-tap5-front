'use client'

import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTheme } from 'next-themes'
import { ChartColors } from '@/config/chart-colors.config'
import { cn } from '@/utils'
import numeral from 'numeral'

interface PoolData {
    protocol: string
    pool: string
    price: number
    liquidity?: number
}

interface SpreadChartProps {
    referencePrice?: number
    poolsData?: PoolData[]
    targetSpreadBps: number
    baseSymbol?: string
    quoteSymbol?: string
    isLoading?: boolean
    error?: Error | null
    className?: string
}

export default function SpreadChart({
    referencePrice,
    poolsData,
    targetSpreadBps,
    baseSymbol = 'Base',
    quoteSymbol = 'Quote',
    isLoading,
    error,
    className,
}: SpreadChartProps) {
    const { resolvedTheme } = useTheme()
    const colors = resolvedTheme === 'dark' ? ChartColors.dark : ChartColors.light

    const chartOptions = useMemo(() => {
        if (!referencePrice || !poolsData || poolsData.length === 0) {
            return null
        }

        // Calculate spread for each pool
        const poolsWithSpread = poolsData.map((pool) => {
            const spreadBps = ((pool.price - referencePrice) / referencePrice) * 10000
            return {
                ...pool,
                spreadBps,
                label: `${pool.protocol}\n${pool.pool.slice(0, 6)}...${pool.pool.slice(-4)}`,
            }
        })

        // Sort by absolute spread
        poolsWithSpread.sort((a, b) => Math.abs(a.spreadBps) - Math.abs(b.spreadBps))

        // Prepare data for chart
        const xAxisData = poolsWithSpread.map((p) => p.label)
        const spreadData = poolsWithSpread.map((p) => p.spreadBps)
        const liquidityData = poolsWithSpread.map((p) => p.liquidity || 0)

        // Calculate y-axis range
        const maxSpread = Math.max(...spreadData.map(Math.abs), targetSpreadBps * 2)
        const yAxisRange = [-maxSpread, maxSpread]

        return {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: colors.bg,
                borderColor: colors.border,
                textStyle: { color: colors.text },
                formatter: (params: any) => {
                    const pool = poolsWithSpread[params[0].dataIndex]
                    return `
                        <div style="padding: 8px;">
                            <div style="font-weight: bold; margin-bottom: 4px;">${pool.protocol}</div>
                            <div style="font-size: 12px; color: ${colors.textMuted}; margin-bottom: 8px;">${pool.pool}</div>
                            <div>Price: ${numeral(pool.price).format('0,0.00')}</div>
                            <div>Spread: ${pool.spreadBps > 0 ? '+' : ''}${numeral(pool.spreadBps).format('0.00')} bps</div>
                            ${pool.liquidity ? `<div>Liquidity: $${numeral(pool.liquidity).format('0,0')}</div>` : ''}
                        </div>
                    `
                },
            },
            grid: {
                left: 80,
                right: 80,
                top: 60,
                bottom: 100,
            },
            xAxis: {
                type: 'category',
                data: xAxisData,
                axisLine: { lineStyle: { color: colors.grid } },
                axisLabel: {
                    color: colors.textMuted,
                    fontSize: 10,
                    rotate: 45,
                    interval: 0,
                },
                splitLine: { show: false },
            },
            yAxis: {
                type: 'value',
                min: yAxisRange[0],
                max: yAxisRange[1],
                axisLine: { lineStyle: { color: colors.grid } },
                axisLabel: {
                    color: colors.textMuted,
                    formatter: (value: number) => `${value > 0 ? '+' : ''}${value}`,
                },
                splitLine: {
                    lineStyle: { color: colors.grid, type: 'dashed' },
                },
            },
            series: [
                {
                    name: 'Spread',
                    type: 'bar',
                    data: spreadData,
                    itemStyle: {
                        color: (params: any) => {
                            const value = params.value
                            if (Math.abs(value) <= targetSpreadBps) {
                                return colors.aquamarine
                            }
                            return colors.folly
                        },
                    },
                    barMaxWidth: 40,
                },
                // Reference lines
                {
                    type: 'line',
                    markLine: {
                        silent: true,
                        symbol: 'none',
                        lineStyle: {
                            color: colors.primary,
                            type: 'solid',
                            width: 2,
                        },
                        label: {
                            color: colors.text,
                            formatter: 'Reference Price',
                            position: 'end',
                        },
                        data: [{ yAxis: 0 }],
                    },
                },
                // Target spread lines
                {
                    type: 'line',
                    markLine: {
                        silent: true,
                        symbol: 'none',
                        lineStyle: {
                            color: colors.warning,
                            type: 'dashed',
                            width: 1,
                        },
                        label: {
                            color: colors.textMuted,
                            fontSize: 10,
                            formatter: `±${targetSpreadBps} bps`,
                        },
                        data: [
                            { yAxis: targetSpreadBps },
                            { yAxis: -targetSpreadBps },
                        ],
                    },
                },
            ],
            title: {
                left: 'center',
                text: `${baseSymbol}/${quoteSymbol} Pool Spreads`,
                subtext: referencePrice ? `Binance Reference: ${numeral(referencePrice).format('0,0.00')}` : '',
                textStyle: {
                    color: colors.text,
                    fontSize: 14,
                },
                subtextStyle: {
                    color: colors.textMuted,
                    fontSize: 12,
                },
            },
            legend: {
                show: false,
            },
        }
    }, [referencePrice, poolsData, targetSpreadBps, baseSymbol, quoteSymbol, colors])

    if (isLoading) {
        return (
            <div className={cn('flex items-center justify-center h-[400px]', className)}>
                <div className="text-milk-600">Loading spread data...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={cn('flex items-center justify-center h-[400px]', className)}>
                <div className="text-folly">Error loading spread data</div>
            </div>
        )
    }

    if (!referencePrice) {
        return (
            <div className={cn('flex items-center justify-center h-[400px]', className)}>
                <div className="text-milk-600">Waiting for reference price...</div>
            </div>
        )
    }

    if (!poolsData || poolsData.length === 0) {
        return (
            <div className={cn('flex items-center justify-center h-[400px]', className)}>
                <div className="text-milk-600">No pool data available</div>
            </div>
        )
    }

    if (!chartOptions) {
        return (
            <div className={cn('flex items-center justify-center h-[400px]', className)}>
                <div className="text-milk-600">Insufficient data</div>
            </div>
        )
    }

    return (
        <div className={cn('w-full h-full min-h-[400px]', className)}>
            <ReactECharts
                option={chartOptions}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
                theme={resolvedTheme}
            />
        </div>
    )
}
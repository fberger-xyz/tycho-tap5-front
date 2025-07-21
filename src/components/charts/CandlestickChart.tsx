'use client'

import { useEffect, useState } from 'react'
import * as echarts from 'echarts'
import numeral from 'numeral'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { ErrorBoundary } from 'react-error-boundary'
import { Suspense } from 'react'
import EchartWrapper, { ChartBackground, CustomFallback, LoadingArea } from './EchartWrapper'
import { ErrorBoundaryFallback } from '../common/ErrorBoundaryFallback'
import { AppColors, INTER_FONT } from '@/config'

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
}

export default function CandlestickChart({
    data,
    isLoading = false,
    error = null,
    symbol = 'Chart',
    baseSymbol = '',
    quoteSymbol = '',
    upColor = AppColors.aquamarine,
    downColor = AppColors.folly,
    // loadingMessage = 'Loading chart data...',
}: CandlestickChartProps) {
    const [options, setOptions] = useState<echarts.EChartsOption | null>(null)

    useEffect(() => {
        if (isLoading || error || !data || data.length === 0) {
            setOptions(null)
            return
        }

        const timestamps = data.map((item) => item.time)
        const ohlc = data.map((item) => [item.open, item.close, item.low, item.high])
        const volumes = data.map((item, index) => [index, item.volume || 0, item.open > item.close ? 1 : -1])

        const chartOptions: echarts.EChartsOption = {
            animation: true,
            tooltip: {
                trigger: 'axis',
                appendToBody: true,
                triggerOn: 'mousemove|click',
                backgroundColor: '#FFF4E005',
                borderRadius: 12,
                axisPointer: {
                    type: 'cross',
                    lineStyle: {
                        color: AppColors.milk.DEFAULT,
                        width: 2,
                        type: 'dotted',
                    },
                    label: {
                        backgroundColor: AppColors.milk[200],
                    },
                },
                borderColor: AppColors.milk[200],
                textStyle: {
                    fontSize: 12,
                    color: AppColors.milk.DEFAULT,
                },
                extraCssText: 'backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding:12px;',
                formatter: (params) => {
                    if (!Array.isArray(params) || params.length === 0) return ''

                    const candleData = params[0]
                    const volumeData = params[1]

                    if (!candleData || !candleData.data) return ''

                    const [open, close, low, high] = candleData.data as number[]
                    const timestamp = timestamps[candleData.dataIndex]
                    const volume = (volumeData?.data as number[])?.[1] || 0

                    const priceChange = close - open
                    const priceChangePercent = (priceChange / open) * 100
                    const changeColor = priceChange >= 0 ? AppColors.aquamarine : AppColors.folly

                    const pairDisplay = baseSymbol && quoteSymbol ? `${baseSymbol}/${quoteSymbol}` : symbol

                    return [
                        `<strong>${pairDisplay}</strong>`,
                        `<span style="color:${AppColors.milk[200]}">${dayjs(timestamp).format('MMM D, YYYY HH:mm')} UTC</span>`,
                        `<br/>`,
                        `<strong>Open</strong> <span style="color:${AppColors.milk[600]}">${numeral(open).format('0,0.[00000000]')}</span>`,
                        `<strong>High</strong> <span style="color:${AppColors.milk[600]}">${numeral(high).format('0,0.[00000000]')}</span>`,
                        `<strong>Low</strong> <span style="color:${AppColors.milk[600]}">${numeral(low).format('0,0.[00000000]')}</span>`,
                        `<strong>Close</strong> <span style="color:${AppColors.milk[600]}">${numeral(close).format('0,0.[00000000]')}</span>`,
                        `<br/>`,
                        `<strong>Change</strong> <span style="color:${changeColor}">${priceChange >= 0 ? '+' : ''}${numeral(priceChange).format('0,0.[00000000]')} (${priceChange >= 0 ? '+' : ''}${numeral(priceChangePercent).format('0,0.[00]')}%)</span>`,
                        volume > 0
                            ? `<strong>Volume</strong> <span style="color:${AppColors.milk[600]}">${numeral(volume).format('0,0.[00]')}</span>`
                            : '',
                    ]
                        .filter(Boolean)
                        .join('<br/>')
                },
            },
            grid: [
                { top: '5%', left: '1%', right: '8%', height: '65%' },
                { top: '75%', left: '1%', right: '8%', height: '12%' },
            ],
            toolbox: {
                top: -5,
                show: false,
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none',
                    },
                    restore: { show: true },
                    saveAsImage: { show: true },
                    dataView: { show: true, readOnly: false },
                },
                itemSize: 8,
            },
            legend: {
                show: false,
            },
            xAxis: [
                {
                    id: 'ohlcv',
                    type: 'category',
                    data: timestamps,
                    boundaryGap: false,
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        formatter: (value) => dayjs(Number(value)).format('MMM D'),
                        color: AppColors.milk[200],
                        fontSize: 10,
                        margin: 15,
                        hideOverlap: true,
                        showMinLabel: true,
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
                            backgroundColor: '#FFF4E005',
                            color: AppColors.milk.DEFAULT,
                            borderColor: 'transparent',
                        },
                    },
                    axisLine: {
                        lineStyle: {
                            color: AppColors.milk[150],
                        },
                    },
                    axisTick: {
                        show: false,
                    },
                    min: 'dataMin',
                    max: 'dataMax',
                },
                {
                    id: 'volume',
                    type: 'category',
                    gridIndex: 1,
                    data: timestamps,
                    axisLabel: { show: false },
                    splitLine: {
                        show: false,
                    },
                    axisLine: {
                        lineStyle: {
                            color: AppColors.milk[150],
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
                        formatter: (value: string) => numeral(value).format('0,0.[00000000]'),
                        color: AppColors.milk[200],
                        fontSize: 11,
                        margin: 10,
                        hideOverlap: true,
                        showMinLabel: true,
                        showMaxLabel: true,
                    },
                    splitLine: {
                        show: true,
                        lineStyle: { color: AppColors.milk[50], type: 'dashed' },
                    },
                    axisLine: {
                        show: false,
                    },
                },
                {
                    scale: true,
                    position: 'right',
                    gridIndex: 1,
                    axisLabel: {
                        formatter: (value: string) => {
                            const num = Number(value)
                            if (num >= 1000000) return numeral(num / 1000000).format('0.[0]') + 'M'
                            if (num >= 1000) return numeral(num / 1000).format('0.[0]') + 'K'
                            return numeral(num).format('0.[0]')
                        },
                        color: AppColors.milk[200],
                        fontSize: 10,
                        margin: 10,
                    },
                    splitLine: {
                        show: false,
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
                    height: 25,
                    bottom: 25,
                    backgroundColor: AppColors.milk[50],
                    fillerColor: 'transparent',
                    borderColor: AppColors.milk[200],
                    labelFormatter: (valueIndex) => dayjs(timestamps[valueIndex]).format('MMM D'),
                    textStyle: { color: AppColors.milk[200], fontSize: 10 },
                    handleLabel: { show: true },
                    dataBackground: { lineStyle: { color: 'transparent' }, areaStyle: { color: 'transparent' } },
                    selectedDataBackground: { lineStyle: { color: AppColors.milk[200] }, areaStyle: { color: AppColors.milk[50] } },
                    brushStyle: { color: 'transparent' },
                    handleStyle: { color: AppColors.milk[600], borderColor: AppColors.milk[600] },
                    moveHandleStyle: { color: AppColors.milk[200] },
                    emphasis: {
                        handleLabel: { show: true },
                        moveHandleStyle: { color: AppColors.milk[400] },
                    },
                    rangeMode: ['value', 'value'],
                    left: 60,
                    right: 90,
                },
                {
                    xAxisIndex: 0,
                    type: 'inside',
                },
            ],
            textStyle: {
                color: AppColors.milk[600],
                fontFamily: INTER_FONT.style.fontFamily,
            },
            series: [
                {
                    name: symbol,
                    type: 'candlestick',
                    data: ohlc,
                    itemStyle: {
                        color: upColor,
                        color0: downColor,
                        borderColor: upColor,
                        borderColor0: downColor,
                        borderWidth: 1,
                    },
                    emphasis: {
                        itemStyle: {
                            borderWidth: 2,
                        },
                    },
                },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: volumes,
                    itemStyle: {
                        opacity: 0.5,
                    },
                },
            ],
            visualMap: [
                {
                    show: false,
                    seriesIndex: 1,
                    dimension: 2,
                    pieces: [
                        { value: 1, color: downColor },
                        { value: -1, color: upColor },
                    ],
                },
            ],
        }

        setOptions(chartOptions)
    }, [data, isLoading, error, symbol, baseSymbol, quoteSymbol, upColor, downColor])

    return (
        <Suspense fallback={<CustomFallback />}>
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <ChartBackground className="relative h-[450px]">
                    {isLoading || !options ? <LoadingArea /> : <EchartWrapper options={options} />}
                </ChartBackground>
            </ErrorBoundary>
        </Suspense>
    )
}

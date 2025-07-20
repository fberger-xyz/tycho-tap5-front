'use client'

import { useEffect, useState } from 'react'
import * as echarts from 'echarts'
import numeral from 'numeral'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { ErrorBoundary } from 'react-error-boundary'
import { Suspense } from 'react'
import { ChartBackground, LoadingArea, CustomFallback } from './ChartsCommons'
import EchartWrapper from './EchartWrapper'
import { ErrorBoundaryFallback } from '../common/ErrorBoundaryFallback'
import { AppColors } from '@/config'

dayjs.extend(timezone)

export interface CandlestickDataPoint {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume?: number
}

export interface CandlestickChartProps {
    data: CandlestickDataPoint[] | null
    isLoading?: boolean
    error?: Error | null
    symbol?: string
    upColor?: string
    downColor?: string
    loadingMessage?: string
}

export default function CandlestickChart({
    data,
    isLoading = false,
    error = null,
    symbol = 'Chart',
    upColor = AppColors.aquamarine,
    downColor = AppColors.folly,
    loadingMessage = 'Loading chart data...',
}: CandlestickChartProps) {
    const [options, setOptions] = useState<echarts.EChartsOption | null>(null)

    useEffect(() => {
        if (isLoading || error || !data || data.length === 0) {
            const loadingOptions = generateLoadingOptions(loadingMessage)
            setOptions(loadingOptions)
            return
        }

        const timestamps = data.map((item) => item.time)
        const ohlc = data.map((item) => [item.open, item.close, item.low, item.high])
        const volumes = data.map((item, index) => [index, item.volume || 0, item.open > item.close ? 1 : -1])

        const chartOptions: echarts.EChartsOption = {
            animation: true,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: AppColors.jagger[800],
                    },
                },
                backgroundColor: AppColors.jagger[800],
                borderColor: AppColors.jagger[400],
                borderRadius: 6,
                textStyle: {
                    fontSize: 12,
                    color: AppColors.default,
                },
                extraCssText: 'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);',
            },
            grid: [
                { top: '5%', left: '4%', right: '6%', height: '50%' },
                { top: '67%', left: '4%', right: '6%', height: '15%' },
            ],
            toolbox: {
                top: -7,
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
                        formatter: (value) => `${dayjs(Number(value)).tz('UTC').format('HH:mm')} UTC`,
                        color: AppColors.jagger[400],
                        margin: 15,
                        hideOverlap: true,
                        showMinLabel: true,
                        showMaxLabel: true,
                    },
                    axisPointer: {
                        label: {
                            show: true,
                            formatter: ({ value }) => dayjs(Number(value)).tz('UTC').format('MMM D, HH:mm'),
                        },
                    },
                    axisLine: {
                        lineStyle: {
                            color: AppColors.jagger[400],
                        },
                    },
                    axisTick: {
                        show: true,
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
                    axisPointer: {
                        label: {
                            show: true,
                            formatter: ({ value }) => dayjs(Number(value)).tz('UTC').format('MMM D, HH:mm'),
                        },
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
                        color: AppColors.jagger[400],
                        fontSize: 12,
                        margin: 15,
                        hideOverlap: true,
                        showMinLabel: true,
                        showMaxLabel: true,
                    },
                    splitLine: {
                        show: true,
                        lineStyle: { color: AppColors.jagger[800], type: 'dashed' },
                    },
                },
                {
                    scale: true,
                    position: 'right',
                    gridIndex: 1,
                    axisLabel: {
                        formatter: (value: string) => numeral(value).format('0,0.[00000000]'),
                        color: AppColors.jagger[400],
                        fontSize: 12,
                        margin: 15,
                        hideOverlap: true,
                        showMinLabel: true,
                        showMaxLabel: true,
                    },
                    splitLine: {
                        show: true,
                        lineStyle: { color: AppColors.jagger[800], type: 'dashed' },
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
            brush: {
                xAxisIndex: 'all',
                brushLink: 'all',
                outOfBrush: {
                    colorAlpha: 0.1,
                },
            },
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
            dataZoom: [
                {
                    type: 'slider',
                    xAxisIndex: 0,
                    height: 34,
                    bottom: 10,
                    show: true,
                    backgroundColor: 'transparent',
                    fillerColor: 'transparent',
                    borderColor: AppColors.jagger[400],
                    labelFormatter: (valueIndex) => `${dayjs(timestamps[valueIndex]).tz('UTC').format('MMM D, HH:mm')} UTC`.split(',').join('\n'),
                    textStyle: { color: AppColors.default, fontSize: 10 },
                    handleLabel: { show: true },
                    dataBackground: { lineStyle: { color: 'transparent' }, areaStyle: { color: 'transparent' } },
                    selectedDataBackground: { lineStyle: { color: AppColors.jagger[800] }, areaStyle: { color: AppColors.jagger[400] } },
                    brushStyle: { color: 'transparent' },
                    handleStyle: { color: AppColors.jagger[400], borderColor: AppColors.jagger[800] },
                    moveHandleStyle: { color: AppColors.jagger[400] },
                    emphasis: {
                        handleLabel: { show: true },
                        moveHandleStyle: { color: AppColors.default },
                    },
                    rangeMode: ['value', 'value'],
                    left: '10%',
                    right: '10%',
                },
                { type: 'inside', xAxisIndex: 0 },
            ],
            series: [
                {
                    name: symbol,
                    type: 'candlestick',
                    data: ohlc,
                    itemStyle: {
                        color: upColor,
                        color0: downColor,
                        borderColor: undefined,
                        borderColor0: undefined,
                    },
                },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: volumes,
                    color: 'gray',
                    tooltip: {
                        trigger: 'axis',
                    },
                },
            ],
        }

        setOptions(chartOptions)
    }, [data, isLoading, error, symbol, upColor, downColor, loadingMessage])

    return (
        <Suspense fallback={<CustomFallback />}>
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <ChartBackground className="relative h-[400px]">{options ? <EchartWrapper options={options} /> : <LoadingArea />}</ChartBackground>
            </ErrorBoundary>
        </Suspense>
    )
}

function generateLoadingOptions(loadingMessage: string): echarts.EChartsOption {
    return {
        graphic: {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
                text: loadingMessage,
                fontSize: 24,
                fontWeight: 'bold',
                fill: AppColors.jagger[400],
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            },
            keyframeAnimation: {
                duration: 3000,
                loop: true,
                keyframes: [
                    {
                        percent: 0,
                        style: { opacity: 0.3 },
                    },
                    {
                        percent: 0.5,
                        style: { opacity: 1 },
                    },
                    {
                        percent: 1,
                        style: { opacity: 0.3 },
                    },
                ],
            },
        },
        xAxis: {
            type: 'category',
            axisLine: {
                lineStyle: { color: AppColors.jagger[400] },
            },
            splitLine: {
                show: false,
            },
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: { color: AppColors.jagger[400] },
            },
            splitLine: {
                lineStyle: { color: AppColors.jagger[800], type: 'dashed' },
            },
        },
        grid: {
            left: '4%',
            right: '6%',
            top: '5%',
            bottom: '10%',
        },
    }
}

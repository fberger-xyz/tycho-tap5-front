'use client'

import EchartWrapper from './EchartWrapper'
import { EChartsOption } from 'echarts'

interface MiniLineChartProps {
    data: number[]
    className?: string
}

export default function MiniLineChart({ data, className }: MiniLineChartProps) {
    const options: EChartsOption = {
        grid: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
        xAxis: {
            type: 'category',
            show: false,
            data: data.map((_, index) => index),
        },
        yAxis: {
            type: 'value',
            show: false,
        },
        series: [
            {
                type: 'line',
                data: data,
                smooth: true,
                showSymbol: false,
                lineStyle: {
                    color: '#70D7A7',
                    width: 2,
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: 'rgba(112, 215, 167, 0.1)',
                            },
                            {
                                offset: 1,
                                color: 'rgba(112, 215, 167, 0)',
                            },
                        ],
                    },
                },
            },
        ],
        tooltip: {
            show: false,
        },
        animation: false,
    }

    return <EchartWrapper options={options} className={className} />
}

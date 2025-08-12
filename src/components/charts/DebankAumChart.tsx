'use client'

import EchartWrapper from './EchartWrapper'
import { EChartsOption } from 'echarts'
import { AppColors } from '@/config/theme.config'
import numeral from 'numeral'
import { DAYJS_FORMATS } from '@/utils/date.util'

// Helper to convert HSL with CSS variables to hex color
const getComputedColor = (color: string): string => {
    // For colors like 'hsl(var(--color-aquamarine))', we need to use a fallback
    // Since we can't access CSS variables in Node/SSR context
    if (color.includes('aquamarine')) return '#00ffbb'
    if (color.includes('folly')) return '#ff3366'
    // For standard Tailwind colors, they should be hex values
    return color
}

export default function DebankAumChart({ data, className }: { data: number[] | Array<{ timestamp: number; value: number }>; className?: string }) {
    // Check if data is simple number array or array of objects
    const isSimpleArray = typeof data[0] === 'number'

    // Normalize data to always work with objects internally
    const normalizedData = isSimpleArray
        ? (data as number[]).map((value, index) => ({
              timestamp: Date.now() - (data.length - index - 1) * 60000, // Mock timestamps, 1 minute apart
              value,
          }))
        : (data as Array<{ timestamp: number; value: number }>)

    const values = normalizedData.map((d) => d.value)
    const maxValue = Math.max(...values)
    const lineColor = getComputedColor(AppColors.aquamarine)

    const options: EChartsOption = {
        grid: {
            left: 0,
            right: 35,
            top: 4,
            bottom: 0,
        },
        xAxis: {
            type: 'category',
            show: true,
            data: normalizedData.map((_, index) => index), // Use indices for x-axis
            boundaryGap: false, // This ensures the line starts and ends at the edges
            axisLine: {
                show: false,
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: AppColors.gray[50],
                    opacity: 0.02,
                },
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                show: false,
            },
        },
        yAxis: {
            type: 'value',
            show: true,
            max: maxValue,
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            splitLine: {
                show: false,
            },
            axisLabel: {
                show: false,
            },
        },
        series: [
            {
                type: 'line',
                data: values,
                smooth: true,
                showSymbol: false,
                lineStyle: {
                    color: lineColor,
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
                                color: `${lineColor}0D`, // 5% opacity
                            },
                            {
                                offset: 1,
                                color: `${lineColor}00`, // 0% opacity
                            },
                        ],
                    },
                },
                endLabel: {
                    show: true,
                    formatter: (params: { value: unknown }) => `$${numeral(params.value).format('0,0a')}`,
                    color: AppColors.gray[500],
                    fontSize: 10,
                    opacity: 0.5,
                    // offset: [5, 0],
                },
            },
        ],
        tooltip: {
            show: true,
            appendToBody: true,
            trigger: 'axis',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: AppColors.gray[300],
                    width: 1,
                    type: 'dashed',
                },
            },
            // backgroundColor: 'rgba(17, 24, 39, 0.95)', // dark background with slight transparency
            borderColor: 'rgba(55, 65, 81, 0.5)', // subtle border
            triggerOn: 'mousemove|click',
            backgroundColor: '#FFF4E005',
            borderRadius: 12,
            extraCssText: 'backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding:12px;',
            borderWidth: 1,
            padding: [6, 10],
            textStyle: {
                color: '#F3F4F6', // light gray text
                fontSize: 11,
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => {
                if (!params[0]) return ''
                const dataIndex = params[0].dataIndex
                const timestamp = normalizedData[dataIndex].timestamp
                const value = params[0].value

                return `
                    <div style="line-height: 1.5;">
                        <div style="font-size: 10px; opacity: 0.7;">${DAYJS_FORMATS.dateShort(timestamp)} UTC</div>
                        <div style="font-weight: 500;">AUM = $${numeral(value).format('0,0.[00]')}</div>
                    </div>
                `
            },
        },
        animation: false,
    }

    return <EchartWrapper options={options} className={className} />
}
